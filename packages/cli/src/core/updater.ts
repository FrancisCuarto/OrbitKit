import { scanForGodotProjects, inspectProject, DiscoveredProject } from './scanner.js';
import { checkSkillUpdates, installSkill } from './skillsManager.js';
import { listConfiguredMcpServers, installMcpServer } from './mcpManager.js';

export interface ProjectUpdateResult {
  project: DiscoveredProject;
  updatedSkills: string[];
  updatedMcps: string[];
  errors: string[];
}

/**
 * Updates a specific Godot project
 */
export async function updateProject(projectDir: string): Promise<ProjectUpdateResult> {
  const project = await inspectProject(projectDir);
  const updatedSkills: string[] = [];
  const updatedMcps: string[] = [];
  const errors: string[] = [];

  // 1. Check and update skills
  try {
    const pendingSkillUpdates = await checkSkillUpdates(projectDir);
    for (const update of pendingSkillUpdates) {
      const res = await installSkill(projectDir, update.skillId);
      if (res.success) {
        updatedSkills.push(`${update.skillId} (v${update.currentVersion} -> v${update.latestVersion})`);
      } else {
        errors.push(`Skill ${update.skillId}: ${res.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Skills update failed: ${err.message}`);
  }

  // 2. Check and sync MCP servers
  try {
    const configured = await listConfiguredMcpServers(projectDir);
    for (const serverId of configured) {
      const res = await installMcpServer(projectDir, serverId);
      if (res.success) {
        updatedMcps.push(serverId);
      }
    }
  } catch (err: any) {
    errors.push(`MCP sync failed: ${err.message}`);
  }

  return {
    project,
    updatedSkills,
    updatedMcps,
    errors
  };
}

/**
 * Updates all Godot projects found inside a directory
 */
export async function updateAllProjects(
  baseDir: string
): Promise<ProjectUpdateResult[]> {
  const projects = await scanForGodotProjects(baseDir);
  const results: ProjectUpdateResult[] = [];

  for (const proj of projects) {
    const res = await updateProject(proj.projectPath);
    results.push(res);
  }

  return results;
}
