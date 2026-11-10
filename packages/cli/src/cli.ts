import { Command } from 'commander';
import pc from 'picocolors';
import ora from 'ora';
import path from 'node:path';
import fs from 'node:fs/promises';
import { scanForGodotProjects, inspectProject } from './core/scanner.js';
import { CURATED_SKILLS, installSkill, checkSkillUpdates } from './core/skillsManager.js';
import { OFFICIAL_GODOT_MCP_SERVERS, installMcpServer, listConfiguredMcpServers } from './core/mcpManager.js';
import { updateProject, updateAllProjects } from './core/updater.js';
import { runSystemDiagnostics } from './core/doctor.js';
import { startGuiServer } from './ui/server.js';

export function createCli(): Command {
  const program = new Command();

  program
    .name('devdock')
    .description('DevDock CLI — Automated AI Skills, MCP Servers and Addon Manager for Godot Projects')
    .version('0.1.0');

  // Command: ui (alias: gui)
  program
    .command('ui')
    .alias('gui')
    .description('Launch the interactive OrbitKit GUI web dashboard in your browser')
    .option('-p, --port <port>', 'Port to run the dashboard server on', '4567')
    .option('-d, --dir <dir>', 'Directory to inspect or manage', '.')
    .option('--no-open', 'Do not open the browser automatically')
    .action(async (options) => {
      const port = parseInt(options.port, 10) || 4567;
      const targetDir = path.resolve(options.dir || '.');
      const spinner = ora('Starting OrbitKit GUI Dashboard...').start();
      try {
        const { url, port: actualPort } = await startGuiServer({
          port,
          dir: targetDir,
          openBrowser: options.open !== false
        });
        spinner.succeed(pc.green('OrbitKit GUI Dashboard is live!'));
        console.log(pc.bold(pc.cyan(`\n  🚀 Local:   ${pc.underline(url)}`)));
        console.log(pc.gray(`  📁 Target:  ${targetDir}`));
        console.log(pc.gray(`  🔌 Port:    ${actualPort}`));
        console.log(pc.yellow(`\nPress Ctrl+C to stop the GUI server.\n`));
      } catch (err: any) {
        spinner.fail(pc.red(`Failed to start GUI server: ${err.message}`));
      }
    });

  // Command: init
  program
    .command('init')
    .description('Initialize DevDock in the current Godot project')
    .action(async () => {
      const spinner = ora('Initializing DevDock in project...').start();
      try {
        const cwd = process.cwd();
        const godotFile = path.join(cwd, 'project.godot');
        let createdProjectGodot = false;

        try {
          await fs.access(godotFile);
        } catch {
          // Auto-create a standard Godot 4 project.godot if not yet present
          const projectName = path.basename(cwd);
          const baseConfig = `; Engine configuration file.\n; Initialized by OrbitKit\nconfig_version=5\n\n[application]\n\nconfig/name="${projectName}"\nconfig/features=PackedStringArray("4.3", "Forward Plus")\n`;
          await fs.writeFile(godotFile, baseConfig, 'utf8');
          createdProjectGodot = true;
        }

        // Setup directories
        await fs.mkdir(path.join(cwd, '.devdock'), { recursive: true });
        await fs.mkdir(path.join(cwd, '.agents', 'skills'), { recursive: true });
        await fs.mkdir(path.join(cwd, '.claude', 'skills'), { recursive: true });

        // Install default godot4-syntax-guardian skill
        await installSkill(cwd, 'godot4-syntax-guardian');

        // Configure default godot-lsp MCP server
        await installMcpServer(cwd, 'godot-lsp');

        spinner.succeed(pc.green('DevDock initialized successfully!'));
        if (createdProjectGodot) {
          console.log(pc.cyan('  ✓ Created default project.godot (Godot 4)'));
        }
        console.log(pc.cyan('  ✓ .devdock/ directory created'));
        console.log(pc.cyan('  ✓ Default AI Skill installed (.agents/skills/godot4-syntax-guardian)'));
        console.log(pc.cyan('  ✓ Godot LSP MCP configured in .mcp.json'));
        console.log(pc.gray('\nRun "devdock doctor" to verify your environment.\n'));
      } catch (err: any) {
        spinner.fail(pc.red('Failed to initialize: ' + err.message));
      }
    });

  // Command: scan
  program
    .command('scan [dir]')
    .description('Scan directory for Godot projects and show installed skills, addons and MCPs')
    .action(async (dir = '.') => {
      const targetDir = path.resolve(dir);
      const spinner = ora(`Scanning for Godot projects in ${targetDir} and Godot Engine registry...`).start();

      const projects = await scanForGodotProjects(targetDir, { maxDepth: 6, includeGodotConfig: true });
      spinner.stop();

      if (projects.length === 0) {
        console.log(pc.yellow(`No Godot projects found in ${targetDir} or Godot Engine registry.`));
        console.log(pc.gray('Tip: Run "orbitkit init" in a project directory to initialize OrbitKit.'));
        return;
      }

      console.log(pc.bold(pc.cyan(`\nFound ${projects.length} Godot project(s):\n`)));

      for (const p of projects) {
        const sourceBadge = p.source === 'godot-registry' ? pc.yellow(' [Godot Engine]') : pc.green(' [Local]');
        console.log(pc.bold(pc.white(`📁 ${p.name}`)) + sourceBadge + pc.gray(` (${p.projectPath})`));
        console.log(
          `   Addons: ${p.installedAddons.length ? pc.green(p.installedAddons.join(', ')) : pc.gray('none')}`
        );
        console.log(
          `   AI Skills: ${p.installedSkills.length ? pc.magenta(p.installedSkills.join(', ')) : pc.gray('none')}`
        );
        console.log(
          `   MCP Server Config: ${p.hasMcpConfig ? pc.green('Active (.mcp.json)') : pc.gray('none')}`
        );
        console.log('');
      }
    });

  // Command: update
  program
    .command('update [target]')
    .description('Update AI Skills, MCPs, and Addons to the latest versions')
    .option('-a, --all', 'Update all detected Godot projects in the directory tree')
    .action(async (target = '.', options) => {
      if (options.all) {
        const spinner = ora('Scanning and updating all Godot projects...').start();
        const results = await updateAllProjects(target);
        spinner.stop();

        console.log(pc.bold(pc.cyan(`\nCompleted updates across ${results.length} project(s):\n`)));
        for (const res of results) {
          console.log(pc.bold(pc.white(`Project: ${res.project.name}`)));
          if (res.updatedSkills.length) {
            console.log(pc.green(`  ✓ Skills updated: ${res.updatedSkills.join(', ')}`));
          } else {
            console.log(pc.gray('  - Skills already up to date.'));
          }
          if (res.updatedMcps.length) {
            console.log(pc.green(`  ✓ MCP servers synced: ${res.updatedMcps.join(', ')}`));
          }
          if (res.errors.length) {
            console.log(pc.red(`  ✗ Warnings: ${res.errors.join('; ')}`));
          }
          console.log('');
        }
      } else {
        const spinner = ora('Checking and updating current project...').start();
        const res = await updateProject(target);
        spinner.stop();

        console.log(pc.bold(pc.cyan(`\nUpdate summary for "${res.project.name}":\n`)));
        if (res.updatedSkills.length) {
          console.log(pc.green(`  ✓ Skills updated: ${res.updatedSkills.join(', ')}`));
        } else {
          console.log(pc.gray('  - Skills already up to date.'));
        }
        if (res.updatedMcps.length) {
          console.log(pc.green(`  ✓ MCP servers synced: ${res.updatedMcps.join(', ')}`));
        }
        if (res.errors.length) {
          console.log(pc.red(`  ✗ Errors: ${res.errors.join('; ')}`));
        }
        console.log(pc.green('\nProject is up to date with latest ecosystem standards!\n'));
      }
    });

  // Command group: skill
  const skillCmd = program.command('skill').description('Manage AI coding agent skills');

  skillCmd
    .command('list')
    .description('List all available AI skills in the DevDock catalog')
    .action(() => {
      console.log(pc.bold(pc.cyan('\nAvailable AI Skills for Godot 4:\n')));
      for (const s of CURATED_SKILLS) {
        console.log(pc.bold(pc.magenta(`• ${s.name} (${s.id})`)) + pc.gray(` [v${s.version}]`));
        console.log(`  ${s.description}\n`);
      }
      console.log(pc.gray('Install using: devdock skill install <skill-id>\n'));
    });

  skillCmd
    .command('install <skillId>')
    .description('Install a skill into the current Godot project')
    .action(async (skillId) => {
      const spinner = ora(`Installing skill '${skillId}'...`).start();
      const res = await installSkill(process.cwd(), skillId);
      if (res.success) {
        spinner.succeed(pc.green(res.message));
      } else {
        spinner.fail(pc.red(res.message));
      }
    });

  // Command group: mcp
  const mcpCmd = program.command('mcp').description('Manage Model Context Protocol (MCP) servers');

  mcpCmd
    .command('list')
    .description('List available Godot MCP servers')
    .action(async () => {
      console.log(pc.bold(pc.cyan('\nAvailable Godot Model Context Protocol (MCP) Servers:\n')));
      for (const s of OFFICIAL_GODOT_MCP_SERVERS) {
        console.log(pc.bold(pc.green(`• ${s.name} (${s.id})`)));
        console.log(`  Command: ${s.command} ${s.args.join(' ')}`);
        console.log(`  ${s.description}\n`);
      }
      console.log(pc.gray('Add to current project using: devdock mcp add <server-id>\n'));
    });

  mcpCmd
    .command('add <serverId>')
    .description('Configure an MCP server in the current project (.mcp.json)')
    .action(async (serverId) => {
      const spinner = ora(`Configuring MCP server '${serverId}'...`).start();
      const res = await installMcpServer(process.cwd(), serverId);
      if (res.success) {
        spinner.succeed(pc.green(res.message));
      } else {
        spinner.fail(pc.red(res.message));
      }
    });

  // Command: doctor
  program
    .command('doctor')
    .description('Diagnose Godot, GDScript LSP, and AI assistant environment')
    .action(async () => {
      const spinner = ora('Running DevDock diagnostics...').start();
      const items = await runSystemDiagnostics(process.cwd());
      spinner.stop();

      console.log(pc.bold(pc.cyan('\nDevDock Health Diagnostics:\n')));
      for (const item of items) {
        const icon =
          item.status === 'ok'
            ? pc.green('✓')
            : item.status === 'warning'
            ? pc.yellow('⚠')
            : pc.red('✗');

        console.log(` ${icon} ${pc.bold(item.name)}: ${item.message}`);
      }
      console.log('');
    });

  return program;
}
