import readline from 'node:readline';
import os from 'node:os';
import { scanForGodotProjects, DiscoveredProject } from '../core/scanner.js';
import { CURATED_SKILLS, installSkill } from '../core/skillsManager.js';
import { OFFICIAL_GODOT_MCP_SERVERS, installMcpServer } from '../core/mcpManager.js';
import { runSystemDiagnostics, DiagnosticItem } from '../core/doctor.js';
import { updateAllProjects } from '../core/updater.js';
import {
  checkCliVersion,
  getCurrentCliVersion,
  performCliSelfUpdate,
  VersionCheckResult
} from '../core/selfUpdater.js';

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
    latestSource: 'local',
    updateAvailable: false
  };

  let projects: DiscoveredProject[] = [];
  let screen: Screen = 'main';
  let cursor = 0;
  let searchQuery = '';
  let notice = '';
  let noticeColor = C.muted;
  let doctorItems: DiagnosticItem[] | null = null;

  // Non-blocking background startup checks (projects + remote version)
  scanForGodotProjects(process.cwd())
    .then((found) => {
      projects = found;
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
    setNotice('Checking latest OrbitKit version on NPM & GitHub...', 'info');
    render();
    const check = await checkCliVersion();
    versionStatus = check;

    if (!check.updateAvailable) {
      setNotice(
        `Already on the latest version (v${check.currentVersion}). Re-verifying global binary...`,
        'ok'
      );
      render();
    } else {
      setNotice(`Updating CLI: v${check.currentVersion} → v${check.latestVersion}...`, 'warn');
      render();
    }

    const res = await performCliSelfUpdate(check.latestVersion);
    if (res.success) {
      versionStatus = {
        currentVersion: res.installedVersion,
        latestVersion: res.installedVersion,
        latestSource: 'npm',
        updateAvailable: false
      };
      setNotice(`✓ ${res.message} (restart orbitkit to use new binary)`, 'ok');
    } else {
      setNotice(`✗ ${res.message}`, 'err');
    }
    render();
  }

  const mainItems = [
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
      hint: () => `Scan & sync Godot 4 projects (${projects.length} in current dir)`,
      action: async () => {
        screen = 'projects';
        cursor = 0;
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
          doctorItems = await runSystemDiagnostics(process.cwd());
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

    const shortCwd = process.cwd().replace(os.homedir(), '~');
    lines.push(`  ${C.accent}●${RESET} ${C.white}orbitkit${RESET}  ${verBadge}  ${C.muted}${shortCwd}${RESET}`);
    lines.push(`  ${C.dim}${'─'.repeat(58)}${RESET}`);
    lines.push('');

    if (screen === 'main') {
      mainItems.forEach((item, idx) => {
        const active = idx === cursor;
        const prefix = active ? `${C.accent}▸${RESET}` : ' ';
        const label = active ? `${C.white}${item.label.padEnd(15)}${RESET}` : `${C.text}${item.label.padEnd(15)}${RESET}`;
        const hint = active ? `${C.cyan}${item.hint()}${RESET}` : `${C.muted}${item.hint()}${RESET}`;
        lines.push(`  ${prefix} ${label} ${hint}`);
      });
    } else if (screen === 'skills') {
      lines.push(`  ${C.white}AI Skills${RESET} ${C.muted}· Enter to install into current project${RESET}`);
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
      lines.push(`  ${C.white}MCP Servers${RESET} ${C.muted}· Enter to configure in .mcp.json${RESET}`);
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
      lines.push(`  ${C.white}Godot Projects${RESET} ${C.muted}· Press 'r' to scan home directory, 'a' to sync all${RESET}`);
      lines.push('');
      if (projects.length === 0) {
        lines.push(`    ${C.muted}No project.godot found in current directory.${RESET}`);
        lines.push(`    ${C.text}Press ${C.white}r${RESET}${C.text} to scan ~/ for Godot projects.${RESET}`);
      } else {
        projects.forEach((p, idx) => {
          const active = idx === cursor;
          const prefix = active ? `${C.accent}▸${RESET}` : ' ';
          const mcpTag = p.hasMcpConfig ? `${C.green}mcp${RESET}` : `${C.muted}no-mcp${RESET}`;
          lines.push(
            `  ${prefix} ${active ? C.white : C.text}${p.name}${RESET} ${C.muted}(skills: ${p.installedSkills.length}, ${mcpTag}${C.muted})${RESET}`
          );
          if (active) {
            lines.push(`    ${C.muted}${p.projectPath}${RESET}`);
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
    } else {
      lines.push(`  ${C.muted}↑/↓ move  ·  enter run  ·  esc/b back  ·  q quit${RESET}`);
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
              ? await installSkill(process.cwd(), chosen.id)
              : await installMcpServer(process.cwd(), chosen.id);
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
      setNotice(`Scanning ${os.homedir()} for Godot 4 projects...`, 'info');
      render();
      projects = await scanForGodotProjects(os.homedir(), 3);
      cursor = 0;
      setNotice(`Found ${projects.length} Godot project(s).`, 'ok');
      render();
      return;
    }

    if (key.name === 'a' && screen === 'projects') {
      setNotice('Updating all discovered projects...', 'info');
      render();
      const updated = await updateAllProjects(process.cwd());
      setNotice(`Synced ${updated.length} project(s).`, 'ok');
      render();
      return;
    }

    if (key.name === 'r' && screen === 'doctor') {
      setNotice('Re-running diagnostics...', 'info');
      render();
      doctorItems = await runSystemDiagnostics(process.cwd());
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
          const res = await installSkill(process.cwd(), skill.id);
          setNotice(res.message, res.success ? 'ok' : 'err');
          render();
        }
      } else if (screen === 'mcp') {
        const mcp = OFFICIAL_GODOT_MCP_SERVERS[cursor];
        if (mcp) {
          const res = await installMcpServer(process.cwd(), mcp.id);
          setNotice(res.message, res.success ? 'ok' : 'err');
          render();
        }
      }
    }
  });
}
