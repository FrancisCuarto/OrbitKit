import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  npmVersion: string | null;
  githubVersion: string | null;
  latestSource: 'npm' | 'github' | 'local';
  updateAvailable: boolean;
}

export async function getCurrentCliVersion(): Promise<string> {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const raw = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    return pkg.version || '0.6.0';
  } catch {
    return '0.6.0';
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

async function fetchJsonWithTimeout(url: string, timeoutMs = 3000): Promise<any | null> {
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
    npmVersion,
    githubVersion,
    latestSource,
    updateAvailable: compareSemver(latestVersion, currentVersion) > 0
  };
}

async function syncLocalBinSymlinks(): Promise<void> {
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
    await fs.access(globalTarget);

    for (const binName of ['orbitkit', 'devdock']) {
      const localBin = path.join(process.env.HOME || '', '.local', 'bin', binName);
      try {
        const stat = await fs.lstat(localBin);
        if (stat.isSymbolicLink()) {
          await fs.unlink(localBin);
          await fs.symlink(globalTarget, localBin);
        }
      } catch {
        // Ignore if ~/.local/bin/<binName> doesn't exist
      }
    }
  } catch {
    // Non-POSIX or standard PATH setup
  }
}

async function installFromGithubMain(): Promise<void> {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'orbitkit-upgrade-'));
  try {
    await execAsync(
      `git clone --depth 1 --branch main https://github.com/FrancisCuarto/OrbitKit.git "${tmpRoot}/repo"`
    );
    const cliDir = path.join(tmpRoot, 'repo', 'packages', 'cli');
    await execAsync(
      'npm install --include=dev && npm run build && npm pack && npm install -g francisiv-orbitkit-*.tgz',
      {
        cwd: cliDir
      }
    );
    await syncLocalBinSymlinks();
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true }).catch(() => {});
  }
}

export async function performCliSelfUpdate(options?: {
  force?: boolean;
}): Promise<{
  success: boolean;
  alreadyUpToDate: boolean;
  previousVersion: string;
  installedVersion: string;
  message: string;
}> {
  const check = await checkCliVersion();
  const previousVersion = check.currentVersion;

  // If already on the latest version and not forced, do NOT invoke npm install
  if (!check.updateAvailable && !options?.force) {
    await syncLocalBinSymlinks();
    return {
      success: true,
      alreadyUpToDate: true,
      previousVersion,
      installedVersion: previousVersion,
      message: `Ya tienes la última versión instalada (v${previousVersion}).`
    };
  }

  const targetVersion = check.latestVersion;
  const availableOnNpm =
    check.npmVersion !== null && compareSemver(check.npmVersion, targetVersion) >= 0;

  try {
    if (availableOnNpm) {
      await execAsync(`npm install -g @francisiv/orbitkit@${targetVersion} --prefer-online`);
      await syncLocalBinSymlinks();
    } else {
      // Latest version is on GitHub main (not yet propagated to NPM registry)
      await installFromGithubMain();
    }

    return {
      success: true,
      alreadyUpToDate: false,
      previousVersion,
      installedVersion: targetVersion,
      message: `OrbitKit actualizado correctamente: v${previousVersion} → v${targetVersion}`
    };
  } catch (err: any) {
    // If NPM failed with ETARGET or cache issue, fallback to GitHub main
    try {
      await installFromGithubMain();
      return {
        success: true,
        alreadyUpToDate: false,
        previousVersion,
        installedVersion: targetVersion,
        message: `OrbitKit actualizado desde GitHub (main): v${previousVersion} → v${targetVersion}`
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        alreadyUpToDate: false,
        previousVersion,
        installedVersion: previousVersion,
        message: `No se pudo actualizar: ${fallbackErr.message || err.message}`
      };
    }
  }
}

export async function performCliUninstall(options?: {
  cleanProject?: boolean;
  projectDir?: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // 1. If requested, clean .devdock/ metadata in the current project
    if (options?.cleanProject) {
      const targetDir = options.projectDir || process.cwd();
      await fs.rm(path.join(targetDir, '.devdock'), { recursive: true, force: true }).catch(() => {});
    }

    // 2. Remove custom ~/.local/bin symlinks if present
    for (const binName of ['orbitkit', 'devdock']) {
      const localBin = path.join(process.env.HOME || '', '.local', 'bin', binName);
      try {
        const stat = await fs.lstat(localBin);
        if (stat.isSymbolicLink() || stat.isFile()) {
          await fs.unlink(localBin);
        }
      } catch {
        // Ignore if not present
      }
    }

    // 3. Uninstall global npm package(s)
    await execAsync('npm uninstall -g @francisiv/orbitkit @devdock/cli').catch(async () => {
      await execAsync('npm uninstall -g @francisiv/orbitkit');
    });

    return {
      success: true,
      message: 'OrbitKit CLI (@francisiv/orbitkit) fue desinstalado globalmente del sistema.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error al desinstalar OrbitKit CLI: ${err.message || String(err)}`
    };
  }
}
