import readline from 'node:readline';
import os from 'node:os';
import { scanForGodotProjects, inspectProject, DiscoveredProject } from '../core/scanner.js';
import { CURATED_SKILLS, installSkill } from '../core/skillsManager.js';
import { OFFICIAL_GODOT_MCP_SERVERS, installMcpServer } from '../core/mcpManager.js';
import { installGodotPlugin } from '../core/pluginManager.js';
import { runSystemDiagnostics, DiagnosticItem } from '../core/doctor.js';
import {
  checkCliVersion,
  getCurrentCliVersion,
  performCliSelfUpdate,
  performCliUninstall,
  VersionCheckResult
} from '../core/selfUpdater.js';
import { startGuiServer } from '../ui/server.js';

type Screen = 'main' | 'skills' | 'mcp' | 'projects' | 'doctor' | 'search';

const fg = (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`;
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Minimalist palette
const C = {
  accent: `${BOLD}${fg(71, 140, 191)}`,  // Godot blue (#478cbf)
  cyan: fg(56, 189, 248),                // Sky cyan
  white: `${BOLD}${fg(241, 245, 249)}`,  // Bold white
  text: fg(203, 213, 225),               // Normal slate text
  muted: fg(100, 116, 139),              // Muted gray
  dim: fg(71, 85, 105),                  // Subtle separator
  green: fg(16, 185, 129),               // Success green
  amber: fg(245, 158, 11),               // Update / warning amber
  red: fg(244, 63, 94)                   // Error red
};

async function installEverythingInProject(projectPath: string): Promise<{
  pluginInstalled: boolean;
  skillsCount: number;
  mcpsCount: number;
  errors: string[];
}> {
  let pluginInstalled = false;
  let skillsCount = 0;
  let mcpsCount = 0;
  const errors: string[] = [];

  // 1. Install and enable the Godot 4 Editor plugin (addons/orbitkit/plugin.cfg) in project.godot
  try {
    const plugRes = await installGodotPlugin(projectPath);
    pluginInstalled = plugRes.success;
    if (!plugRes.success) {
      errors.push(plugRes.message);
    }
  } catch (err: any) {
    errors.push(`plugin: ${err.message}`);
  }

  // 2. Install all curated AI skills (.agents/skills & .claude/skills)
  for (const skill of CURATED_SKILLS) {
    const res = await installSkill(projectPath, skill.id);
    if (res.success) {
      skillsCount++;
    } else {
      errors.push(`${skill.id}: ${res.message}`);
    }
  }

  // 3. Configure all official Godot MCP servers in .mcp.json
  for (const mcp of OFFICIAL_GODOT_MCP_SERVERS) {
    const res = await installMcpServer(projectPath, mcp.id);
    if (res.success) {
      mcpsCount++;
    } else {
      errors.push(`${mcp.id}: ${res.message}`);
    }
  }

  return { pluginInstalled, skillsCount, mcpsCount, errors };
}

export async function startInteractiveTui(): Promise<void> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) {
    console.log('Interactive UI requires a TTY terminal.');
    return;
  }

  const currentVersion = await getCurrentCliVersion();
  let versionStatus: VersionCheckResult = {
    currentVersion,
    latestVersion: currentVersion,
    npmVersion: null,
    githubVersion: null,
    latestSource: 'local',
    updateAvailable: false
  };

  let activeProjectDir = process.cwd();
  let projects: DiscoveredProject[] = [];
  let screen: Screen = 'main';
  let cursor = 0;
  let searchQuery = '';
  let notice = '';
  let noticeColor = C.muted;
  let doctorItems: DiagnosticItem[] | null = null;
  let confirmingUninstall = false;

  // Non-blocking background startup checks (projects + Godot registry + remote version)
  scanForGodotProjects(process.cwd(), { maxDepth: 4, includeGodotConfig: true })
    .then((found) => {
      projects = found;
      if (projects.length > 0 && !projects.some((p) => p.projectPath === activeProjectDir)) {
        activeProjectDir = projects[0].projectPath;
      }
      render();
    })
    .catch(() => {});

  checkCliVersion()
    .then((res) => {
      versionStatus = res;
      render();
    })
    .catch(() => {});

  function setNotice(msg: string, tone: 'info' | 'ok' | 'warn' | 'err' = 'info') {
    notice = msg;
    noticeColor =
      tone === 'ok' ? C.green : tone === 'warn' ? C.amber : tone === 'err' ? C.red : C.cyan;
  }

  async function runSelfUpgrade() {
    setNotice('Comprobando última versión de OrbitKit en NPM y GitHub...', 'info');
    render();
    const check = await checkCliVersion();
    versionStatus = check;

    if (!check.updateAvailable) {
      await performCliSelfUpdate({ force: false });
      setNotice(`✓ Ya tienes la última versión instalada (v${check.currentVersion}).`, 'ok');
      render();
      return;
    }

    setNotice(`Actualizando CLI: v${check.currentVersion} → v${check.latestVersion}...`, 'warn');
    render();

    const res = await performCliSelfUpdate({ force: true });
    if (res.success) {
      versionStatus = {
        ...versionStatus,
        currentVersion: res.installedVersion,
        latestVersion: res.installedVersion,
        updateAvailable: false
      };
      setNotice(`✓ ${res.message}`, 'ok');
    } else {
      setNotice(`✗ ${res.message}`, 'err');
    }
    render();
  }

  const mainItems = [
    {
      label: 'Web GUI Dashboard',
      hint: () => 'Launch interactive browser dashboard (http://localhost:4567)',
      action: async () => {
        setNotice('Launching OrbitKit Web GUI...', 'info');
        render();
        try {
          const { url } = await startGuiServer({ port: 4567, dir: activeProjectDir, openBrowser: true });
          setNotice(`✓ GUI running at ${url} (opened in browser)`, 'ok');
        } catch (err: any) {
          setNotice(`✗ Failed to start GUI: ${err.message}`, 'err');
        }
        render();
      }
    },
    {
      label: 'Skills',
      hint: () => `Install Godot 4 & Blender AI skills (${CURATED_SKILLS.length})`,
      action: async () => {
        screen = 'skills';
        cursor = 0;
      }
    },
    {
      label: 'MCP Servers',
      hint: () => `Configure LSP :6005 & Context7 (${OFFICIAL_GODOT_MCP_SERVERS.length})`,
      action: async () => {
        screen = 'mcp';
        cursor = 0;
      }
    },
    {
      label: 'Projects',
      hint: () => `Select Godot 4 project & install everything (${projects.length} detected)`,
      action: async () => {
        screen = 'projects';
        cursor = 0;
        if (projects.length === 0) {
          setNotice(`Escaneando proyectos Godot en ${os.homedir()}...`, 'info');
          render();
          projects = await scanForGodotProjects(os.homedir(), { maxDepth: 4, includeGodotConfig: true });
          if (projects.length > 0) {
            activeProjectDir = projects[0].projectPath;
            setNotice(`✓ ${projects.length} proyecto(s) encontrado(s). Presiona Enter para instalar todo en el proyecto seleccionado.`, 'ok');
          } else {
            setNotice('No se encontraron proyectos Godot.', 'warn');
          }
        } else {
          setNotice('Presiona Enter sobre un proyecto para instalarle todos los Skills y MCPs.', 'info');
        }
      }
    },
    {
      label: 'Doctor',
      hint: () => 'Verify Godot binary & LSP port 6005',
      action: async () => {
        screen = 'doctor';
        cursor = 0;
        if (!doctorItems) {
          setNotice('Running environment diagnostics...', 'info');
          render();
          doctorItems = await runSystemDiagnostics(activeProjectDir);
          notice = '';
        }
      }
    },
    {
      label: 'Upgrade CLI',
      hint: () =>
        versionStatus.updateAvailable
          ? `Update available: v${versionStatus.currentVersion} → v${versionStatus.latestVersion}`
          : `Check for updates (v${versionStatus.currentVersion} installed)`,
      action: async () => {
        await runSelfUpgrade();
      }
    },
    {
      label: 'Uninstall CLI',
      hint: () => 'Remove OrbitKit CLI globally from this system',
      action: async () => {
        confirmingUninstall = true;
        setNotice('⚠ Confirm uninstall OrbitKit CLI? Press [y] to confirm or any other key to cancel.', 'warn');
      }
    }
  ];

  function getSearchMatches() {
    const q = searchQuery.toLowerCase().trim();
    const skills = CURATED_SKILLS.filter(
      (s) => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).map((s) => ({ type: 'skill' as const, id: s.id, title: s.name, desc: s.description }));

    const mcps = OFFICIAL_GODOT_MCP_SERVERS.filter(
      (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
    ).map((m) => ({ type: 'mcp' as const, id: m.id, title: m.name, desc: m.description }));

    return [...skills, ...mcps];
  }

  function getMaxCursor(): number {
    if (screen === 'main') return mainItems.length - 1;
    if (screen === 'skills') return CURATED_SKILLS.length - 1;
    if (screen === 'mcp') return OFFICIAL_GODOT_MCP_SERVERS.length - 1;
    if (screen === 'projects') return Math.max(0, projects.length - 1);
    if (screen === 'doctor') return Math.max(0, (doctorItems?.length || 1) - 1);
    if (screen === 'search') return Math.max(0, getSearchMatches().length - 1);
    return 0;
  }

  function cleanupAndExit() {
    stdout.write('\x1B[?25h');
    if (stdin.isTTY) stdin.setRawMode(false);
    stdin.pause();
    stdout.write('\n');
    process.exit(0);
  }

  function render() {
    stdout.write('\x1B[2J\x1B[0f\x1B[?25l');
    const lines: string[] = [''];

    // Minimalist Header
    const verBadge = versionStatus.updateAvailable
      ? `${C.amber}⬆ v${versionStatus.latestVersion} available (press u)${RESET}`
      : `${C.green}✓ v${versionStatus.currentVersion}${RESET}`;

    const shortTarget = activeProjectDir.replace(os.homedir(), '~');
    lines.push(`  ${C.accent}●${RESET} ${C.white}orbitkit${RESET}  ${verBadge}  ${C.muted}${shortTarget}${RESET}`);
    lines.push(`  ${C.dim}${'─'.repeat(58)}${RESET}`);
    lines.push('');

    if (screen === 'main') {
      mainItems.forEach((item, idx) => {
        const active = idx === cursor;
        const prefix = active ? `${C.accent}▸${RESET}` : ' ';
        const label = active ? `${C.white}${item.label.padEnd(18)}${RESET}` : `${C.text}${item.label.padEnd(18)}${RESET}`;
        const hint = active ? `${C.cyan}${item.hint()}${RESET}` : `${C.muted}${item.hint()}${RESET}`;
        lines.push(`  ${prefix} ${label} ${hint}`);
      });
    } else if (screen === 'skills') {
      lines.push(`  ${C.white}AI Skills${RESET} ${C.muted}· Enter to install into ${shortTarget}${RESET}`);
      lines.push('');
      CURATED_SKILLS.forEach((s, idx) => {
        const active = idx === cursor;
        if (active) {
          lines.push(`  ${C.accent}▸${RESET} ${C.white}${s.id}${RESET} ${C.muted}v${s.version}${RESET}`);
          lines.push(`    ${C.cyan}${s.description}${RESET}`);
        } else {
          lines.push(`    ${C.text}${s.id}${RESET} ${C.muted}v${s.version}${RESET}`);
        }
      });
    } else if (screen === 'mcp') {
      lines.push(`  ${C.white}MCP Servers${RESET} ${C.muted}· Enter to configure in ${shortTarget}/.mcp.json${RESET}`);
      lines.push('');
      OFFICIAL_GODOT_MCP_SERVERS.forEach((m, idx) => {
        const active = idx === cursor;
        if (active) {
          lines.push(`  ${C.accent}▸${RESET} ${C.white}${m.id}${RESET} ${C.muted}(${m.name})${RESET}`);
          lines.push(`    ${C.cyan}${m.description}${RESET}`);
        } else {
          lines.push(`    ${C.text}${m.id}${RESET} ${C.muted}— ${m.name}${RESET}`);
        }
      });
    } else if (screen === 'projects') {
      lines.push(
        `  ${C.white}Godot Projects${RESET} ${C.muted}· Enter: instalar todo · 'a': instalar en todos · 'r': re-escanear${RESET}`
      );
      lines.push('');
      if (projects.length === 0) {
        lines.push(`    ${C.muted}No project.godot found in current directory.${RESET}`);
        lines.push(`    ${C.text}Press ${C.white}r${RESET}${C.text} to scan ~/ for Godot projects.${RESET}`);
      } else {
        projects.forEach((p, idx) => {
          const active = idx === cursor;
          const prefix = active ? `${C.accent}▸${RESET}` : ' ';
          const plugTag = p.hasOrbitKitPlugin ? `${C.green}plugin ✓${RESET}` : `${C.amber}no-plugin${RESET}`;
          const mcpTag = p.hasMcpConfig ? `${C.green}mcp ✓${RESET}` : `${C.muted}no-mcp${RESET}`;
          const isCurrentTarget = p.projectPath === activeProjectDir ? ` ${C.cyan}[activo]${RESET}` : '';
          lines.push(
            `  ${prefix} ${active ? C.white : C.text}${p.name}${RESET}${isCurrentTarget} ${C.muted}(${plugTag}${C.muted}, skills: ${p.installedSkills.length}/${CURATED_SKILLS.length}, ${mcpTag}${C.muted})${RESET}`
          );
          if (active) {
            lines.push(`    ${C.muted}${p.projectPath}  —  Presiona Enter para instalar el Plugin Godot, Skills y MCPs aquí${RESET}`);
          }
        });
      }
    } else if (screen === 'doctor') {
      lines.push(`  ${C.white}Environment Doctor${RESET} ${C.muted}· Press 'r' to re-check${RESET}`);
      lines.push('');
      if (!doctorItems) {
        lines.push(`    ${C.muted}Checking environment...${RESET}`);
      } else {
        doctorItems.forEach((item) => {
          const icon =
            item.status === 'ok'
              ? `${C.green}✓${RESET}`
              : item.status === 'warning'
              ? `${C.amber}⚠${RESET}`
              : `${C.red}✗${RESET}`;
          lines.push(`    ${icon} ${C.white}${item.name}:${RESET} ${C.text}${item.message}${RESET}`);
        });
      }
    } else if (screen === 'search') {
      lines.push(`  ${C.accent}/${RESET} ${C.white}${searchQuery}${RESET}${C.accent}█${RESET}`);
      lines.push('');
      const matches = getSearchMatches();
      if (matches.length === 0) {
        lines.push(`    ${C.muted}No matches found.${RESET}`);
      } else {
        matches.forEach((m, idx) => {
          const active = idx === cursor;
          const prefix = active ? `${C.accent}▸${RESET}` : ' ';
          lines.push(
            `  ${prefix} ${active ? C.white : C.text}${m.id}${RESET} ${C.muted}[${m.type}]${RESET}`
          );
        });
      }
    }

    lines.push('');
    if (notice) {
      lines.push(`  ${noticeColor}${notice}${RESET}`);
      lines.push('');
    }

    lines.push(`  ${C.dim}${'─'.repeat(58)}${RESET}`);
    if (screen === 'main') {
      lines.push(`  ${C.muted}↑/↓ move  ·  enter select  ·  / search  ·  u upgrade  ·  q quit${RESET}`);
    } else if (screen === 'search') {
      lines.push(`  ${C.muted}type to filter  ·  ↑/↓ move  ·  enter install  ·  esc back${RESET}`);
    } else if (screen === 'projects') {
      lines.push(`  ${C.muted}↑/↓ move  ·  enter install all  ·  a sync all  ·  r scan  ·  esc/b back${RESET}`);
    } else {
      lines.push(`  ${C.muted}↑/↓ move  ·  enter install  ·  esc/b back  ·  q quit${RESET}`);
    }

    stdout.write(lines.join('\n') + '\n');
  }

  readline.emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();

  render();

  stdin.on('keypress', async (str: string | undefined, key: readline.Key) => {
    if (!key) return;

    if (key.ctrl && key.name === 'c') {
      cleanupAndExit();
      return;
    }

    if (confirmingUninstall) {
      confirmingUninstall = false;
      if (key.name === 'y') {
        setNotice('Uninstalling OrbitKit CLI globally...', 'warn');
        render();
        const res = await performCliUninstall();
        if (res.success) {
          stdout.write('\x1B[?25h\n');
          console.log(`${C.green}✓ ${res.message}${RESET}\n`);
          if (stdin.isTTY) stdin.setRawMode(false);
          stdin.pause();
          process.exit(0);
        } else {
          setNotice(`✗ ${res.message}`, 'err');
          render();
        }
      } else {
        setNotice('Uninstall cancelled.', 'info');
        render();
      }
      return;
    }

    if (screen === 'search') {
      if (key.name === 'escape') {
        screen = 'main';
        cursor = 0;
        render();
        return;
      }
      if (key.name === 'up') {
        cursor = Math.max(0, cursor - 1);
        render();
        return;
      }
      if (key.name === 'down') {
        cursor = Math.min(getMaxCursor(), cursor + 1);
        render();
        return;
      }
      if (key.name === 'return' || key.name === 'enter') {
        const chosen = getSearchMatches()[cursor];
        if (chosen) {
          const res =
            chosen.type === 'skill'
              ? await installSkill(activeProjectDir, chosen.id)
              : await installMcpServer(activeProjectDir, chosen.id);
          setNotice(res.message, res.success ? 'ok' : 'err');
          render();
        }
        return;
      }
      if (key.name === 'backspace') {
        searchQuery = searchQuery.slice(0, -1);
        cursor = 0;
        render();
        return;
      }
      if (str && str.length === 1 && !key.ctrl && !key.meta && str >= ' ') {
        searchQuery += str;
        cursor = 0;
        render();
        return;
      }
      return;
    }

    if (key.name === 'q') {
      cleanupAndExit();
      return;
    }

    if (str === '/' || key.name === 's') {
      screen = 'search';
      searchQuery = '';
      cursor = 0;
      render();
      return;
    }

    if (key.name === 'u') {
      await runSelfUpgrade();
      return;
    }

    if (key.name === 'escape' || key.name === 'b' || key.name === 'left') {
      if (screen !== 'main') {
        screen = 'main';
        cursor = 0;
        notice = '';
        render();
      }
      return;
    }

    if (key.name === 'up' || key.name === 'k') {
      cursor = Math.max(0, cursor - 1);
      render();
      return;
    }

    if (key.name === 'down' || key.name === 'j') {
      cursor = Math.min(getMaxCursor(), cursor + 1);
      render();
      return;
    }

    if (key.name === 'r' && screen === 'projects') {
      setNotice(`Escaneando ${os.homedir()} y registro de Godot 4...`, 'info');
      render();
      projects = await scanForGodotProjects(os.homedir(), { maxDepth: 4, includeGodotConfig: true });
      cursor = 0;
      if (projects.length > 0 && !projects.some((p) => p.projectPath === activeProjectDir)) {
        activeProjectDir = projects[0].projectPath;
      }
      setNotice(`✓ Encontrados ${projects.length} proyecto(s) Godot. Presiona Enter para instalar todo.`, 'ok');
      render();
      return;
    }

    if (key.name === 'a' && screen === 'projects') {
      if (projects.length === 0) {
        projects = await scanForGodotProjects(os.homedir(), { maxDepth: 4, includeGodotConfig: true });
      }
      if (projects.length === 0) {
        setNotice('No se encontraron proyectos Godot para sincronizar.', 'warn');
        render();
        return;
      }
      setNotice(`Instalando todos los Skills y MCPs en ${projects.length} proyecto(s)...`, 'info');
      render();
      for (let i = 0; i < projects.length; i++) {
        await installEverythingInProject(projects[i].projectPath);
        try {
          const updatedProj = await inspectProject(projects[i].projectPath);
          projects[i] = { ...updatedProj, source: projects[i].source };
        } catch {
          // ignore
        }
      }
      setNotice(
        `✓ Instalados ${CURATED_SKILLS.length} Skills y ${OFFICIAL_GODOT_MCP_SERVERS.length} MCPs en ${projects.length} proyecto(s).`,
        'ok'
      );
      render();
      return;
    }

    if (key.name === 'r' && screen === 'doctor') {
      setNotice('Re-running diagnostics...', 'info');
      render();
      doctorItems = await runSystemDiagnostics(activeProjectDir);
      setNotice('Diagnostics updated.', 'ok');
      render();
      return;
    }

    if (key.name === 'return' || key.name === 'enter' || key.name === 'right') {
      if (screen === 'main') {
        await mainItems[cursor]?.action();
        render();
      } else if (screen === 'skills') {
        const skill = CURATED_SKILLS[cursor];
        if (skill) {
          const res = await installSkill(activeProjectDir, skill.id);
          setNotice(res.message, res.success ? 'ok' : 'err');
          render();
        }
      } else if (screen === 'mcp') {
        const mcp = OFFICIAL_GODOT_MCP_SERVERS[cursor];
        if (mcp) {
          const res = await installMcpServer(activeProjectDir, mcp.id);
          setNotice(res.message, res.success ? 'ok' : 'err');
          render();
        }
      } else if (screen === 'projects') {
        const proj = projects[cursor];
        if (proj) {
          activeProjectDir = proj.projectPath;
          setNotice(`Instalando Plugin de Godot, AI Skills y servidores MCP en "${proj.name}"...`, 'info');
          render();
          const { pluginInstalled, skillsCount, mcpsCount, errors } = await installEverythingInProject(proj.projectPath);
          try {
            const refreshed = await inspectProject(proj.projectPath);
            projects[cursor] = { ...refreshed, source: proj.source };
          } catch {
            // ignore
          }
          if (errors.length === 0) {
            setNotice(
              `✓ Todo instalado en "${proj.name}" (Plugin Godot ${pluginInstalled ? 'activo en addons/orbitkit' : ''} + ${skillsCount} AI Skills + ${mcpsCount} MCPs).`,
              'ok'
            );
          } else {
            setNotice(
              `⚠ Instalado en "${proj.name}" (plugin: ${pluginInstalled ? 'sí' : 'no'}, ${skillsCount} skills, ${mcpsCount} MCPs) con ${errors.length} aviso(s).`,
              'warn'
            );
          }
          render();
        }
      }
    }
  });
}
