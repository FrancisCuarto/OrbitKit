import fs from 'node:fs/promises';
import path from 'node:path';
import type { Catalog, CatalogSkill } from './catalog.js';
import type { UpdateReport } from './updateChecker.js';
import { readState } from './state.js';
import { installRemoteSkill, parseChecksum } from './skillSource.js';
import { listConfiguredMcpServers, installMcpServer } from './mcpManager.js';
import { performCliSelfUpdate } from './selfUpdater.js';
import { clearUpdateMarker } from './notifier.js';

export interface ApplyOptions {
  autoUpdateSkills: boolean;
  autoInstallNewSkills: boolean;
  autoUpdateMcps: boolean;
  autoUpdateCli: boolean;
  allowMajor: boolean;
}

export interface ShorthandApplyOptions {
  skills?: boolean;
  newSkills?: boolean;
  mcps?: boolean;
  cli?: boolean;
  allowMajor?: boolean;
}

export interface ApplyResult {
  applied: string[];
  skipped: string[];
  failed: { id: string; reason: string }[];
  backupDir?: string;
}

function normalizeApplyOptions(opts: Partial<ApplyOptions> & ShorthandApplyOptions): ApplyOptions {
  return {
    autoUpdateSkills: opts.autoUpdateSkills ?? opts.skills ?? false,
    autoInstallNewSkills: opts.autoInstallNewSkills ?? opts.newSkills ?? false,
    autoUpdateMcps: opts.autoUpdateMcps ?? opts.mcps ?? false,
    autoUpdateCli: opts.autoUpdateCli ?? opts.cli ?? false,
    allowMajor: Boolean(opts.allowMajor)
  };
}

function isMajorBump(fromVer: string, toVer: string): boolean {
  const fromMajor = Number(fromVer.replace(/^v/, '').split('.')[0]) || 0;
  const toMajor = Number(toVer.replace(/^v/, '').split('.')[0]) || 0;
  return toMajor > fromMajor;
}

async function pathExists(p: string): Promise<boolean> {
  return fs
    .access(p)
    .then(() => true)
    .catch(() => false);
}

async function backupSkillDirs(
  projectDir: string,
  backupRoot: string,
  skillId: string
): Promise<{ hadAgents: boolean; hadClaude: boolean; skillBackupDir: string }> {
  const skillBackupDir = path.join(backupRoot, skillId);
  const agentsSrc = path.join(projectDir, '.agents', 'skills', skillId);
  const claudeSrc = path.join(projectDir, '.claude', 'skills', skillId);

  const hadAgents = await pathExists(agentsSrc);
  const hadClaude = await pathExists(claudeSrc);

  await fs.mkdir(skillBackupDir, { recursive: true });
  if (hadAgents) {
    await fs.cp(agentsSrc, path.join(skillBackupDir, 'agents'), { recursive: true });
  }
  if (hadClaude) {
    await fs.cp(claudeSrc, path.join(skillBackupDir, 'claude'), { recursive: true });
  }

  return { hadAgents, hadClaude, skillBackupDir };
}

async function restoreSkillDirs(
  projectDir: string,
  skillId: string,
  backupInfo: { hadAgents: boolean; hadClaude: boolean; skillBackupDir: string }
): Promise<void> {
  const agentsDest = path.join(projectDir, '.agents', 'skills', skillId);
  const claudeDest = path.join(projectDir, '.claude', 'skills', skillId);

  await fs.rm(agentsDest, { recursive: true, force: true }).catch(() => {});
  await fs.rm(claudeDest, { recursive: true, force: true }).catch(() => {});

  if (backupInfo.hadAgents) {
    await fs.mkdir(path.dirname(agentsDest), { recursive: true });
    await fs.cp(path.join(backupInfo.skillBackupDir, 'agents'), agentsDest, { recursive: true });
  }
  if (backupInfo.hadClaude) {
    await fs.mkdir(path.dirname(claudeDest), { recursive: true });
    await fs.cp(path.join(backupInfo.skillBackupDir, 'claude'), claudeDest, { recursive: true });
  }
}

export async function recordInstalledResource(
  projectDir: string,
  skill: CatalogSkill
): Promise<void> {
  const devdockDir = path.join(projectDir, '.devdock');
  await fs.mkdir(devdockDir, { recursive: true });
  const registryPath = path.join(devdockDir, 'installed.json');

  let registry: Record<string, unknown> = {};
  try {
    const raw = await fs.readFile(registryPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      registry = parsed as Record<string, unknown>;
    }
  } catch {
    // Initialize fresh registry
  }

  registry[skill.id] = {
    id: skill.id,
    name: skill.name || skill.id,
    version: skill.version,
    checksum: skill.checksum,
    installedAt: new Date().toISOString()
  };

  const tmpPath = path.join(devdockDir, `.installed.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmpPath, JSON.stringify(registry, null, 2), 'utf8');
  await fs.rename(tmpPath, registryPath);
}

/**
 * Safely applies CLI, AI Skill, and MCP updates with mandatory checksum verification,
 * pre-update backups, atomic writes, automatic rollback on failure, and major-version policy.
 */
export async function applyUpdates(
  projectDir: string,
  report: UpdateReport,
  rawOpts: Partial<ApplyOptions> & ShorthandApplyOptions,
  catalogOverride?: Catalog
): Promise<ApplyResult> {
  const opts = normalizeApplyOptions(rawOpts);
  const applied: string[] = [];
  const skipped: string[] = [];
  const failed: { id: string; reason: string }[] = [];

  const state = await readState();
  const catalog = catalogOverride || state.catalog;
  const tsLabel = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.join(projectDir, '.devdock', 'backups', tsLabel);
  let backupCreated = false;

  // 1. CLI update
  if (report.cli?.updateAvailable) {
    if (report.cli.major && !opts.allowMajor) {
      skipped.push(`cli@${report.cli.latest}`);
    } else if (!opts.autoUpdateCli) {
      skipped.push(`cli@${report.cli.latest}`);
    } else {
      const cliRes = await performCliSelfUpdate({ force: true });
      if (cliRes.success) {
        applied.push(`cli@${report.cli.latest}`);
      } else {
        failed.push({ id: 'cli', reason: cliRes.message });
      }
    }
  }

  // 2. Outdated skills
  for (const item of report.outdatedSkills) {
    if (!opts.autoUpdateSkills) {
      skipped.push(item.id);
      continue;
    }

    if (isMajorBump(item.from, item.to) && !opts.allowMajor) {
      skipped.push(item.id);
      continue;
    }

    const remoteSkill = catalog?.skills.find((s) => s.id === item.id);
    if (!remoteSkill || !remoteSkill.url || !parseChecksum(remoteSkill.checksum)) {
      failed.push({
        id: item.id,
        reason: 'Skill remota sin URL o checksum válido en el catálogo.'
      });
      continue;
    }

    const backupInfo = await backupSkillDirs(projectDir, backupRoot, item.id);
    backupCreated = true;

    try {
      const res = await installRemoteSkill(projectDir, item.id, remoteSkill);
      if (!res.success) {
        await restoreSkillDirs(projectDir, item.id, backupInfo);
        failed.push({ id: item.id, reason: res.message });
      } else {
        await recordInstalledResource(projectDir, remoteSkill);
        applied.push(item.id);
      }
    } catch (err: unknown) {
      await restoreSkillDirs(projectDir, item.id, backupInfo);
      const msg = err instanceof Error ? err.message : String(err);
      failed.push({ id: item.id, reason: msg });
    }
  }

  // 3. New skills
  for (const newSkill of report.newSkills) {
    if (!opts.autoInstallNewSkills) {
      skipped.push(newSkill.id);
      continue;
    }

    if (!newSkill.url || !parseChecksum(newSkill.checksum)) {
      failed.push({
        id: newSkill.id,
        reason: 'Skill nueva sin URL o checksum válido en el catálogo.'
      });
      continue;
    }

    const backupInfo = await backupSkillDirs(projectDir, backupRoot, newSkill.id);
    backupCreated = true;

    try {
      const res = await installRemoteSkill(projectDir, newSkill.id, newSkill);
      if (!res.success) {
        await restoreSkillDirs(projectDir, newSkill.id, backupInfo);
        failed.push({ id: newSkill.id, reason: res.message });
      } else {
        await recordInstalledResource(projectDir, newSkill);
        applied.push(newSkill.id);
      }
    } catch (err: unknown) {
      await restoreSkillDirs(projectDir, newSkill.id, backupInfo);
      const msg = err instanceof Error ? err.message : String(err);
      failed.push({ id: newSkill.id, reason: msg });
    }
  }

  // 4. MCP servers
  if (opts.autoUpdateMcps) {
    try {
      const configured = await listConfiguredMcpServers(projectDir);
      for (const serverId of configured) {
        const res = await installMcpServer(projectDir, serverId);
        if (res.success) {
          applied.push(`mcp:${serverId}`);
        } else {
          failed.push({ id: `mcp:${serverId}`, reason: res.message });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      failed.push({ id: 'mcp', reason: msg });
    }
  }

  if (applied.length > 0 && failed.length === 0) {
    await clearUpdateMarker(projectDir);
  }

  return {
    applied,
    skipped,
    failed,
    ...(backupCreated ? { backupDir: backupRoot } : {})
  };
}
