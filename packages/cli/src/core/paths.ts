import os from 'node:os';
import path from 'node:path';

/**
 * Resolves the XDG configuration directory for OrbitKit.
 * Uses XDG_CONFIG_HOME or falls back to ~/.config/orbitkit
 */
export function configDir(): string {
  const base = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(base, 'orbitkit');
}

/**
 * Resolves the XDG state directory for OrbitKit.
 * Uses XDG_STATE_HOME or falls back to ~/.local/state/orbitkit
 */
export function stateDir(): string {
  const base = process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local', 'state');
  return path.join(base, 'orbitkit');
}

/**
 * Resolves the XDG cache directory for OrbitKit.
 * Uses XDG_CACHE_HOME or falls back to ~/.cache/orbitkit
 */
export function cacheDir(): string {
  const base = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache');
  return path.join(base, 'orbitkit');
}
