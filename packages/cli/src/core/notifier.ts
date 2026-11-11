import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import pc from 'picocolors';
import { readState, writeState } from './state.js';
import type { UpdateReport } from './updateChecker.js';

export interface NotifyOptions {
  terminal?: boolean;
  desktop?: boolean;
  projectDir?: string;
}

export function collectNotificationKeys(report: UpdateReport): string[] {
  const keys: string[] = [];
  if (report.cli?.updateAvailable) {
    keys.push(`cli@${report.cli.latest}`);
  }
  for (const skill of report.newSkills) {
    keys.push(`skill:${skill.id}@${skill.version}`);
  }
  for (const skill of report.outdatedSkills) {
    keys.push(`skill:${skill.id}@${skill.to}`);
  }
  return keys;
}

export function formatPassiveBanner(report: UpdateReport): string | null {
  const parts: string[] = [];
  let totalCount = 0;

  if (report.newSkills.length > 0) {
    totalCount += report.newSkills.length;
    parts.push(
      `${report.newSkills.length} ${report.newSkills.length === 1 ? 'skill nueva' : 'skills nuevas'}`
    );
  }
  if (report.outdatedSkills.length > 0) {
    totalCount += report.outdatedSkills.length;
    parts.push(
      `${report.outdatedSkills.length} ${
        report.outdatedSkills.length === 1 ? 'skill desactualizada' : 'skills desactualizadas'
      }`
    );
  }
  if (report.cli?.updateAvailable) {
    totalCount += 1;
    parts.push(`CLI v${report.cli.latest}`);
  }

  if (totalCount === 0) return null;

  const label = totalCount === 1 ? '1 novedad en VGskillframe' : `${totalCount} novedades en VGskillframe`;
  return `${pc.yellow('⬆')}  ${pc.bold(label)} (${parts.join(', ')}) · ${pc.cyan('vgskillframe update --all')}`;
}

function sendDesktopNotification(title: string, body: string): void {
  try {
    const platform = process.platform;
    if (platform === 'linux') {
      const child = spawn('notify-send', [title, body], {
        detached: true,
        stdio: 'ignore'
      });
      child.on('error', () => {});
      child.unref();
    } else if (platform === 'darwin') {
      const escapedBody = body.replace(/"/g, '\\"');
      const escapedTitle = title.replace(/"/g, '\\"');
      const child = spawn(
        'osascript',
        ['-e', `display notification "${escapedBody}" with title "${escapedTitle}"`],
        {
          detached: true,
          stdio: 'ignore'
        }
      );
      child.on('error', () => {});
      child.unref();
    } else if (platform === 'win32') {
      const psScript = `[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null`;
      const child = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', psScript], {
        detached: true,
        stdio: 'ignore'
      });
      child.on('error', () => {});
      child.unref();
    }
  } catch {
    // Ignore desktop notification errors
  }
}

export async function writeUpdateMarker(
  projectDir: string,
  report: UpdateReport
): Promise<void> {
  try {
    const hasProjectGodot = await fs
      .access(path.join(projectDir, 'project.godot'))
      .then(() => true)
      .catch(() => false);
    const devdockDir = path.join(projectDir, '.devdock');
    const hasDevdockDir = await fs
      .access(devdockDir)
      .then(() => true)
      .catch(() => false);

    if (!hasProjectGodot && !hasDevdockDir) {
      return;
    }

    const markerPath = path.join(devdockDir, 'update-available.json');
    const hasUpdates =
      Boolean(report.cli?.updateAvailable) ||
      report.newSkills.length > 0 ||
      report.outdatedSkills.length > 0;

    if (!hasUpdates) {
      await fs.rm(markerPath, { force: true }).catch(() => {});
      return;
    }

    await fs.mkdir(devdockDir, { recursive: true });
    const tmpPath = path.join(devdockDir, `.update-available.${process.pid}.tmp`);
    const payload = {
      checkedAt: report.checkedAt,
      cli: report.cli,
      newSkills: report.newSkills,
      outdatedSkills: report.outdatedSkills
    };
    await fs.writeFile(tmpPath, JSON.stringify(payload, null, 2), 'utf8');
    await fs.rename(tmpPath, markerPath);
  } catch {
    // Ignore marker write errors
  }
}

export async function clearUpdateMarker(projectDir: string): Promise<void> {
  try {
    const markerPath = path.join(projectDir, '.devdock', 'update-available.json');
    await fs.rm(markerPath, { force: true });
  } catch {
    // Ignore
  }
}

/**
 * Notifies about available updates across terminal, desktop, and Godot plugin marker file,
 * deduplicating notifications per version in state.json.
 */
export async function notify(
  report: UpdateReport,
  opts?: NotifyOptions
): Promise<{ notified: string[] }> {
  const projectDir = opts?.projectDir || process.cwd();
  await writeUpdateMarker(projectDir, report);

  if (report.offline) {
    return { notified: [] };
  }

  const allKeys = collectNotificationKeys(report);
  if (allKeys.length === 0) {
    return { notified: [] };
  }

  const state = await readState();
  const unnotified = allKeys.filter((k) => !state.notified[k]);
  if (unnotified.length === 0) {
    return { notified: [] };
  }

  const nowIso = new Date().toISOString();
  for (const key of unnotified) {
    state.notified[key] = nowIso;
  }
  await writeState(state);

  const isJsonOutput = process.argv.includes('--json');
  const banner = formatPassiveBanner(report);

  if (opts?.terminal !== false && !isJsonOutput && banner) {
    console.log(`\n${banner}\n`);
  }

  if (opts?.desktop && banner) {
    const plainSummary = `${unnotified.length} actualización(es) disponibles en VGskillframe.`;
    sendDesktopNotification('VGskillframe Updates', plainSummary);
  }

  return { notified: unnotified };
}
