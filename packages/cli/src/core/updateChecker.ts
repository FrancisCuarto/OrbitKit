import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchCatalog, type Catalog, type CatalogSkill } from './catalog.js';
import { readConfig } from './config.js';
import { readState, writeState } from './state.js';
import { compareSemver, getCurrentCliVersion } from './selfUpdater.js';
import { inspectProject } from './scanner.js';

export interface UpdateReport {
  checkedAt: number;
  offline: boolean;
  fromCache: boolean;
  catalogGeneratedAt?: string;
  cli?: {
    current: string;
    latest: string;
    updateAvailable: boolean;
    major: boolean;
    belowMin: boolean;
  };
  newSkills: CatalogSkill[];
  outdatedSkills: { id: string; from: string; to: string }[];
  errors: string[];
}

export function nextWithJitter(baseIntervalMs: number, now = Date.now()): number {
  return now + Math.round(baseIntervalMs * (0.85 + Math.random() * 0.3));
}

export function backoffMs(baseIntervalMs: number, failures: number): number {
  const maxWeekMs = 7 * 24 * 60 * 60_000;
  return Math.min(baseIntervalMs * 2 ** Math.min(Math.max(failures, 1), 4), maxWeekMs);
}

export async function readInstalledSkills(
  projectDir: string
): Promise<{ id: string; version: string }[]> {
  const seen = new Map<string, string>();
  const skillDirs = [
    path.join(projectDir, '.agents', 'skills'),
    path.join(projectDir, '.claude', 'skills')
  ];

  for (const baseDir of skillDirs) {
    try {
      const entries = await fs.readdir(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || seen.has(entry.name)) {
          continue;
        }
        const metaPath = path.join(baseDir, entry.name, 'skill.json');
        try {
          const raw = await fs.readFile(metaPath, 'utf8');
          const parsed = JSON.parse(raw);
          const version = typeof parsed.version === 'string' ? parsed.version : '1.0.0';
          seen.set(entry.name, version);
        } catch {
          // Directory exists without valid skill.json; still mark installed at 0.0.0
          seen.set(entry.name, '0.0.0');
        }
      }
    } catch {
      // Directory does not exist
    }
  }

  return Array.from(seen.entries()).map(([id, version]) => ({ id, version }));
}

export async function detectProjectGodotVersion(projectDir: string): Promise<string | null> {
  try {
    const project = await inspectProject(projectDir);
    for (const feat of project.godotFeatures) {
      if (/^\d+\.\d+/.test(feat)) {
        return feat;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function toThreePartSemver(ver: string): string {
  const clean = ver.replace(/^v/, '').trim();
  const parts = clean.split('.');
  while (parts.length < 3) {
    parts.push('0');
  }
  return parts.slice(0, 3).join('.');
}

export function meetsGodot(skill: CatalogSkill, projectGodotVersion: string | null): boolean {
  if (!skill.minGodot || !projectGodotVersion) {
    return true;
  }
  return (
    compareSemver(toThreePartSemver(projectGodotVersion), toThreePartSemver(skill.minGodot)) >= 0
  );
}

async function computeDiffFromCatalog(
  projectDir: string,
  catalog: Catalog,
  channel: 'stable' | 'beta'
): Promise<Pick<UpdateReport, 'catalogGeneratedAt' | 'cli' | 'newSkills' | 'outdatedSkills'>> {
  const [installed, godotVersion, currentCli] = await Promise.all([
    readInstalledSkills(projectDir),
    detectProjectGodotVersion(projectDir),
    getCurrentCliVersion()
  ]);

  const installedIds = new Set(installed.map((s) => s.id));

  const newSkills = catalog.skills.filter((s) => {
    const channelMatch = channel === 'beta' ? true : s.channel === 'stable';
    return channelMatch && !installedIds.has(s.id) && meetsGodot(s, godotVersion);
  });

  const outdatedSkills = installed.flatMap((local) => {
    const remote = catalog.skills.find((s) => s.id === local.id);
    if (!remote) return [];
    const channelMatch = channel === 'beta' ? true : remote.channel === 'stable';
    if (!channelMatch) return [];
    if (!meetsGodot(remote, godotVersion)) return [];
    return compareSemver(remote.version, local.version) > 0
      ? [{ id: local.id, from: local.version, to: remote.version }]
      : [];
  });

  const latestCli = catalog.cli.latest;
  const minSupportedCli = catalog.cli.minSupported;
  const updateAvailable = compareSemver(latestCli, currentCli) > 0;
  const latestMajor = Number(latestCli.replace(/^v/, '').split('.')[0]) || 0;
  const currentMajor = Number(currentCli.replace(/^v/, '').split('.')[0]) || 0;
  const major = latestMajor > currentMajor;
  const belowMin = compareSemver(currentCli, minSupportedCli) < 0;

  return {
    catalogGeneratedAt: catalog.generatedAt,
    cli: {
      current: currentCli,
      latest: latestCli,
      updateAvailable,
      major,
      belowMin
    },
    newSkills,
    outdatedSkills
  };
}

/**
 * Checks for CLI and AI Skill updates against the remote catalog with ETag caching and offline fallback.
 * Never throws; any errors are collected in report.errors.
 */
export async function checkForUpdates(
  projectDir: string,
  opts?: { force?: boolean; catalogUrl?: string; cacheOnly?: boolean }
): Promise<UpdateReport> {
  const errors: string[] = [];
  const now = Date.now();

  try {
    const cfg = await readConfig(projectDir, errors);
    const state = await readState();
    const baseIntervalMs = cfg.check.intervalMinutes * 60_000;
    const url = opts?.catalogUrl || process.env.ORBITKIT_CATALOG_URL || cfg.catalogUrl;

    if (opts?.cacheOnly) {
      if (!state.catalog) {
        return {
          checkedAt: state.lastCheckAt ?? now,
          offline: false,
          fromCache: true,
          newSkills: [],
          outdatedSkills: [],
          errors
        };
      }
      const diff = await computeDiffFromCatalog(projectDir, state.catalog, cfg.channel);
      return {
        checkedAt: state.lastCheckAt ?? now,
        offline: false,
        fromCache: true,
        ...diff,
        errors
      };
    }

    // 1. Return cached report if within check interval and not forced
    if (!opts?.force && state.nextCheckAt && now < state.nextCheckAt && state.catalog) {
      const diff = await computeDiffFromCatalog(projectDir, state.catalog, cfg.channel);
      return {
        checkedAt: state.lastCheckAt ?? now,
        offline: false,
        fromCache: true,
        ...diff,
        errors
      };
    }

    // 2. Fetch remote catalog (with ETag if not forced or even when forced we can validate ETag)
    const fetchRes = await fetchCatalog(url, state.etag, cfg.check.timeoutMs);

    // 3. If catalog schema is unsupported, ignore and do NOT offer updates (§16)
    if (fetchRes.unsupportedSchema) {
      if (fetchRes.error) errors.push(fetchRes.error);
      return {
        checkedAt: now,
        offline: false,
        fromCache: false,
        newSkills: [],
        outdatedSkills: [],
        errors
      };
    }

    // 4. 304 Not Modified -> reuse cached catalog and refresh nextCheckAt
    if (fetchRes.notModified && state.catalog) {
      state.lastCheckAt = now;
      state.nextCheckAt = nextWithJitter(baseIntervalMs, now);
      state.consecutiveFailures = 0;
      await writeState(state);

      const diff = await computeDiffFromCatalog(projectDir, state.catalog, cfg.channel);
      return {
        checkedAt: now,
        offline: false,
        fromCache: true,
        ...diff,
        errors
      };
    }

    // 5. Fresh catalog fetched
    if (fetchRes.catalog) {
      state.catalog = fetchRes.catalog;
      if (fetchRes.etag) {
        state.etag = fetchRes.etag;
      }
      state.lastCheckAt = now;
      state.nextCheckAt = nextWithJitter(baseIntervalMs, now);
      state.consecutiveFailures = 0;
      await writeState(state);

      const diff = await computeDiffFromCatalog(projectDir, fetchRes.catalog, cfg.channel);
      return {
        checkedAt: now,
        offline: false,
        fromCache: false,
        ...diff,
        errors
      };
    }

    // 6. Failure (offline, timeout, HTTP error, or 304 without cached catalog)
    if (fetchRes.error) {
      errors.push(fetchRes.error);
    }
    const failures = (state.consecutiveFailures || 0) + 1;
    state.consecutiveFailures = failures;
    state.nextCheckAt = now + backoffMs(baseIntervalMs, failures);
    await writeState(state);

    if (state.catalog) {
      const diff = await computeDiffFromCatalog(projectDir, state.catalog, cfg.channel);
      return {
        checkedAt: state.lastCheckAt ?? now,
        offline: true,
        fromCache: true,
        ...diff,
        errors
      };
    }

    return {
      checkedAt: now,
      offline: true,
      fromCache: false,
      newSkills: [],
      outdatedSkills: [],
      errors
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg);
    return {
      checkedAt: now,
      offline: true,
      fromCache: false,
      newSkills: [],
      outdatedSkills: [],
      errors
    };
  }
}
