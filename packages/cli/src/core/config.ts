import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { configDir } from './paths.js';

export const DEFAULT_CATALOG_URL =
  'https://raw.githubusercontent.com/FrancisCuarto/OrbitKit/main/catalog.json';

export function isAllowedRemoteUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === 'https:') return true;
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const OrbitKitConfigSchema = z.object({
  catalogUrl: z
    .string()
    .url()
    .refine(isAllowedRemoteUrl, {
      message: 'catalogUrl debe usar HTTPS (o http://localhost en tests)'
    })
    .default(DEFAULT_CATALOG_URL),
  check: z
    .object({
      onCliStart: z.boolean().default(true),
      intervalMinutes: z.number().int().positive().default(720),
      timeoutMs: z.number().int().positive().default(2500)
    })
    .default({}),
  autoUpdate: z
    .object({
      skills: z.boolean().default(true),
      newSkills: z.boolean().default(false),
      mcps: z.boolean().default(false),
      cli: z.boolean().default(false),
      allowMajor: z.boolean().default(false)
    })
    .default({}),
  notify: z
    .object({
      terminal: z.boolean().default(true),
      desktop: z.boolean().default(true)
    })
    .default({}),
  channel: z.enum(['stable', 'beta']).default('stable')
});

export type OrbitKitConfig = z.infer<typeof OrbitKitConfigSchema>;

export const DEFAULT_CONFIG: OrbitKitConfig = OrbitKitConfigSchema.parse({});

export function getConfigFilePath(): string {
  if (process.env.ORBITKIT_CONFIG) {
    return path.resolve(process.env.ORBITKIT_CONFIG);
  }
  return path.join(configDir(), 'config.json');
}

async function readJsonSafe(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function mergeConfigObjects(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base, ...override };
  for (const section of ['check', 'autoUpdate', 'notify'] as const) {
    const baseSec = base[section];
    const overSec = override[section];
    if (
      baseSec &&
      typeof baseSec === 'object' &&
      !Array.isArray(baseSec) &&
      overSec &&
      typeof overSec === 'object' &&
      !Array.isArray(overSec)
    ) {
      result[section] = {
        ...(baseSec as Record<string, unknown>),
        ...(overSec as Record<string, unknown>)
      };
    }
  }
  return result;
}

/**
 * Reads user configuration from configDir()/config.json (or ORBITKIT_CONFIG),
 * merges optional <projectDir>/.orbitkitrc.json, and applies environment overrides.
 * Never throws on invalid configuration.
 */
export async function readConfig(
  projectDir?: string,
  errorsOut?: string[]
): Promise<OrbitKitConfig> {
  let merged: Record<string, unknown> = {};

  const globalCfg = await readJsonSafe(getConfigFilePath());
  if (globalCfg) {
    merged = mergeConfigObjects(merged, globalCfg);
  }

  if (projectDir) {
    const projectCfg = await readJsonSafe(path.join(projectDir, '.orbitkitrc.json'));
    if (projectCfg) {
      merged = mergeConfigObjects(merged, projectCfg);
    }
  }

  if (process.env.ORBITKIT_CATALOG_URL) {
    merged.catalogUrl = process.env.ORBITKIT_CATALOG_URL;
  }

  const parsed = OrbitKitConfigSchema.safeParse(merged);
  if (!parsed.success) {
    if (errorsOut) {
      for (const issue of parsed.error.issues) {
        errorsOut.push(`Config inválida (${issue.path.join('.')}): ${issue.message}`);
      }
    }
    return {
      ...DEFAULT_CONFIG,
      check: { ...DEFAULT_CONFIG.check },
      autoUpdate: { ...DEFAULT_CONFIG.autoUpdate },
      notify: { ...DEFAULT_CONFIG.notify }
    };
  }

  return parsed.data;
}

/**
 * Writes configuration atomically with 0600 permissions.
 */
export async function writeConfig(config: OrbitKitConfig): Promise<void> {
  const targetFile = getConfigFilePath();
  const dir = path.dirname(targetFile);
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `.config.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(config, null, 2), { encoding: 'utf8', mode: 0o600 });
  await fs.rename(tmp, targetFile);
}
