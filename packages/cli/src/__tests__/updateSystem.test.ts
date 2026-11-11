import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import AdmZip from 'adm-zip';
import { createCli } from '../cli.js';
import { configDir, stateDir, cacheDir } from '../core/paths.js';
import { readConfig, writeConfig, DEFAULT_CONFIG } from '../core/config.js';
import { fetchCatalog, type Catalog } from '../core/catalog.js';
import { readState, writeState } from '../core/state.js';
import { checkForUpdates } from '../core/updateChecker.js';
import { installSkill, checkSkillUpdates } from '../core/skillsManager.js';
import { getCurrentCliVersion } from '../core/selfUpdater.js';
import { notify } from '../core/notifier.js';
import { shouldBackgroundCheck } from '../core/background.js';
import { applyUpdates } from '../core/applier.js';
import { enableScheduler, disableScheduler, acquireCheckLock, releaseCheckLock } from '../core/scheduler.js';

function makeMockCatalog(overrides?: Partial<Catalog>): Catalog {
  return {
    schema: 1,
    generatedAt: '2026-11-10T12:00:00Z',
    cli: {
      latest: '0.6.0',
      minSupported: '0.5.0',
      channel: 'stable'
    },
    skills: [
      {
        id: 'gdscript-architect',
        name: 'GDScript 4 Architect Skill (Legacy Alias)',
        version: '1.3.0',
        description: 'Updated architect skill',
        checksum: 'sha256:' + 'a'.repeat(64),
        url: 'https://raw.githubusercontent.com/FrancisCuarto/OrbitKit/main/skills/gdscript-architect.zip',
        tags: ['architecture'],
        minGodot: '4.0',
        channel: 'stable'
      },
      {
        id: 'godot-dialogue-system',
        name: 'Godot 4 Dialogue System',
        version: '1.0.0',
        description: 'Branching dialogue graphs for Godot 4',
        checksum: 'sha256:' + 'b'.repeat(64),
        url: 'https://raw.githubusercontent.com/FrancisCuarto/OrbitKit/main/skills/godot-dialogue-system.zip',
        tags: ['dialogue', 'ui'],
        minGodot: '4.3',
        channel: 'stable'
      },
      {
        id: 'godot-future-feature',
        name: 'Godot 4.4 Exclusive Skill',
        version: '1.0.0',
        description: 'Requires Godot 4.4+',
        checksum: 'sha256:' + 'c'.repeat(64),
        url: 'https://raw.githubusercontent.com/FrancisCuarto/OrbitKit/main/skills/godot-future-feature.zip',
        tags: ['4.4'],
        minGodot: '4.4',
        channel: 'stable'
      }
    ],
    ...overrides
  };
}

describe('OrbitKit Update System — Fase 0 & Fase 1', () => {
  let tempRoot: string;
  let projectDir: string;
  const origEnv = { ...process.env };

  beforeEach(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'orbitkit-update-test-'));
    projectDir = path.join(tempRoot, 'game');
    await fs.mkdir(projectDir, { recursive: true });

    process.env.XDG_CONFIG_HOME = path.join(tempRoot, 'xdg-config');
    process.env.XDG_STATE_HOME = path.join(tempRoot, 'xdg-state');
    process.env.XDG_CACHE_HOME = path.join(tempRoot, 'xdg-cache');
    delete process.env.ORBITKIT_CONFIG;
    delete process.env.ORBITKIT_CATALOG_URL;

    await fs.writeFile(
      path.join(projectDir, 'project.godot'),
      'config_version=5\n\n[application]\nconfig/name="Test Orbit Game"\nconfig/features=PackedStringArray("4.3", "Forward Plus")\n',
      'utf8'
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.env = { ...origEnv };
    await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => {});
  });

  it('resolves XDG paths (configDir, stateDir, cacheDir)', () => {
    expect(configDir()).toBe(path.join(tempRoot, 'xdg-config', 'vgskillframe'));
    expect(stateDir()).toBe(path.join(tempRoot, 'xdg-state', 'vgskillframe'));
    expect(cacheDir()).toBe(path.join(tempRoot, 'xdg-cache', 'vgskillframe'));
  });

  it('state: writes atomically without leaving .tmp files and sets 0600 mode', async () => {
    const s1 = await readState();
    expect(s1.schemaVersion).toBe(1);
    expect(s1.consecutiveFailures).toBe(0);

    await writeState({ ...s1, etag: '"v1"', consecutiveFailures: 1 });
    await writeState({ ...s1, etag: '"v2"', consecutiveFailures: 0 });

    const files = await fs.readdir(stateDir());
    expect(files).toEqual(['state.json']);

    const s2 = await readState();
    expect(s2.etag).toBe('"v2"');
    expect(s2.consecutiveFailures).toBe(0);
  });

  it('config: falls back to defaults on invalid config without throwing and merges .orbitkitrc.json', async () => {
    await fs.mkdir(configDir(), { recursive: true });
    await fs.writeFile(
      path.join(configDir(), 'config.json'),
      JSON.stringify({ catalogUrl: 'http://insecure.example.com/catalog.json' }),
      'utf8'
    );

    const errors: string[] = [];
    const cfg = await readConfig(projectDir, errors);
    expect(errors.length).toBeGreaterThan(0);
    expect(cfg.catalogUrl).toBe(DEFAULT_CONFIG.catalogUrl);

    // Valid global + project override
    await writeConfig({
      ...DEFAULT_CONFIG,
      check: { ...DEFAULT_CONFIG.check, intervalMinutes: 360 }
    });
    await fs.writeFile(
      path.join(projectDir, '.orbitkitrc.json'),
      JSON.stringify({ channel: 'beta', check: { intervalMinutes: 60 } }),
      'utf8'
    );

    const merged = await readConfig(projectDir);
    expect(merged.channel).toBe('beta');
    expect(merged.check.intervalMinutes).toBe(60);
    expect(merged.check.timeoutMs).toBe(2500);
  });

  it('catalog: handles 304 Not Modified, invalid JSON, non-HTTPS rejection, and unknown schema', async () => {
    // 1. Rejects plain HTTP (non-localhost)
    const insecure = await fetchCatalog('http://example.com/catalog.json');
    expect(insecure.catalog).toBeNull();
    expect(insecure.notModified).toBe(false);

    // 2. 304 Not Modified
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 304,
        ok: false,
        headers: new Headers({ etag: '"etag-123"' })
      })
    );
    const notMod = await fetchCatalog('https://example.com/catalog.json', '"etag-123"');
    expect(notMod.notModified).toBe(true);
    expect(notMod.catalog).toBeNull();
    expect(notMod.etag).toBe('"etag-123"');

    // 3. Invalid JSON does not throw
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({ invalid: true })
      })
    );
    const badJson = await fetchCatalog('https://example.com/catalog.json');
    expect(badJson.catalog).toBeNull();
    expect(badJson.notModified).toBe(false);

    // 4. Unsupported schema version
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({ schema: 99, generatedAt: '2026-11-10T00:00:00Z' })
      })
    );
    const badSchema = await fetchCatalog('https://example.com/catalog.json');
    expect(badSchema.catalog).toBeNull();
    expect(badSchema.unsupportedSchema).toBe(true);
  });

  it('checker: detects newSkills, outdatedSkills, filters by minGodot, and flags CLI major / belowMin', async () => {
    // Install gdscript-architect v1.2.0 (bundled)
    await installSkill(projectDir, 'gdscript-architect');

    const mockCatalog = makeMockCatalog({
      cli: {
        latest: '1.0.0',
        minSupported: '0.8.0',
        channel: 'stable'
      }
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers({ etag: '"cat-v1"' }),
        json: async () => mockCatalog
      })
    );

    const report = await checkForUpdates(projectDir, { force: true });
    expect(report.offline).toBe(false);
    expect(report.fromCache).toBe(false);

    // gdscript-architect is installed (1.2.0) -> should be in outdatedSkills (1.2.0 -> 1.3.0), NOT in newSkills
    expect(report.outdatedSkills).toEqual([
      { id: 'gdscript-architect', from: '1.2.0', to: '1.3.0' }
    ]);

    // godot-dialogue-system (minGodot 4.3) should be in newSkills; godot-future-feature (minGodot 4.4) filtered out on 4.3 project
    expect(report.newSkills.map((s) => s.id)).toEqual(['godot-dialogue-system']);

    // CLI flags
    expect(report.cli?.current).toBe('0.7.0');
    expect(report.cli?.latest).toBe('1.0.0');
    expect(report.cli?.updateAvailable).toBe(true);
    expect(report.cli?.major).toBe(true);
    expect(report.cli?.belowMin).toBe(true);

    // Subsequent non-forced call uses cache with 0 network calls
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const cachedReport = await checkForUpdates(projectDir, { force: false });
    expect(cachedReport.fromCache).toBe(true);
    expect(cachedReport.offline).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('checker: handles timeout / offline gracefully and falls back to cached catalog with backoff', async () => {
    const mockCatalog = makeMockCatalog();
    await writeState({
      schemaVersion: 1,
      consecutiveFailures: 0,
      notified: {},
      catalog: mockCatalog,
      lastCheckAt: 1000
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('The operation was aborted', 'TimeoutError'))
    );

    const report = await checkForUpdates(projectDir, { force: true });
    expect(report.offline).toBe(true);
    expect(report.fromCache).toBe(true);
    expect(report.newSkills.some((s) => s.id === 'godot-dialogue-system')).toBe(true);

    const updatedState = await readState();
    expect(updatedState.consecutiveFailures).toBe(1);
    expect(updatedState.nextCheckAt).toBeGreaterThan(Date.now());
  });

  it('Fase 0: installSkill downloads remote ZIP, verifies sha256 checksum, and blocks invalid checksums or Zip Slip', async () => {
    const zip = new AdmZip();
    const skillMd = '---\nname: Remote Dialogue\nid: godot-dialogue-system\nversion: 1.0.0\n---\n# Remote Skill\n';
    const skillJson = JSON.stringify({
      id: 'godot-dialogue-system',
      name: 'Remote Dialogue',
      version: '1.0.0'
    });
    zip.addFile('SKILL.md', Buffer.from(skillMd, 'utf8'));
    zip.addFile('skill.json', Buffer.from(skillJson, 'utf8'));
    const zipBuf = zip.toBuffer();
    const validHash = crypto.createHash('sha256').update(zipBuf).digest('hex');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers({ 'content-length': String(zipBuf.length) }),
        arrayBuffer: async () =>
          zipBuf.buffer.slice(zipBuf.byteOffset, zipBuf.byteOffset + zipBuf.byteLength)
      })
    );

    // 1. Invalid checksum must fail and not write files
    const badRes = await installSkill(projectDir, 'godot-dialogue-system', {
      id: 'godot-dialogue-system',
      name: 'Remote Dialogue',
      version: '1.0.0',
      checksum: 'sha256:' + '0'.repeat(64),
      url: 'https://example.com/skills/godot-dialogue-system.zip',
      tags: [],
      channel: 'stable'
    });
    expect(badRes.success).toBe(false);
    expect(badRes.message).toMatch(/Checksum inválido/i);

    // 2. Valid checksum installs into both .agents/skills and .claude/skills
    const okRes = await installSkill(projectDir, 'godot-dialogue-system', {
      id: 'godot-dialogue-system',
      name: 'Remote Dialogue',
      version: '1.0.0',
      checksum: `sha256:${validHash}`,
      url: 'https://example.com/skills/godot-dialogue-system.zip',
      tags: [],
      channel: 'stable'
    });
    expect(okRes.success).toBe(true);
    expect(okRes.version).toBe('1.0.0');

    const installedMd = await fs.readFile(
      path.join(projectDir, '.agents', 'skills', 'godot-dialogue-system', 'SKILL.md'),
      'utf8'
    );
    expect(installedMd).toContain('# Remote Skill');

    // 3. checkSkillUpdates accepts optional catalog
    const updates = await checkSkillUpdates(
      projectDir,
      makeMockCatalog({
        skills: [
          {
            id: 'godot-dialogue-system',
            version: '1.1.0',
            tags: [],
            channel: 'stable'
          }
        ]
      })
    );
    expect(updates).toEqual([
      {
        skillId: 'godot-dialogue-system',
        currentVersion: '1.0.0',
        latestVersion: '1.1.0'
      }
    ]);
  });

  it('docs/version: getCurrentCliVersion() matches package.json and CLI .version()', async () => {
    const cliVer = await getCurrentCliVersion();
    const pkgRaw = await fs.readFile(
      new URL('../../package.json', import.meta.url),
      'utf8'
    );
    const pkg = JSON.parse(pkgRaw) as { version: string };
    const program = createCli();

    expect(cliVer).toBe(pkg.version);
    expect(program.version()).toBe(pkg.version);
  });

  it('CLI check --json outputs valid parseable UpdateReport without spinner or ANSI codes', async () => {
    const mockCatalog = makeMockCatalog();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => mockCatalog
      })
    );

    const logs: string[] = [];
    const logSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      logs.push(args.join(' '));
    });

    const program = createCli();
    await program.parseAsync(['node', 'vgskillframe', 'check', projectDir, '--json', '--force']);

    logSpy.mockRestore();
    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]) as { offline: boolean; newSkills: unknown[] };
    expect(parsed.offline).toBe(false);
    expect(Array.isArray(parsed.newSkills)).toBe(true);
  });

  it('Fase 0 integration: generated catalog.json and skills/*.zip pass checksum verification and install cleanly', async () => {
    const repoRoot = path.resolve(new URL('../../../../', import.meta.url).pathname);
    const catalogRaw = await fs.readFile(path.join(repoRoot, 'catalog.json'), 'utf8');
    const catalog = JSON.parse(catalogRaw) as Catalog;
    expect(catalog.schema).toBe(1);
    expect(catalog.skills.length).toBe(20);

    const guardian = catalog.skills.find((s) => s.id === 'godot4-syntax-guardian')!;
    expect(guardian).toBeDefined();
    expect(guardian.checksum).toMatch(/^sha256:[a-f0-9]{64}$/);

    const zipBuf = await fs.readFile(path.join(repoRoot, 'skills', 'godot4-syntax-guardian.zip'));
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers({ 'content-length': String(zipBuf.length) }),
        arrayBuffer: async () =>
          zipBuf.buffer.slice(zipBuf.byteOffset, zipBuf.byteOffset + zipBuf.byteLength)
      })
    );

    const res = await installSkill(projectDir, guardian.id, guardian);
    expect(res.success).toBe(true);
    expect(res.version).toBe(guardian.version);

    const skillMd = await fs.readFile(
      path.join(projectDir, '.agents', 'skills', guardian.id, 'SKILL.md'),
      'utf8'
    );
    expect(skillMd).toContain('Godot 4 Syntax Guardian');
  });

  it('Fase 2 — notifier: deduplicates notifications per version and writes .devdock/update-available.json marker', async () => {
    const mockCatalog = makeMockCatalog();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => mockCatalog
      })
    );

    const report = await checkForUpdates(projectDir, { force: true });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // First call notifies
    const first = await notify(report, { terminal: true, desktop: false, projectDir });
    expect(first.notified.length).toBeGreaterThan(0);

    // Marker file written for Godot plugin
    const markerRaw = await fs.readFile(
      path.join(projectDir, '.devdock', 'update-available.json'),
      'utf8'
    );
    const marker = JSON.parse(markerRaw);
    expect(marker.newSkills.length).toBeGreaterThan(0);

    // Second consecutive call with same versions returns empty notified[]
    const second = await notify(report, { terminal: true, desktop: false, projectDir });
    expect(second.notified).toEqual([]);

    // Newer version of a skill notifies again
    const reportV2 = {
      ...report,
      newSkills: [
        {
          ...report.newSkills[0],
          version: '1.1.0'
        }
      ]
    };
    const third = await notify(reportV2, { terminal: true, desktop: false, projectDir });
    expect(third.notified).toEqual([`skill:${report.newSkills[0].id}@1.1.0`]);

    logSpy.mockRestore();
  });

  it('Fase 2 — env: CI and ORBITKIT_NO_UPDATE_CHECK disable background checks', () => {
    process.env.CI = 'true';
    expect(shouldBackgroundCheck()).toBe(false);

    delete process.env.CI;
    process.env.ORBITKIT_NO_UPDATE_CHECK = '1';
    expect(shouldBackgroundCheck()).toBe(false);
  });

  it('Fase 3 — scheduler: enable is idempotent across Linux, macOS, and Windows and check.lock prevents concurrency', async () => {
    const homeDir = path.join(tempRoot, 'home');
    const executedCmds: string[] = [];
    const execRunner = async (cmd: string) => {
      executedCmds.push(cmd);
    };

    // Linux twice -> idempotent, only 2 unit files (.service and .timer)
    const linux1 = await enableScheduler({
      platform: 'linux',
      homeDir,
      every: '6h',
      execRunner
    });
    const linux2 = await enableScheduler({
      platform: 'linux',
      homeDir,
      every: '6h',
      execRunner
    });
    expect(linux1.success).toBe(true);
    expect(linux2.success).toBe(true);

    const systemdUnits = await fs.readdir(path.join(homeDir, '.config', 'systemd', 'user'));
    expect(systemdUnits.sort()).toEqual(['vgskillframe-check.service', 'vgskillframe-check.timer']);

    const serviceContent = await fs.readFile(
      path.join(homeDir, '.config', 'systemd', 'user', 'vgskillframe-check.service'),
      'utf8'
    );
    expect(serviceContent).toContain('vgskillframe check --quiet --notify');

    await disableScheduler({ platform: 'linux', homeDir, execRunner });
    const afterDisable = await fs.readdir(path.join(homeDir, '.config', 'systemd', 'user'));
    expect(afterDisable).toEqual([]);

    // macOS twice -> idempotent plist
    const mac1 = await enableScheduler({ platform: 'darwin', homeDir, every: '12h', execRunner });
    const mac2 = await enableScheduler({ platform: 'darwin', homeDir, every: '12h', execRunner });
    expect(mac1.success).toBe(true);
    expect(mac2.success).toBe(true);
    const agents = await fs.readdir(path.join(homeDir, 'Library', 'LaunchAgents'));
    expect(agents).toEqual(['dev.vgskillframe.check.plist']);

    // Windows
    const win = await enableScheduler({ platform: 'win32', homeDir, every: '6h', execRunner });
    expect(win.success).toBe(true);

    // Lock concurrency check
    expect(await acquireCheckLock()).toBe(true);
    expect(await acquireCheckLock()).toBe(false);
    await releaseCheckLock();
    expect(await acquireCheckLock()).toBe(true);
    await releaseCheckLock();
  });

  it('Fase 4 — applier: verifies checksum, restores backup on failure (rollback), skips major bumps, and updates installed.json', async () => {
    // Install initial v1.2.0 of gdscript-architect
    await installSkill(projectDir, 'gdscript-architect');
    const agentSkillFile = path.join(
      projectDir,
      '.agents',
      'skills',
      'gdscript-architect',
      'SKILL.md'
    );
    const originalContent = await fs.readFile(agentSkillFile, 'utf8');

    // Prepare a remote ZIP with tampered content (mismatching checksum)
    const zip = new AdmZip();
    zip.addFile('SKILL.md', Buffer.from('# Tampered Content\n', 'utf8'));
    zip.addFile(
      'skill.json',
      Buffer.from(JSON.stringify({ id: 'gdscript-architect', version: '1.3.0' }), 'utf8')
    );
    const zipBuf = zip.toBuffer();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers({ 'content-length': String(zipBuf.length) }),
        arrayBuffer: async () =>
          zipBuf.buffer.slice(zipBuf.byteOffset, zipBuf.byteOffset + zipBuf.byteLength)
      })
    );

    const catalogBadChecksum = makeMockCatalog({
      skills: [
        {
          id: 'gdscript-architect',
          name: 'GDScript Architect',
          version: '1.3.0',
          checksum: 'sha256:' + 'f'.repeat(64), // wrong checksum!
          url: 'https://example.com/skills/gdscript-architect.zip',
          tags: [],
          channel: 'stable'
        }
      ]
    });

    const failResult = await applyUpdates(
      projectDir,
      {
        checkedAt: Date.now(),
        offline: false,
        fromCache: false,
        cli: {
          current: '0.6.0',
          latest: '1.0.0',
          updateAvailable: true,
          major: true,
          belowMin: false
        },
        newSkills: [],
        outdatedSkills: [{ id: 'gdscript-architect', from: '1.2.0', to: '1.3.0' }],
        errors: []
      },
      {
        autoUpdateSkills: true,
        autoInstallNewSkills: false,
        autoUpdateMcps: false,
        autoUpdateCli: true,
        allowMajor: false // CLI major 1.0.0 must be skipped!
      },
      catalogBadChecksum
    );

    // Major CLI was skipped; bad checksum failed and triggered rollback
    expect(failResult.skipped).toContain('cli@1.0.0');
    expect(failResult.failed.length).toBe(1);
    expect(failResult.failed[0].id).toBe('gdscript-architect');
    expect(failResult.backupDir).toBeDefined();

    // Rollback verified: original SKILL.md is completely intact
    const contentAfterRollback = await fs.readFile(agentSkillFile, 'utf8');
    expect(contentAfterRollback).toBe(originalContent);

    // Now test valid checksum application + installed.json update
    const validHash = crypto.createHash('sha256').update(zipBuf).digest('hex');
    const catalogGoodChecksum = makeMockCatalog({
      skills: [
        {
          id: 'gdscript-architect',
          name: 'GDScript Architect',
          version: '1.3.0',
          checksum: `sha256:${validHash}`,
          url: 'https://example.com/skills/gdscript-architect.zip',
          tags: [],
          channel: 'stable'
        }
      ]
    });

    const okResult = await applyUpdates(
      projectDir,
      {
        checkedAt: Date.now(),
        offline: false,
        fromCache: false,
        newSkills: [],
        outdatedSkills: [{ id: 'gdscript-architect', from: '1.2.0', to: '1.3.0' }],
        errors: []
      },
      {
        autoUpdateSkills: true,
        autoInstallNewSkills: false,
        autoUpdateMcps: false,
        autoUpdateCli: false,
        allowMajor: false
      },
      catalogGoodChecksum
    );

    expect(okResult.applied).toEqual(['gdscript-architect']);
    expect(okResult.failed).toEqual([]);

    const installedRegRaw = await fs.readFile(
      path.join(projectDir, '.devdock', 'installed.json'),
      'utf8'
    );
    const installedReg = JSON.parse(installedRegRaw);
    expect(installedReg['gdscript-architect'].version).toBe('1.3.0');
  });
});
