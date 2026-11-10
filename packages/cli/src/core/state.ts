import fs from 'node:fs/promises';
import path from 'node:path';
import { stateDir } from './paths.js';
import type { Catalog } from './catalog.js';

export interface OrbitKitState {
  schemaVersion: 1;
  etag?: string;
  lastCheckAt?: number;
  nextCheckAt?: number;
  consecutiveFailures: number;
  catalog?: Catalog;
  notified: Record<string, string>; // "skill:<id>@<ver>" | "cli@<ver>" -> ISO
}

const STATE_FILE = () => path.join(stateDir(), 'state.json');

const DEFAULT_STATE: OrbitKitState = {
  schemaVersion: 1,
  consecutiveFailures: 0,
  notified: {}
};

let writeCounter = 0;

export async function readState(): Promise<OrbitKitState> {
  try {
    const raw = await fs.readFile(STATE_FILE(), 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_STATE, notified: {} };
    }
    return {
      ...DEFAULT_STATE,
      ...parsed,
      schemaVersion: 1,
      notified:
        parsed.notified && typeof parsed.notified === 'object' ? { ...parsed.notified } : {}
    };
  } catch {
    return { ...DEFAULT_STATE, notified: {} };
  }
}

export async function writeState(state: OrbitKitState): Promise<void> {
  const dir = stateDir();
  await fs.mkdir(dir, { recursive: true });
  writeCounter += 1;
  const tmp = path.join(dir, `.state.${process.pid}.${writeCounter}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), { encoding: 'utf8', mode: 0o600 });
  await fs.rename(tmp, STATE_FILE());
}
