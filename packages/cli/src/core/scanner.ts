import fs from 'node:fs/promises';
import path from 'node:path';

export interface DiscoveredProject {
  name: string;
  projectPath: string;
  configPath: string;
  godotFeatures: string[];
  installedAddons: string[];
  installedSkills: string[];
  hasMcpConfig: boolean;
  registryRecordCount: number;
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
 * Recursively scans directory to locate all Godot projects (containing project.godot)
 */
export async function scanForGodotProjects(
  startDir: string,
  maxDepth = 4
): Promise<DiscoveredProject[]> {
  const projects: DiscoveredProject[] = [];

  async function walk(currentDir: string, depth: number) {
    if (depth > maxDepth) return;

    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    const hasProjectGodot = entries.some(
      (e) => e.isFile() && e.name === 'project.godot'
    );

    if (hasProjectGodot) {
      const proj = await inspectProject(currentDir);
      projects.push(proj);
      // Once a project is detected, don't descend further into its internal assets
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory() && !IGNORED_DIRS.has(entry.name)) {
        await walk(path.join(currentDir, entry.name), depth + 1);
      }
    }
  }

  await walk(path.resolve(startDir), 0);
  return projects;
}

/**
 * Inspects a Godot project directory to gather installed skills, addons and configurations
 */
export async function inspectProject(projectDir: string): Promise<DiscoveredProject> {
  const configPath = path.join(projectDir, 'project.godot');
  let name = path.basename(projectDir);
  const godotFeatures: string[] = [];

  try {
    const configContent = await fs.readFile(configPath, 'utf8');
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
      if (a.isDirectory()) installedAddons.push(a.name);
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
        if (s.isDirectory() && !installedSkills.includes(s.name)) {
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
    configPath,
    godotFeatures,
    installedAddons,
    installedSkills,
    hasMcpConfig,
    registryRecordCount
  };
}
