import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readState } from './state.js';
import { readConfig } from './config.js';
import { checkForUpdates } from './updateChecker.js';
import { notify } from './notifier.js';

const WORKER = fileURLToPath(new URL('./checkWorker.js', import.meta.url));

export function shouldBackgroundCheck(): boolean {
  if (process.env.ORBITKIT_NO_UPDATE_CHECK) return false;
  if (process.env.ORBITKIT_WORKER) return false;
  if (process.env.CI) return false;
  if (!process.stdout.isTTY) return false;
  return true;
}

export function scheduleBackgroundCheck(): void {
  try {
    const child = spawn(process.execPath, [WORKER, '--quiet'], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, ORBITKIT_WORKER: '1' }
    });
    child.on('error', () => {});
    child.unref();
  } catch {
    // Never block CLI if spawning fails
  }
}

/**
 * Reads cached catalog from state.json (zero network requests), compares against
 * already-notified versions, and prints a one-line update banner if new updates exist.
 */
export async function printCachedBanner(projectDir = process.cwd()): Promise<void> {
  try {
    if (process.env.ORBITKIT_NO_UPDATE_CHECK || process.env.CI) return;
    if (process.argv.includes('--json')) return;

    const state = await readState();
    if (!state.catalog) return;

    const cfg = await readConfig(projectDir);
    if (!cfg.notify.terminal) return;

    const report = await checkForUpdates(projectDir, { cacheOnly: true });
    if (!report.fromCache || report.offline) return;

    await notify(report, {
      terminal: true,
      desktop: false,
      projectDir
    });
  } catch {
    // Never fail CLI on banner rendering
  }
}
