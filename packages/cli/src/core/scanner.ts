import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export interface DiscoveredProject {
  name: string;
  projectPath: string;
  configPath: string;
  godotFeatures: string[];
  installedAddons: string[];
  installedSkills: string[];
  hasMcpConfig: boolean;
  registryRecordCount: number;
  source?: 'local' | 'godot-registry';
}

export interface ScanOptions {
  maxDepth?: number;
  includeGodotConfig?: boolean;
  followSymlinks?: boolean;
}

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.godot',
  'dist',
  'build',
  '.cache',
  '.pnpm-store'
]);

/**
 * Discovers projects registered in Godot Engine's configuration and project manager
 * on Linux, macOS, and Windows.
 */
export async function getGodotRegisteredProjects(): Promise<DiscoveredProject[]> {
  const home = os.homedir();
  const candidateFiles: string[] = [
    // Linux / XDG
    path.join(process.env.XDG_DATA_HOME || path.join(home, '.local', 'share'), 'godot', 'projects.cfg'),
    path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), 'godot', 'projects.cfg'),
    path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), 'godot', 'recent_dirs'),
    // macOS
    path.join(home, 'Library', 'Application Support', 'Godot', 'projects.cfg'),
    path.join(home, 'Library', 'Application Support', 'Godot', 'recent_dirs'),
    // Windows
    path.join(process.env.APPDATA || '', 'Godot', 'projects.cfg'),
    path.join(process.env.LOCALAPPDATA || '', 'Godot', 'projects.cfg'),
    path.join(process.env.APPDATA || '', 'Godot', 'recent_dirs')
  ];

  // Also check editor settings for default or autoscan directories
  const editorSettingsCandidates: string[] = [
    path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), 'godot'),
    path.join(home, 'Library', 'Application Support', 'Godot'),
    path.join(process.env.APPDATA || '', 'Godot')
  ];

  for (const dir of editorSettingsCandidates) {
    try {
      const files = await fs.readdir(dir);
      for (const f of files) {
        if (f.startsWith('editor_settings') && f.endsWith('.tres')) {
          candidateFiles.push(path.join(dir, f));
        }
      }
    } catch {
      // Directory may not exist
    }
  }

  const foundPaths = new Set<string>();

  for (const cfgFile of candidateFiles) {
    try {
      const content = await fs.readFile(cfgFile, 'utf8');

      // 1. Match [path] sections from projects.cfg
      const sectionRegex = /^\s*\[([^\]]+)\]/gm;
      let match: RegExpExecArray | null;
      while ((match = sectionRegex.exec(content)) !== null) {
        let rawPath = match[1].trim();
        // Fix Windows escapes like C::/Users
        rawPath = rawPath.replace(/^([A-Za-z])::/, '$1:');
        if (rawPath.startsWith('::/')) rawPath = rawPath.replace('::/', ':/');

        if (rawPath) foundPaths.add(rawPath);
      }

      // 2. Match directory lines from recent_dirs
      if (cfgFile.endsWith('recent_dirs')) {
        const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          foundPaths.add(line);
        }
      }

      // 3. Match default_project_path / autoscan_project_path from editor_settings
      if (cfgFile.endsWith('.tres')) {
        const pathMatches = content.matchAll(/(?:default_project_path|autoscan_project_path)\s*=\s*"([^"]+)"/g);
        for (const pm of pathMatches) {
          if (pm[1] && pm[1].trim()) {
            foundPaths.add(pm[1].trim());
          }
        }
      }
    } catch {
      // Config file doesn't exist or isn't readable
    }
  }

  const projects: DiscoveredProject[] = [];
  const visitedRealPaths = new Set<string>();

  for (const p of foundPaths) {
    try {
      const stat = await fs.stat(p);
      if (!stat.isDirectory()) continue;

      const hasGodot = await hasProjectGodotFile(p);
      if (hasGodot) {
        const real = await fs.realpath(p);
        if (!visitedRealPaths.has(real)) {
          visitedRealPaths.add(real);
          const proj = await inspectProject(p);
          proj.source = 'godot-registry';
          projects.push(proj);
        }
      }
    } catch {
      // Invalid or inaccessible path
    }
  }

  return projects;
}

/**
 * Checks whether a directory contains a project.godot file (case-insensitive)
 */
async function hasProjectGodotFile(dir: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dir);
    return entries.some((e) => e.toLowerCase() === 'project.godot');
  } catch {
    return false;
  }
}

/**
 * Recursively scans directory to locate all Godot projects (containing project.godot).
 * Fully follows symlinks with cycle detection and merges with registered Godot Engine projects.
 */
export async function scanForGodotProjects(
  startDir: string = '.',
  maxDepthOrOptions: number | ScanOptions = 6
): Promise<DiscoveredProject[]> {
  const options: ScanOptions =
    typeof maxDepthOrOptions === 'number'
      ? { maxDepth: maxDepthOrOptions, includeGodotConfig: true, followSymlinks: true }
      : {
          maxDepth: maxDepthOrOptions.maxDepth ?? 6,
          includeGodotConfig: maxDepthOrOptions.includeGodotConfig ?? true,
          followSymlinks: maxDepthOrOptions.followSymlinks ?? true
        };

  const projects: DiscoveredProject[] = [];
  const visitedRealPaths = new Set<string>();
  const resolvedStart = path.resolve(startDir);

  // 1. Check if the start directory itself is a Godot project
  if (await hasProjectGodotFile(resolvedStart)) {
    try {
      const real = await fs.realpath(resolvedStart);
      visitedRealPaths.add(real);
      const proj = await inspectProject(resolvedStart);
      proj.source = 'local';
      projects.push(proj);
    } catch {
      // Ignore
    }
  }

  // 2. Recursive directory traversal
  async function walk(currentDir: string, depth: number) {
    if (depth > (options.maxDepth ?? 6)) return;

    let realCurrent: string;
    try {
      realCurrent = await fs.realpath(currentDir);
      if (visitedRealPaths.has(realCurrent)) {
        return;
      }
      visitedRealPaths.add(realCurrent);
    } catch {
      return;
    }

    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    // Check for project.godot in current directory (skip if already checked root)
    if (depth > 0 && entries.some((e) => e.name.toLowerCase() === 'project.godot')) {
      try {
        const proj = await inspectProject(currentDir);
        proj.source = 'local';
        projects.push(proj);
        // Do not descend further into a detected Godot project's asset directories
        return;
      } catch {
        // Continue
      }
    }

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;

      const subPath = path.join(currentDir, entry.name);
      let isDir = entry.isDirectory();

      // Follow symlinks if enabled
      if (!isDir && options.followSymlinks && entry.isSymbolicLink()) {
        try {
          const s = await fs.stat(subPath);
          isDir = s.isDirectory();
        } catch {
          isDir = false;
        }
      }

      if (isDir) {
        await walk(subPath, depth + 1);
      }
    }
  }

  // If startDir was not itself a project, traverse it
  if (projects.length === 0 || resolvedStart !== projects[0]?.projectPath) {
    await walk(resolvedStart, 0);
  }

  // 3. Merge projects registered in Godot Engine if requested
  if (options.includeGodotConfig) {
    try {
      const registered = await getGodotRegisteredProjects();
      for (const reg of registered) {
        try {
          const real = await fs.realpath(reg.projectPath);
          if (!visitedRealPaths.has(real)) {
            visitedRealPaths.add(real);
            projects.push(reg);
          }
        } catch {
          // If realpath fails, fallback to projectPath string check
          if (!projects.some((p) => p.projectPath === reg.projectPath)) {
            projects.push(reg);
          }
        }
      }
    } catch {
      // Ignore registry read errors
    }
  }

  return projects;
}

/**
 * Inspects a Godot project directory to gather installed skills, addons and configurations
 */
export async function inspectProject(projectDir: string): Promise<DiscoveredProject> {
  let actualConfigPath = path.join(projectDir, 'project.godot');
  let name = path.basename(projectDir);
  const godotFeatures: string[] = [];

  // Check case-insensitive project.godot
  try {
    const entries = await fs.readdir(projectDir);
    const match = entries.find((e) => e.toLowerCase() === 'project.godot');
    if (match) {
      actualConfigPath = path.join(projectDir, match);
    }
  } catch {
    // Keep default path
  }

  try {
    const configContent = await fs.readFile(actualConfigPath, 'utf8');
    const nameMatch = configContent.match(/config\/name="([^"]+)"/);
    if (nameMatch) name = nameMatch[1];

    const featureMatch = configContent.match(/config\/features=PackedStringArray\(([^)]+)\)/);
    if (featureMatch) {
      const parsed = featureMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/"/g, ''))
        .filter(Boolean);
      godotFeatures.push(...parsed);
    }
  } catch {
    // Keep defaults
  }

  // 1. Detect addons
  const installedAddons: string[] = [];
  const addonsDir = path.join(projectDir, 'addons');
  try {
    const addonEntries = await fs.readdir(addonsDir, { withFileTypes: true });
    for (const a of addonEntries) {
      let isDir = a.isDirectory();
      if (!isDir && a.isSymbolicLink()) {
        try {
          const st = await fs.stat(path.join(addonsDir, a.name));
          isDir = st.isDirectory();
        } catch {
          isDir = false;
        }
      }
      if (isDir) installedAddons.push(a.name);
    }
  } catch {
    // No addons dir
  }

  // 2. Detect AI Skills (.agents/skills and .claude/skills)
  const installedSkills: string[] = [];
  const skillPaths = [
    path.join(projectDir, '.agents', 'skills'),
    path.join(projectDir, '.claude', 'skills')
  ];

  for (const sp of skillPaths) {
    try {
      const sEntries = await fs.readdir(sp, { withFileTypes: true });
      for (const s of sEntries) {
        let isDir = s.isDirectory();
        if (!isDir && s.isSymbolicLink()) {
          try {
            const st = await fs.stat(path.join(sp, s.name));
            isDir = st.isDirectory();
          } catch {
            isDir = false;
          }
        }
        if (isDir && !installedSkills.includes(s.name)) {
          installedSkills.push(s.name);
        }
      }
    } catch {
      // No skills dir
    }
  }

  // 3. Detect MCP configuration
  let hasMcpConfig = false;
  const mcpFilePaths = [
    path.join(projectDir, '.mcp.json'),
    path.join(projectDir, '.cursor', 'mcp.json'),
    path.join(projectDir, 'mcp.json')
  ];

  for (const mcpFile of mcpFilePaths) {
    try {
      await fs.access(mcpFile);
      hasMcpConfig = true;
      break;
    } catch {
      // Continue
    }
  }

  // 4. Detect DevDock local registry
  let registryRecordCount = 0;
  const registryPath = path.join(projectDir, '.devdock', 'installed.json');
  try {
    const regRaw = await fs.readFile(registryPath, 'utf8');
    const regData = JSON.parse(regRaw);
    registryRecordCount = Object.keys(regData).length;
  } catch {
    // No local registry
  }

  return {
    name,
    projectPath: projectDir,
    configPath: actualConfigPath,
    godotFeatures,
    installedAddons,
    installedSkills,
    hasMcpConfig,
    registryRecordCount
  };
}
