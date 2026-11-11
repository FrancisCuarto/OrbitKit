import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Resolves the XDG configuration directory for VGskillframe.
 * Uses XDG_CONFIG_HOME or falls back to ~/.config/vgskillframe (or legacy ~/.config/orbitkit)
 */
export function configDir(): string {
  const base = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  const vgPath = path.join(base, 'vgskillframe');
  const legacyPath = path.join(base, 'orbitkit');
  if (!fs.existsSync(vgPath) && fs.existsSync(legacyPath)) {
    return legacyPath;
  }
  return vgPath;
}

/**
 * Resolves the XDG state directory for VGskillframe.
 * Uses XDG_STATE_HOME or falls back to ~/.local/state/vgskillframe (or legacy ~/.local/state/orbitkit)
 */
export function stateDir(): string {
  const base = process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state');
  const vgPath = path.join(base, 'vgskillframe');
  const legacyPath = path.join(base, 'orbitkit');
  if (!fs.existsSync(vgPath) && fs.existsSync(legacyPath)) {
    return legacyPath;
  }
  return vgPath;
}

/**
 * Resolves the XDG cache directory for VGskillframe.
 * Uses XDG_CACHE_HOME or falls back to ~/.cache/vgskillframe (or legacy ~/.cache/orbitkit)
 */
export function cacheDir(): string {
  const base = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache');
  const vgPath = path.join(base, 'vgskillframe');
  const legacyPath = path.join(base, 'orbitkit');
  if (!fs.existsSync(vgPath) && fs.existsSync(legacyPath)) {
    return legacyPath;
  }
  return vgPath;
}
