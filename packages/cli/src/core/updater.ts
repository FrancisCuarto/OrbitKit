import { scanForGodotProjects, inspectProject, DiscoveredProject } from './scanner.js';
import { checkSkillUpdates, installSkill } from './skillsManager.js';
import { listConfiguredMcpServers, installMcpServer } from './mcpManager.js';
import { checkForUpdates } from './updateChecker.js';
import { applyUpdates } from './applier.js';
import { readConfig } from './config.js';
import { clearUpdateMarker } from './notifier.js';

export interface ProjectUpdateResult {
  project: DiscoveredProject;
  updatedSkills: string[];
  updatedMcps: string[];
  errors: string[];
  backupDir?: string;
}

/**
 * Updates a specific Godot project using the remote catalog and safe applier (with backup + rollback),
 * falling back to bundled CURATED_SKILLS if offline without a cached catalog.
 */
export async function updateProject(
  projectDir: string,
  opts?: { allowMajor?: boolean; installNew?: boolean }
): Promise<ProjectUpdateResult> {
  const project = await inspectProject(projectDir);
  const updatedSkills: string[] = [];
  const updatedMcps: string[] = [];
  const errors: string[] = [];
  let backupDir: string | undefined;

  // 1. Check and update skills (via remote/cached catalog if available, or bundled fallback)
  try {
    const cfg = await readConfig(projectDir);
    const report = await checkForUpdates(projectDir);

    const hasRemoteCatalog = !report.offline || report.fromCache;
    if (hasRemoteCatalog && (report.outdatedSkills.length > 0 || (opts?.installNew && report.newSkills.length > 0))) {
      const applyRes = await applyUpdates(projectDir, report, {
        autoUpdateSkills: true,
        autoInstallNewSkills: Boolean(opts?.installNew ?? cfg.autoUpdate.newSkills),
        autoUpdateMcps: false,
        autoUpdateCli: false,
        allowMajor: Boolean(opts?.allowMajor ?? cfg.autoUpdate.allowMajor)
      });

      backupDir = applyRes.backupDir;

      for (const skillId of applyRes.applied) {
        const outItem = report.outdatedSkills.find((s) => s.id === skillId);
        if (outItem) {
          updatedSkills.push(`${skillId} (v${outItem.from} -> v${outItem.to})`);
        } else {
          const newItem = report.newSkills.find((s) => s.id === skillId);
          updatedSkills.push(`${skillId} (v${newItem?.version || '1.0.0'})`);
        }
      }

      for (const fail of applyRes.failed) {
        errors.push(`Skill ${fail.id}: ${fail.reason}`);
      }
    } else {
      // Fallback to bundled CURATED_SKILLS
      const pendingSkillUpdates = await checkSkillUpdates(projectDir);
      for (const update of pendingSkillUpdates) {
        const res = await installSkill(projectDir, update.skillId);
        if (res.success) {
          updatedSkills.push(
            `${update.skillId} (v${update.currentVersion} -> v${update.latestVersion})`
          );
        } else {
          errors.push(`Skill ${update.skillId}: ${res.message}`);
        }
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Skills update failed: ${msg}`);
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`MCP sync failed: ${msg}`);
  }

  if (errors.length === 0) {
    await clearUpdateMarker(projectDir);
  }

  return {
    project,
    updatedSkills,
    updatedMcps,
    errors,
    ...(backupDir ? { backupDir } : {})
  };
}

/**
 * Updates all Godot projects found inside a directory
 */
export async function updateAllProjects(
  baseDir: string,
  opts?: { allowMajor?: boolean; installNew?: boolean }
): Promise<ProjectUpdateResult[]> {
  const projects = await scanForGodotProjects(baseDir);
  const results: ProjectUpdateResult[] = [];

  for (const proj of projects) {
    const res = await updateProject(proj.projectPath, opts);
    results.push(res);
  }

  return results;
}
