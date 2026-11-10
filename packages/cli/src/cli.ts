import { Command } from 'commander';
import pc from 'picocolors';
import ora from 'ora';
import path from 'node:path';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { scanForGodotProjects, inspectProject } from './core/scanner.js';
import { CURATED_SKILLS, installSkill, checkSkillUpdates } from './core/skillsManager.js';
import { OFFICIAL_GODOT_MCP_SERVERS, installMcpServer, listConfiguredMcpServers } from './core/mcpManager.js';
import { updateProject, updateAllProjects } from './core/updater.js';
import { runSystemDiagnostics } from './core/doctor.js';
import { startGuiServer } from './ui/server.js';
import { startInteractiveTui } from './tui/interactiveTui.js';
import { checkCliVersion, performCliSelfUpdate, performCliUninstall } from './core/selfUpdater.js';
import { checkForUpdates, nextWithJitter } from './core/updateChecker.js';
import { notify } from './core/notifier.js';
import { shouldBackgroundCheck, scheduleBackgroundCheck, printCachedBanner } from './core/background.js';
import { applyUpdates } from './core/applier.js';
import { enableScheduler, disableScheduler } from './core/scheduler.js';
import { readConfig } from './core/config.js';

function readCliPackageVersion(): string {
  try {
    const raw = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version || '0.6.0';
  } catch {
    return '0.6.0';
  }
}

export function createCli(): Command {
  const program = new Command();
  const cliVersion = readCliPackageVersion();

  program
    .name('orbitkit')
    .description('OrbitKit CLI — Automated AI Skills, MCP Servers and Addon Manager for Godot Projects')
    .version(cliVersion)
    .action(async () => {
      if (process.stdout.isTTY) {
        await startInteractiveTui();
      } else {
        program.help();
      }
    });

  if (shouldBackgroundCheck()) {
    scheduleBackgroundCheck();
  }

  program.hook('postAction', async (_thisCommand, actionCommand) => {
    const cmdName = actionCommand?.name?.() || '';
    if (!process.argv.includes('--json') && cmdName !== 'check' && cmdName !== 'update') {
      await printCachedBanner();
    }
  });

  // Command: gui (alias: dashboard)
  program
    .command('gui')
    .alias('dashboard')
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

  // Command: ui (GUI by default, or TUI with --tui)
  program
    .command('ui')
    .description('Launch interactive User Interface (Web GUI by default, or TUI with --tui)')
    .option('--tui', 'Launch terminal text UI instead of web GUI')
    .option('-p, --port <port>', 'Port to run the dashboard server on', '4567')
    .option('-d, --dir <dir>', 'Directory to inspect or manage', '.')
    .option('--no-open', 'Do not open the browser automatically')
    .action(async (options) => {
      if (options.tui) {
        await startInteractiveTui();
      } else {
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
      }
    });

  // Command: tui
  program
    .command('tui')
    .description('Launch minimalist interactive Terminal User Interface (TUI)')
    .action(async () => {
      await startInteractiveTui();
    });

  // Command: upgrade / self-update
  program
    .command('upgrade')
    .alias('self-update')
    .description('Check for the latest OrbitKit CLI version and upgrade globally')
    .option('-c, --check', 'Only check if a newer version is available without installing')
    .action(async (options) => {
      const spinner = ora('Checking OrbitKit CLI version against NPM & GitHub...').start();
      const check = await checkCliVersion();
      spinner.stop();

      console.log(pc.bold(pc.cyan('\nOrbitKit Version Check:')));
      console.log(`  Installed version: ${pc.white('v' + check.currentVersion)}`);
      console.log(
        `  Latest version:    ${
          check.updateAvailable ? pc.yellow('v' + check.latestVersion + ' (Update available!)') : pc.green('v' + check.latestVersion + ' (Up to date)')
        }`
      );

      if (options.check || !check.updateAvailable) {
        if (check.updateAvailable) {
          console.log(pc.yellow(`\nRun ${pc.bold('orbitkit upgrade')} to install v${check.latestVersion}.\n`));
        } else {
          await performCliSelfUpdate({ force: false });
          console.log(pc.green(`\n✓ Ya tienes la última versión instalada (v${check.currentVersion}).\n`));
        }
        return;
      }

      const updateSpinner = ora(`Actualizando OrbitKit CLI (v${check.currentVersion} → v${check.latestVersion})...`).start();
      const res = await performCliSelfUpdate({ force: true });
      if (res.success) {
        updateSpinner.succeed(pc.green(res.message));
        console.log(pc.gray('  ✓ Global binary verified in PATH.\n'));
      } else {
        updateSpinner.fail(pc.red(res.message));
      }
    });

  // Command: uninstall / remove
  program
    .command('uninstall')
    .alias('remove')
    .description('Uninstall OrbitKit CLI globally from your system')
    .option('-p, --project', 'Also remove .devdock/ configuration from the current project')
    .action(async (options) => {
      const spinner = ora('Desinstalando OrbitKit CLI globalmente...').start();
      const res = await performCliUninstall({ cleanProject: Boolean(options.project) });
      if (res.success) {
        spinner.succeed(pc.green(res.message));
      } else {
        spinner.fail(pc.red(res.message));
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
    .description('Check & update OrbitKit CLI, AI Skills, MCPs, and Addons to the latest versions')
    .option('-a, --all', 'Update all detected Godot projects in the directory tree')
    .option('-c, --cli', 'Only check and update the global OrbitKit CLI binary')
    .action(async (target = '.', options) => {
      // 1. Always check if the CLI itself has a newer release
      const verCheck = await checkCliVersion();
      if (verCheck.updateAvailable || options.cli) {
        const cliSpin = ora(
          verCheck.updateAvailable
            ? `New OrbitKit CLI found (v${verCheck.currentVersion} → v${verCheck.latestVersion}). Updating CLI...`
            : `Verifying OrbitKit CLI v${verCheck.currentVersion}...`
        ).start();
        const selfRes = await performCliSelfUpdate({ force: verCheck.updateAvailable });
        if (selfRes.success) {
          cliSpin.succeed(pc.green(selfRes.message));
        } else {
          cliSpin.warn(pc.yellow(selfRes.message));
        }
        if (options.cli) return;
      } else {
        console.log(pc.gray(`✓ OrbitKit CLI v${verCheck.currentVersion} is up to date.`));
      }
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

  // Command: check
  program
    .command('check [dir]')
    .description('Check remote catalog for CLI updates, new AI skills, and outdated project skills')
    .option('--json', 'Output raw UpdateReport as JSON without colors or spinner')
    .option('-f, --force', 'Ignore cache interval and query catalog immediately')
    .option('-q, --quiet', 'Suppress output if offline')
    .option('-n, --notify', 'Trigger desktop and marker notifications with deduplication')
    .action(async (dir = '.', options) => {
      const targetDir = path.resolve(dir);
      const isJson = Boolean(options.json);
      const spinner = !isJson && !options.quiet ? ora('Consultando catálogo de OrbitKit...').start() : null;

      const report = await checkForUpdates(targetDir, {
        force: Boolean(options.force)
      });

      if (spinner) spinner.stop();

      if (options.notify) {
        const cfg = await readConfig(targetDir);
        await notify(report, {
          terminal: !options.quiet && !isJson,
          desktop: cfg.notify.desktop,
          projectDir: targetDir
        });
      }

      if (isJson) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      if (options.quiet) {
        return;
      }

      const catalogLabel = report.catalogGeneratedAt
        ? `catálogo ${report.catalogGeneratedAt}`
        : 'sin catálogo';
      console.log(pc.bold(pc.cyan(`\nOrbitKit Check · ${catalogLabel}\n`)));

      if (report.offline) {
        if (report.fromCache && report.catalogGeneratedAt) {
          console.log(
            pc.yellow(`  ⚠ Sin conexión, usando catálogo del ${report.catalogGeneratedAt}\n`)
          );
        } else {
          console.log(pc.yellow('  ⚠ Sin conexión y sin catálogo en caché.\n'));
        }
      }

      if (report.cli) {
        const cliStatus = report.cli.updateAvailable
          ? pc.yellow(`v${report.cli.current} → v${report.cli.latest}   (actualización disponible)`)
          : pc.green(`v${report.cli.current} (al día)`);
        console.log(`  CLI          ${cliStatus}`);

        if (report.cli.belowMin) {
          console.log(
            pc.red(
              `  ⚠ Tu OrbitKit v${report.cli.current} es anterior al mínimo soportado. Actualiza para continuar.`
            )
          );
        }
        if (report.cli.major) {
          console.log(
            pc.yellow(
              `  ⚠ Hay una major nueva (v${report.cli.latest}). No se aplicará automáticamente.`
            )
          );
        }
      }

      console.log(
        `  Skills       ${report.newSkills.length} nuevas, ${report.outdatedSkills.length} desactualizada(s)`
      );
      for (const s of report.newSkills) {
        console.log(pc.green(`    + ${s.id} v${s.version}`));
      }
      for (const s of report.outdatedSkills) {
        console.log(pc.yellow(`    ↑ ${s.id} v${s.from} → v${s.to}`));
      }

      if (report.errors.length > 0 && !report.offline) {
        for (const err of report.errors) {
          console.log(pc.red(`  ✗ ${err}`));
        }
      }

      const hasUpdates =
        Boolean(report.cli?.updateAvailable) ||
        report.newSkills.length > 0 ||
        report.outdatedSkills.length > 0;

      if (hasUpdates) {
        console.log(pc.cyan(`\n  Ejecuta \`orbitkit update --all\` para aplicar.\n`));
      } else if (!report.offline || report.fromCache) {
        console.log(pc.green('\n  ✓ Todo en órbita. Sin novedades.\n'));
      }
    });

  // Command: watch
  program
    .command('watch [dir]')
    .description('Run a foreground watcher that periodically checks and optionally applies updates')
    .option('-i, --interval <minutes>', 'Check interval in minutes', '60')
    .option('--auto-update', 'Automatically apply safe patch/minor skill updates')
    .option('--notify', 'Send desktop and terminal notifications when updates are detected')
    .option('--once', 'Run a single watch cycle and exit (useful for testing)')
    .action(async (dir = '.', options) => {
      const targetDir = path.resolve(dir);
      const cfg = await readConfig(targetDir);
      const intervalMinutes = Math.max(
        1,
        parseInt(String(options.interval), 10) || cfg.check.intervalMinutes
      );
      const baseIntervalMs = intervalMinutes * 60_000;

      console.log(
        pc.cyan(
          `👁 OrbitKit Watch iniciado en ${targetDir} (intervalo base: ${intervalMinutes} min, jitter activo)...`
        )
      );

      let stopped = false;
      const stopHandler = () => {
        stopped = true;
      };
      process.once('SIGINT', stopHandler);
      process.once('SIGTERM', stopHandler);

      while (!stopped) {
        const report = await checkForUpdates(targetDir, { force: true });

        if (options.notify ?? cfg.notify.terminal) {
          await notify(report, {
            terminal: true,
            desktop: Boolean(options.notify ?? cfg.notify.desktop),
            projectDir: targetDir
          });
        }

        if (options.autoUpdate ?? cfg.autoUpdate.skills) {
          const res = await applyUpdates(targetDir, report, {
            autoUpdateSkills: true,
            autoInstallNewSkills: cfg.autoUpdate.newSkills,
            autoUpdateMcps: cfg.autoUpdate.mcps,
            autoUpdateCli: false,
            allowMajor: cfg.autoUpdate.allowMajor
          });
          if (res.applied.length > 0) {
            console.log(pc.green(`  ✓ Actualizaciones aplicadas: ${res.applied.join(', ')}`));
          }
        }

        if (options.once || stopped) break;

        const waitMs = nextWithJitter(baseIntervalMs, 0);
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, waitMs);
          timer.unref?.();
        });
      }
    });

  // Command: autoupdate
  const autoupdateCmd = program
    .command('autoupdate')
    .description('Configure OS-native periodic background update checks (systemd, launchd, schtasks)');

  autoupdateCmd
    .command('enable')
    .description('Enable periodic background update checks in your OS scheduler')
    .option('-e, --every <interval>', 'Check interval (e.g. 6h, 12h, 30m)', '6h')
    .action(async (options) => {
      const res = await enableScheduler({ every: options.every });
      if (res.success) {
        console.log(pc.green(`✓ ${res.message}`));
        for (const art of res.artifacts) {
          console.log(pc.gray(`  Artefacto: ${art}`));
        }
      } else {
        console.log(pc.red(`✗ ${res.message}`));
        process.exitCode = 1;
      }
    });

  autoupdateCmd
    .command('disable')
    .description('Disable and remove OS scheduler units for OrbitKit')
    .action(async () => {
      const res = await disableScheduler();
      if (res.success) {
        console.log(pc.green(`✓ ${res.message}`));
      } else {
        console.log(pc.red(`✗ ${res.message}`));
        process.exitCode = 1;
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
