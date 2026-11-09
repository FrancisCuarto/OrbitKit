import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { scanForGodotProjects, inspectProject } from '../core/scanner.js';
import { installSkill, checkSkillUpdates, CURATED_SKILLS } from '../core/skillsManager.js';
import { installMcpServer, listConfiguredMcpServers } from '../core/mcpManager.js';
import { runSystemDiagnostics } from '../core/doctor.js';

describe('DevDock CLI Core Engine', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'devdock-test-'));
    // Create mock project.godot
    await fs.writeFile(
      path.join(tempDir, 'project.godot'),
      'config_version=5\n\n[application]\nconfig/name="Test Godot Game"\nconfig/features=PackedStringArray("4.3", "Forward Plus")\n'
    );
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('scans and inspects a Godot project correctly', async () => {
    const proj = await inspectProject(tempDir);
    expect(proj.name).toBe('Test Godot Game');
    expect(proj.godotFeatures).toContain('4.3');
    expect(proj.installedSkills.length).toBe(0);

    const parentDir = path.dirname(tempDir);
    const discovered = await scanForGodotProjects(parentDir, 2);
    expect(discovered.some((p) => p.projectPath === tempDir)).toBe(true);
  });

  it('installs AI skills into both .agents/skills and .claude/skills', async () => {
    const res = await installSkill(tempDir, 'gdscript-architect');
    expect(res.success).toBe(true);

    const agentSkillPath = path.join(tempDir, '.agents', 'skills', 'gdscript-architect', 'SKILL.md');
    const claudeSkillPath = path.join(tempDir, '.claude', 'skills', 'gdscript-architect', 'SKILL.md');

    const agentExists = await fs.access(agentSkillPath).then(() => true).catch(() => false);
    const claudeExists = await fs.access(claudeSkillPath).then(() => true).catch(() => false);

    expect(agentExists).toBe(true);
    expect(claudeExists).toBe(true);

    const content = await fs.readFile(agentSkillPath, 'utf8');
    expect(content).toContain('GDScript 4 Architect Skill');
  });

  it('detects available skill updates when versions differ', async () => {
    await installSkill(tempDir, 'gdscript-architect');

    // Simulate an older version installed
    const metaFile = path.join(tempDir, '.agents', 'skills', 'gdscript-architect', 'skill.json');
    await fs.writeFile(metaFile, JSON.stringify({ version: '1.0.0' }));

    const updates = await checkSkillUpdates(tempDir);
    expect(updates.length).toBe(1);
    expect(updates[0].skillId).toBe('gdscript-architect');
    expect(updates[0].currentVersion).toBe('1.0.0');
    const matched = CURATED_SKILLS.find((s) => s.id === 'gdscript-architect');
    expect(updates[0].latestVersion).toBe(matched?.version);
  });

  it('configures Godot MCP servers in .mcp.json', async () => {
    const res = await installMcpServer(tempDir, 'godot-lsp');
    expect(res.success).toBe(true);

    const configured = await listConfiguredMcpServers(tempDir);
    expect(configured).toContain('godot-lsp');

    const mcpRaw = await fs.readFile(path.join(tempDir, '.mcp.json'), 'utf8');
    const mcpJson = JSON.parse(mcpRaw);
    expect(mcpJson.mcpServers['godot-lsp'].command).toBe('npx');
    expect(mcpJson.mcpServers['godot-lsp'].env.GODOT_LSP_PORT).toBe('6005');
  });

  it('runs system diagnostics without throwing', async () => {
    const diag = await runSystemDiagnostics(tempDir);
    expect(diag.length).toBeGreaterThanOrEqual(3);
    const nodeDiag = diag.find((d) => d.name === 'Node.js Runtime');
    expect(nodeDiag?.status).toBe('ok');
  });
});
