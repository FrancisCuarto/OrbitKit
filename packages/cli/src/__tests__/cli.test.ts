import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { scanForGodotProjects, inspectProject } from '../core/scanner.js';
import { installSkill, checkSkillUpdates, CURATED_SKILLS } from '../core/skillsManager.js';
import { installMcpServer, listConfiguredMcpServers } from '../core/mcpManager.js';
import { runSystemDiagnostics } from '../core/doctor.js';
import { startGuiServer } from '../ui/server.js';
import { renderGuiHtml } from '../ui/html.js';
import { compareSemver, getCurrentCliVersion } from '../core/selfUpdater.js';

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

  it('renders GUI HTML containing brand and interactive sections', () => {
    const html = renderGuiHtml();
    expect(html).toContain('OrbitKit GUI');
    expect(html).toContain('AI Skills');
    expect(html).toContain('Servidores MCP');
    expect(html).toContain('Doctor');
    expect(html).toContain('Comandos CLI');
  });

  it('starts GUI server, serves HTML and handles REST API requests', async () => {
    const gui = await startGuiServer({
      port: 5678,
      dir: tempDir,
      openBrowser: false
    });

    try {
      expect(gui.port).toBe(5678);
      expect(gui.url).toBe('http://localhost:5678');

      // Test GET /
      const resHtml = await fetch(gui.url);
      expect(resHtml.status).toBe(200);
      const textHtml = await resHtml.text();
      expect(textHtml).toContain('OrbitKit GUI');

      // Test GET /api/commands
      const resCmds = await fetch(`${gui.url}/api/commands`);
      const dataCmds = (await resCmds.json()) as any;
      expect(dataCmds.success).toBe(true);
      expect(dataCmds.commands.length).toBeGreaterThan(5);
      expect(dataCmds.commands.some((c: any) => c.command === 'orbitkit ui')).toBe(true);

      // Test GET /api/status
      const resStatus = await fetch(`${gui.url}/api/status`);
      const dataStatus = (await resStatus.json()) as any;
      expect(dataStatus.success).toBe(true);
      expect(dataStatus.nodeVersion).toBe(process.version);

      // Test GET /api/skills
      const resSkills = await fetch(`${gui.url}/api/skills?dir=${encodeURIComponent(tempDir)}`);
      const dataSkills = (await resSkills.json()) as any;
      expect(dataSkills.success).toBe(true);
      expect(dataSkills.skills.length).toBeGreaterThan(0);

      // Test POST /api/skills/install
      const resInstallSkill = await fetch(`${gui.url}/api/skills/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectDir: tempDir, skillId: 'godot4-syntax-guardian' })
      });
      const dataInstallSkill = (await resInstallSkill.json()) as any;
      expect(dataInstallSkill.success).toBe(true);

      // Verify skill was installed on disk
      const skillPath = path.join(tempDir, '.agents', 'skills', 'godot4-syntax-guardian', 'SKILL.md');
      const skillFileExists = await fs.access(skillPath).then(() => true).catch(() => false);
      expect(skillFileExists).toBe(true);

      // Test POST /api/mcps/add
      const resAddMcp = await fetch(`${gui.url}/api/mcps/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectDir: tempDir, serverId: 'godot-lsp' })
      });
      const dataAddMcp = (await resAddMcp.json()) as any;
      expect(dataAddMcp.success).toBe(true);

      // Verify .mcp.json exists on disk
      const mcpPath = path.join(tempDir, '.mcp.json');
      const mcpExists = await fs.access(mcpPath).then(() => true).catch(() => false);
      expect(mcpExists).toBe(true);
    } finally {
      await gui.close();
    }
  });

  it('detects Godot projects through symlinks and direct folder paths', async () => {
    // Test direct scan on the project directory
    const directScan = await scanForGodotProjects(tempDir, { maxDepth: 1, includeGodotConfig: false });
    expect(directScan.length).toBe(1);
    expect(directScan[0].name).toBe('Test Godot Game');

    // Create a symlink to tempDir
    const symlinkDir = path.join(os.tmpdir(), `symlink-godot-${Date.now()}`);
    try {
      await fs.symlink(tempDir, symlinkDir, 'dir');
      const symlinkScan = await scanForGodotProjects(symlinkDir, { maxDepth: 1, includeGodotConfig: false });
      expect(symlinkScan.length).toBe(1);
      expect(symlinkScan[0].name).toBe('Test Godot Game');
    } finally {
      try {
        await fs.unlink(symlinkDir);
      } catch {
        // Ignore
      }
    }
  });

  it('compares SemVer versions accurately for CLI self-updates', async () => {
    expect(compareSemver('0.4.0', '0.3.0')).toBe(1);
    expect(compareSemver('0.2.0', '0.4.0')).toBe(-1);
    expect(compareSemver('0.4.0', '0.4.0')).toBe(0);
    expect(compareSemver('v1.0.0', '0.9.9')).toBe(1);

    const ver = await getCurrentCliVersion();
    expect(ver).toBe('0.6.3');
  });
});
