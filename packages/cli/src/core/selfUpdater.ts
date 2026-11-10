import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  latestSource: 'npm' | 'github' | 'local';
  updateAvailable: boolean;
}

export async function getCurrentCliVersion(): Promise<string> {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const raw = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    return pkg.version || '0.4.0';
  } catch {
    return '0.4.0';
  }
}

export function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 2500): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkCliVersion(): Promise<VersionCheckResult> {
  const currentVersion = await getCurrentCliVersion();

  // Check both NPM registry and GitHub main branch in parallel
  const [npmData, githubData] = await Promise.all([
    fetchJsonWithTimeout(`https://registry.npmjs.org/@francisiv/orbitkit/latest?t=${Date.now()}`),
    fetchJsonWithTimeout(
      `https://raw.githubusercontent.com/FrancisCuarto/OrbitKit/main/packages/cli/package.json?t=${Date.now()}`
    )
  ]);

  const npmVersion: string | null = npmData?.version || null;
  const githubVersion: string | null = githubData?.version || null;

  let latestVersion = currentVersion;
  let latestSource: 'npm' | 'github' | 'local' = 'local';

  if (npmVersion && compareSemver(npmVersion, latestVersion) > 0) {
    latestVersion = npmVersion;
    latestSource = 'npm';
  }
  if (githubVersion && compareSemver(githubVersion, latestVersion) > 0) {
    // Prefer npm if npm already has this version, otherwise note github
    if (npmVersion && compareSemver(npmVersion, githubVersion) >= 0) {
      latestVersion = npmVersion;
      latestSource = 'npm';
    } else {
      latestVersion = githubVersion;
      latestSource = 'github';
    }
  } else if (npmVersion && compareSemver(npmVersion, currentVersion) === 0) {
    latestSource = 'npm';
  }

  return {
    currentVersion,
    latestVersion,
    latestSource,
    updateAvailable: compareSemver(latestVersion, currentVersion) > 0
  };
}

export async function performCliSelfUpdate(targetVersion?: string): Promise<{
  success: boolean;
  previousVersion: string;
  installedVersion: string;
  message: string;
}> {
  const check = await checkCliVersion();
  const previousVersion = check.currentVersion;
  const versionToInstall = targetVersion || check.latestVersion || 'latest';

  try {
    // Force install exact version from NPM registry bypassing stale local cache
    await execAsync(`npm install -g @francisiv/orbitkit@${versionToInstall} --force`);

    // Verify if ~/.local/bin/orbitkit symlink exists and points to an old location
    try {
      const { stdout: npmBinOut } = await execAsync('npm prefix -g');
      const globalPrefix = npmBinOut.trim();
      const globalTarget = path.join(
        globalPrefix,
        'lib',
        'node_modules',
        '@francisiv',
        'orbitkit',
        'bin',
        'devdock.js'
      );
      const localBinOrbitkit = path.join(process.env.HOME || '', '.local', 'bin', 'orbitkit');
      const localBinDevdock = path.join(process.env.HOME || '', '.local', 'bin', 'devdock');

      // If ~/.local/bin/orbitkit exists and globalTarget exists, point symlink to globalTarget
      await fs.access(globalTarget);
      try {
        const stat = await fs.lstat(localBinOrbitkit);
        if (stat.isSymbolicLink()) {
          await fs.unlink(localBinOrbitkit);
          await fs.symlink(globalTarget, localBinOrbitkit);
        }
      } catch {
        // Ignore if ~/.local/bin/orbitkit does not exist
      }
      try {
        const stat = await fs.lstat(localBinDevdock);
        if (stat.isSymbolicLink()) {
          await fs.unlink(localBinDevdock);
          await fs.symlink(globalTarget, localBinDevdock);
        }
      } catch {
        // Ignore if ~/.local/bin/devdock does not exist
      }
    } catch {
      // Non-POSIX or Windows environment, npm global bin handles PATH directly
    }

    return {
      success: true,
      previousVersion,
      installedVersion: versionToInstall,
      message: `Updated @francisiv/orbitkit from v${previousVersion} to v${versionToInstall}`
    };
  } catch (err: any) {
    return {
      success: false,
      previousVersion,
      installedVersion: previousVersion,
      message: `Failed to self-update via npm: ${err.message || String(err)}`
    };
  }
}
