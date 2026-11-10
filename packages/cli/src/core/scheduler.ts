import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { stateDir } from './paths.js';

const execAsync = promisify(exec);

const STALE_LOCK_MS = 5 * 60 * 1000; // 5 minutes

export function getLockFilePath(): string {
  return path.join(stateDir(), 'check.lock');
}

export async function acquireCheckLock(): Promise<boolean> {
  const lockFile = getLockFilePath();
  await fs.mkdir(path.dirname(lockFile), { recursive: true });

  try {
    const raw = await fs.readFile(lockFile, 'utf8');
    const parsed = JSON.parse(raw) as { pid?: number; createdAt?: number };
    const age = Date.now() - (parsed.createdAt || 0);
    if (age < STALE_LOCK_MS && parsed.pid) {
      try {
        process.kill(parsed.pid, 0);
        return false; // Process is still alive and lock is fresh
      } catch {
        // Process no longer exists; stale lock
      }
    }
  } catch {
    // No existing lock
  }

  try {
    await fs.writeFile(
      lockFile,
      JSON.stringify({ pid: process.pid, createdAt: Date.now() }),
      { encoding: 'utf8', mode: 0o600 }
    );
    return true;
  } catch {
    return false;
  }
}

export async function releaseCheckLock(): Promise<void> {
  try {
    await fs.rm(getLockFilePath(), { force: true });
  } catch {
    // Ignore
  }
}

export async function withCheckLock<T>(fn: () => Promise<T>): Promise<T | null> {
  const acquired = await acquireCheckLock();
  if (!acquired) return null;
  try {
    return await fn();
  } finally {
    await releaseCheckLock();
  }
}

export function parseIntervalToSeconds(every = '6h'): number {
  const match = every.trim().match(/^(\d+)\s*(m|min|h|hr|d)?$/i);
  if (!match) return 6 * 3600;
  const val = Math.max(1, parseInt(match[1], 10));
  const unit = (match[2] || 'h').toLowerCase();
  if (unit.startsWith('m')) return val * 60;
  if (unit.startsWith('d')) return val * 86400;
  return val * 3600;
}

export interface SchedulerOptions {
  every?: string;
  platform?: NodeJS.Platform;
  homeDir?: string;
  execRunner?: (cmd: string) => Promise<void>;
}

export interface SchedulerResult {
  success: boolean;
  platform: NodeJS.Platform;
  artifacts: string[];
  message: string;
}

async function defaultExecRunner(cmd: string): Promise<void> {
  await execAsync(cmd);
}

/**
 * Enables OS-native periodic background update checks (systemd user timer, macOS LaunchAgent, or Windows schtasks).
 * Idempotent: calling multiple times overwrites the single unit cleanly without duplicating entries.
 */
export async function enableScheduler(opts?: SchedulerOptions): Promise<SchedulerResult> {
  const platform = opts?.platform || process.platform;
  const home = opts?.homeDir || os.homedir();
  const every = opts?.every || '6h';
  const seconds = parseIntervalToSeconds(every);
  const runCmd = opts?.execRunner || defaultExecRunner;

  if (platform === 'linux') {
    const systemdDir = path.join(home, '.config', 'systemd', 'user');
    await fs.mkdir(systemdDir, { recursive: true });

    const servicePath = path.join(systemdDir, 'orbitkit-check.service');
    const timerPath = path.join(systemdDir, 'orbitkit-check.timer');

    const serviceContent = `[Unit]
Description=OrbitKit Catalog Update Check
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/bin/env orbitkit check --quiet --notify
`;

    const timerContent = `[Unit]
Description=Periodic OrbitKit Update Check (${every})

[Timer]
OnBootSec=5min
OnUnitActiveSec=${seconds}s
RandomizedDelaySec=300
Persistent=true

[Install]
WantedBy=timers.target
`;

    await fs.writeFile(servicePath, serviceContent, 'utf8');
    await fs.writeFile(timerPath, timerContent, 'utf8');

    try {
      await runCmd('systemctl --user daemon-reload && systemctl --user enable --now orbitkit-check.timer');
    } catch {
      // Allow artifact creation to succeed even in headless/container environments without user dbus
    }

    return {
      success: true,
      platform,
      artifacts: [servicePath, timerPath],
      message: `Scheduler activado en Linux (systemd user timer cada ${every}).`
    };
  }

  if (platform === 'darwin') {
    const launchAgentsDir = path.join(home, 'Library', 'LaunchAgents');
    await fs.mkdir(launchAgentsDir, { recursive: true });
    const plistPath = path.join(launchAgentsDir, 'dev.orbitkit.check.plist');

    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>dev.orbitkit.check</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/env</string>
    <string>orbitkit</string>
    <string>check</string>
    <string>--quiet</string>
    <string>--notify</string>
  </array>
  <key>StartInterval</key>
  <integer>${seconds}</integer>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
`;

    await fs.writeFile(plistPath, plistContent, 'utf8');

    try {
      await runCmd(`launchctl unload "${plistPath}" 2>/dev/null || true; launchctl load -w "${plistPath}"`);
    } catch {
      // Ignore if launchctl unavailable in test environment
    }

    return {
      success: true,
      platform,
      artifacts: [plistPath],
      message: `Scheduler activado en macOS (LaunchAgent cada ${every}).`
    };
  }

  if (platform === 'win32') {
    const hours = Math.max(1, Math.round(seconds / 3600));
    const cmd = `schtasks /create /tn OrbitKitCheck /sc hourly /mo ${hours} /tr "orbitkit check --quiet --notify" /f`;
    try {
      await runCmd(cmd);
    } catch {
      // Ignore if schtasks unavailable in test environment
    }

    return {
      success: true,
      platform,
      artifacts: ['OrbitKitCheck'],
      message: `Scheduler activado en Windows (schtasks cada ${hours}h).`
    };
  }

  return {
    success: false,
    platform,
    artifacts: [],
    message: `Plataforma no soportada para scheduler automático: ${platform}`
  };
}

/**
 * Disables and removes OS-native periodic update check artifacts.
 */
export async function disableScheduler(opts?: SchedulerOptions): Promise<SchedulerResult> {
  const platform = opts?.platform || process.platform;
  const home = opts?.homeDir || os.homedir();
  const runCmd = opts?.execRunner || defaultExecRunner;

  if (platform === 'linux') {
    const systemdDir = path.join(home, '.config', 'systemd', 'user');
    const servicePath = path.join(systemdDir, 'orbitkit-check.service');
    const timerPath = path.join(systemdDir, 'orbitkit-check.timer');

    try {
      await runCmd('systemctl --user disable --now orbitkit-check.timer');
    } catch {
      // Ignore
    }

    await fs.rm(servicePath, { force: true }).catch(() => {});
    await fs.rm(timerPath, { force: true }).catch(() => {});

    return {
      success: true,
      platform,
      artifacts: [servicePath, timerPath],
      message: 'Scheduler desactivado en Linux (systemd user timer eliminado).'
    };
  }

  if (platform === 'darwin') {
    const plistPath = path.join(home, 'Library', 'LaunchAgents', 'dev.orbitkit.check.plist');
    try {
      await runCmd(`launchctl unload -w "${plistPath}"`);
    } catch {
      // Ignore
    }
    await fs.rm(plistPath, { force: true }).catch(() => {});

    return {
      success: true,
      platform,
      artifacts: [plistPath],
      message: 'Scheduler desactivado en macOS (LaunchAgent eliminado).'
    };
  }

  if (platform === 'win32') {
    try {
      await runCmd('schtasks /delete /tn OrbitKitCheck /f');
    } catch {
      // Ignore
    }
    return {
      success: true,
      platform,
      artifacts: ['OrbitKitCheck'],
      message: 'Scheduler desactivado en Windows (tarea OrbitKitCheck eliminada).'
    };
  }

  return {
    success: false,
    platform,
    artifacts: [],
    message: `Plataforma no soportada: ${platform}`
  };
}
