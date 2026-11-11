import { checkForUpdates } from './updateChecker.js';
import { notify, writeUpdateMarker } from './notifier.js';
import { applyUpdates } from './applier.js';
import { readConfig } from './config.js';
import { withCheckLock } from './scheduler.js';

const quiet = process.argv.includes('--quiet');

export async function runCheckWorker(cwd = process.cwd()): Promise<void> {
  await withCheckLock(async () => {
    const cfg = await readConfig(cwd);
    const report = await checkForUpdates(cwd);

    if (quiet) {
      // In detached background mode, write marker for Godot plugin, and leave
      // state.notified for printCachedBanner() on next interactive CLI invocation.
      await writeUpdateMarker(cwd, report);
    } else {
      await notify(report, {
        terminal: cfg.notify.terminal,
        desktop: cfg.notify.desktop,
        projectDir: cwd
      });
    }

    if (cfg.autoUpdate.skills || cfg.autoUpdate.cli || cfg.autoUpdate.newSkills || cfg.autoUpdate.mcps) {
      await applyUpdates(cwd, report, cfg.autoUpdate);
    }

    if (!quiet && report.offline) {
      process.exitCode = 0;
    }
  });
}

if (
  process.env.VGSKILLFRAME_WORKER === '1' ||
  process.env.ORBITKIT_WORKER === '1' ||
  process.argv[1]?.endsWith('checkWorker.js')
) {
  runCheckWorker().catch(() => {
    process.exitCode = 0;
  });
}
