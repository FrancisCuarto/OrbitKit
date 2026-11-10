import readline from 'node:readline';
import os from 'node:os';
import { scanForGodotProjects, DiscoveredProject } from '../core/scanner.js';
import { CURATED_SKILLS, installSkill } from '../core/skillsManager.js';
import { OFFICIAL_GODOT_MCP_SERVERS, installMcpServer } from '../core/mcpManager.js';
import { runSystemDiagnostics, DiagnosticItem } from '../core/doctor.js';
import { updateAllProjects } from '../core/updater.js';

type TuiScreen = 'home' | 'skills' | 'mcp' | 'projects' | 'doctor' | 'search';

// 24-bit TrueColor ANSI helpers matching the Engram + Godot dark theme
const fg = (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`;
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const ITALIC = '\x1b[3m';

const C = {
  border: fg(88, 96, 118),
  borderInner: fg(69, 76, 94),
  headerStatus: `${BOLD}${fg(203, 166, 247)}`, // Lavender bold
  stripe1: fg(245, 194, 187),                  // Pastel peach/coral
  stripe2: fg(203, 166, 247),                  // Pastel lavender
  stripe3: fg(30, 120, 152),                   // Deep Godot teal
  stripe4: fg(71, 140, 191),                   // Official Godot blue
  stripe5: fg(137, 220, 235),                  // Bright aqua
  subtitle: `${ITALIC}${fg(138, 152, 175)}`,   // Italic muted slate
  statNum: `${BOLD}${fg(137, 220, 235)}`,      // Bold aqua numbers
  statLabel: fg(205, 214, 244),                // Soft white
  sectionTitle: `${BOLD}${fg(245, 194, 187)}`, // Coral/peach section headers
  text: fg(205, 214, 244),                     // Primary list text
  muted: fg(116, 128, 152),                    // Footer / secondary text
  selected: `${BOLD}${fg(203, 166, 247)}`,     // Selected action (lavender bold)
  cursor: `${BOLD}${fg(203, 166, 247)}`,       // ▸ cursor
  success: `${BOLD}${fg(166, 227, 161)}`,      // Emerald green
  warning: `${BOLD}${fg(249, 226, 175)}`,      // Amber
  danger: `${BOLD}${fg(243, 139, 168)}`,       // Rose
  cyan: fg(137, 220, 235)
};

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function padVisible(str: string, width: number): string {
  const visibleLen = stripAnsi(str).length;
  const diff = Math.max(0, width - visibleLen);
  return str + ' '.repeat(diff);
}

export async function startInteractiveTui(): Promise<void> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) {
    console.log('Interactive TUI requires an interactive terminal (TTY).');
    return;
  }

  // Discover Godot projects in cwd (and if none, check home common dirs quietly)
  let projects: DiscoveredProject[] = [];
  try {
    projects = await scanForGodotProjects(process.cwd());
  } catch {
    projects = [];
  }

  let screen: TuiScreen = 'home';
  let cursorIndex = 0;
  let searchQuery = '';
  let statusMessage: string | null = null;
  let doctorItems: DiagnosticItem[] | null = null;

  const homeActions = [
    {
      id: 'skills',
      label: 'Search & install AI skills',
      onSelect: async () => {
        screen = 'skills';
        cursorIndex = 0;
      }
    },
    {
      id: 'mcp',
      label: 'Configure MCP servers (ctx7, Godot LSP, Bridge)',
      onSelect: async () => {
        screen = 'mcp';
        cursorIndex = 0;
      }
    },
    {
      id: 'projects',
      label: 'Browse Godot projects',
      onSelect: async () => {
        screen = 'projects';
        cursorIndex = 0;
      }
    },
    {
      id: 'update',
      label: 'Batch update all projects',
      onSelect: async () => {
        statusMessage = 'Synchronizing all detected Godot projects...';
        render();
        const res = await updateAllProjects(process.cwd());
        statusMessage = `✓ Updated ${res.length} project(s) with latest AI skills & MCP configs`;
      }
    },
    {
      id: 'doctor',
      label: 'Setup agent plugin & run doctor',
      onSelect: async () => {
        screen = 'doctor';
        cursorIndex = 0;
        doctorItems = null;
        render();
        doctorItems = await runSystemDiagnostics(process.cwd());
      }
    },
    {
      id: 'quit',
      label: 'Quit',
      onSelect: async () => {
        cleanupAndExit();
      }
    }
  ];

  function cleanupAndExit() {
    stdout.write('\x1B[?25h'); // Restore cursor visibility
    if (stdin.isTTY) {
      stdin.setRawMode(false);
    }
    stdin.pause();
    stdout.write('\n');
    process.exit(0);
  }

  function renderBanner(): string[] {
    const innerWidth = 66;
    const lines: string[] = [];

    // Double-bordered retro frame like Engram
    lines.push(`  ${C.border}┌${'─'.repeat(innerWidth)}┐${RESET}`);

    const leftStatus = `🤖 SYSTEM ONLINE`;
    const rightStatus = `MEM: OK 100%`;
    const gap = Math.max(1, innerWidth - 4 - leftStatus.length - rightStatus.length);
    lines.push(
      `  ${C.border}│${RESET}  ${C.headerStatus}${leftStatus}${' '.repeat(gap)}${rightStatus}${RESET}  ${C.border}│${RESET}`
    );
    lines.push(`  ${C.border}│${' '.repeat(innerWidth)}│${RESET}`);

    // 5-band pixel block logo: ORBITKIT
    const asciiLogo = [
      ' ██████  ██████  ██████  ██ ████████ ██   ██ ██ ████████ ',
      '██    ██ ██   ██ ██   ██ ██    ██    ██  ██  ██    ██    ',
      '██    ██ ██████  ██████  ██    ██    █████   ██    ██    ',
      '██    ██ ██   ██ ██   ██ ██    ██    ██  ██  ██    ██    ',
      ' ██████  ██   ██ ██████  ██    ██    ██   ██ ██    ██    '
    ];
    const stripeColors = [C.stripe1, C.stripe2, C.stripe3, C.stripe4, C.stripe5];

    for (let i = 0; i < asciiLogo.length; i++) {
      const rowText = `  ${ stripeColors[i] }${ asciiLogo[i] }${ RESET }`;
      lines.push(`  ${C.border}│${RESET}${padVisible(rowText, innerWidth)}${C.border}│${RESET}`);
    }

    lines.push(`  ${C.border}│${' '.repeat(innerWidth)}│${RESET}`);
    const tagline = `  ${C.subtitle}> orbitkit 0.1.0 – Godot 4 AI Skills & MCP Ecosystem${RESET}`;
    lines.push(`  ${C.border}│${RESET}${padVisible(tagline, innerWidth)}${C.border}│${RESET}`);
    lines.push(`  ${C.border}└${'─'.repeat(innerWidth)}┘${RESET}`);

    return lines;
  }

  function renderStatsBox(): string[] {
    const boxWidth = 28;
    const projCount = projects.length;
    const stats = [
      { count: CURATED_SKILLS.length, label: 'skills' },
      { count: OFFICIAL_GODOT_MCP_SERVERS.length, label: 'mcp servers' },
      { count: 1, label: 'godot addon' },
      { count: projCount, label: 'projects' }
    ];

    const lines: string[] = [];
    lines.push(`  ${C.border}┌${'─'.repeat(boxWidth)}┐${RESET}`);
    lines.push(`  ${C.border}│${' '.repeat(boxWidth)}│${RESET}`);

    for (const s of stats) {
      const numStr = String(s.count).padStart(7, ' ');
      const row = `${C.statNum}${numStr}${RESET}   ${C.statLabel}${s.label}${RESET}`;
      lines.push(`  ${C.border}│${RESET}${padVisible(row, boxWidth)}${C.border}│${RESET}`);
    }

    lines.push(`  ${C.border}│${' '.repeat(boxWidth)}│${RESET}`);
    lines.push(`  ${C.border}└${'─'.repeat(boxWidth)}┘${RESET}`);
    return lines;
  }

  function renderHomeScreen(): string[] {
    const lines: string[] = [];
    lines.push(...renderStatsBox());
    lines.push('');

    // Projects list
    lines.push(`    ${C.sectionTitle}Projects${RESET}`);
    lines.push('');
    if (projects.length > 0) {
      for (const p of projects.slice(0, 6)) {
        const mcpBadge = p.hasMcpConfig ? ` ${C.cyan}(mcp)${RESET}` : '';
        lines.push(`    ${C.text}• ${p.name}${RESET}${mcpBadge}`);
      }
    } else {
      const cwdName = process.cwd().split('/').pop() || 'workspace';
      lines.push(`    ${C.text}• ${cwdName}${RESET} ${C.muted}(current dir)${RESET}`);
      lines.push(`    ${C.muted}  press 's' to search or scan subdirectories${RESET}`);
    }
    lines.push('');

    // Actions list
    lines.push(`    ${C.sectionTitle}Actions${RESET}`);
    lines.push('');
    homeActions.forEach((act, idx) => {
      if (idx === cursorIndex) {
        lines.push(`  ${C.cursor}▸ ${act.label}${RESET}`);
      } else {
        lines.push(`    ${C.text}${act.label}${RESET}`);
      }
    });

    lines.push('');
    lines.push(`    ${C.muted}j/k navigate • enter select • s search • q quit${RESET}`);
    return lines;
  }

  function renderSkillsScreen(): string[] {
    const lines: string[] = [];
    lines.push(`    ${C.sectionTitle}Curated Godot 4 AI Skills${RESET} ${C.muted}(enter to install into current project)${RESET}`);
    lines.push('');

    CURATED_SKILLS.forEach((skill, idx) => {
      const isSelected = idx === cursorIndex;
      if (isSelected) {
        lines.push(`  ${C.cursor}▸ ${skill.id}${RESET} ${C.cyan}v${skill.version}${RESET} — ${C.statLabel}${skill.name}${RESET}`);
        lines.push(`      ${C.muted}${skill.description}${RESET}`);
      } else {
        lines.push(`    ${C.text}${skill.id}${RESET} ${C.muted}(v${skill.version})${RESET}`);
      }
    });

    lines.push('');
    lines.push(`    ${C.muted}j/k navigate • enter install skill • esc/b back • q quit${RESET}`);
    return lines;
  }

  function renderMcpScreen(): string[] {
    const lines: string[] = [];
    lines.push(`    ${C.sectionTitle}Model Context Protocol (MCP) Servers${RESET} ${C.muted}(enter to add to .mcp.json)${RESET}`);
    lines.push('');

    OFFICIAL_GODOT_MCP_SERVERS.forEach((mcp, idx) => {
      const isSelected = idx === cursorIndex;
      if (isSelected) {
        lines.push(`  ${C.cursor}▸ ${mcp.id}${RESET} — ${C.statLabel}${mcp.name}${RESET}`);
        lines.push(`      ${C.cyan}$ ${mcp.command} ${mcp.args.join(' ')}${RESET}`);
        lines.push(`      ${C.muted}${mcp.description}${RESET}`);
      } else {
        lines.push(`    ${C.text}${mcp.id}${RESET} ${C.muted}— ${mcp.name}${RESET}`);
      }
    });

    lines.push('');
    lines.push(`    ${C.muted}j/k navigate • enter configure MCP • esc/b back • q quit${RESET}`);
    return lines;
  }

  function renderProjectsScreen(): string[] {
    const lines: string[] = [];
    lines.push(`    ${C.sectionTitle}Discovered Godot Projects${RESET} ${C.muted}(r to rescan ~ or current tree)${RESET}`);
    lines.push('');

    if (projects.length === 0) {
      lines.push(`    ${C.muted}No project.godot found in ${process.cwd()}${RESET}`);
      lines.push(`    ${C.text}Press ${BOLD}r${RESET}${C.text} to scan your home directory (${os.homedir()}) for Godot projects.${RESET}`);
    } else {
      projects.forEach((p, idx) => {
        const isSelected = idx === cursorIndex;
        const prefix = isSelected ? `${C.cursor}▸ ` : '    ';
        lines.push(`  ${prefix}${C.statLabel}${p.name}${RESET} ${C.muted}(${p.projectPath})${RESET}`);
        if (isSelected) {
          lines.push(
            `      ${C.muted}Skills: ${p.installedSkills.length ? C.cyan + p.installedSkills.join(', ') + RESET : 'none'} | Addons: ${p.installedAddons.length ? C.success + p.installedAddons.join(', ') + RESET : 'none'} | MCP: ${p.hasMcpConfig ? C.success + 'active' + RESET : 'none'}${RESET}`
          );
        }
      });
    }

    lines.push('');
    lines.push(`    ${C.muted}j/k navigate • r scan home dir • esc/b back • q quit${RESET}`);
    return lines;
  }

  function renderDoctorScreen(): string[] {
    const lines: string[] = [];
    lines.push(`    ${C.sectionTitle}System & Godot Environment Diagnostics${RESET}`);
    lines.push('');

    if (!doctorItems) {
      lines.push(`    ${C.muted}Running health checks...${RESET}`);
    } else {
      for (const item of doctorItems) {
        const badge =
          item.status === 'ok'
            ? `${C.success}✓${RESET}`
            : item.status === 'warning'
            ? `${C.warning}⚠${RESET}`
            : `${C.danger}✕${RESET}`;
        lines.push(`    ${badge} ${BOLD}${C.statLabel}${item.name}${RESET}: ${C.text}${item.message}${RESET}`);
      }
    }

    lines.push('');
    lines.push(`    ${C.muted}r re-run diagnostics • esc/b back • q quit${RESET}`);
    return lines;
  }

  function getFilteredItems() {
    const q = searchQuery.toLowerCase().trim();
    const skillMatches = CURATED_SKILLS.filter(
      (s) => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    ).map((s) => ({ type: 'skill' as const, id: s.id, name: s.name, desc: s.description }));

    const mcpMatches = OFFICIAL_GODOT_MCP_SERVERS.filter(
      (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    ).map((m) => ({ type: 'mcp' as const, id: m.id, name: m.name, desc: m.description }));

    return [...skillMatches, ...mcpMatches];
  }

  function renderSearchScreen(): string[] {
    const lines: string[] = [];
    lines.push(`    ${C.sectionTitle}Search Skills & MCP Servers${RESET}`);
    lines.push(`    ${C.border}┌────────────────────────────────────────────────────────┐${RESET}`);
    const promptLine = `  ${C.cyan}/${RESET} ${C.statLabel}${searchQuery}${RESET}${C.cursor}█${RESET}`;
    lines.push(`    ${C.border}│${RESET}${padVisible(promptLine, 56)}${C.border}│${RESET}`);
    lines.push(`    ${C.border}└────────────────────────────────────────────────────────┘${RESET}`);
    lines.push('');

    const matches = getFilteredItems();
    if (matches.length === 0) {
      lines.push(`    ${C.muted}No matching skills or MCP servers for "${searchQuery}"${RESET}`);
    } else {
      matches.slice(0, 8).forEach((item, idx) => {
        const isSelected = idx === cursorIndex;
        const badge = item.type === 'skill' ? `${C.selected}[SKILL]${RESET}` : `${C.cyan}[MCP]  ${RESET}`;
        if (isSelected) {
          lines.push(`  ${C.cursor}▸ ${badge} ${C.statLabel}${item.id}${RESET} — ${C.text}${item.name}${RESET}`);
          lines.push(`      ${C.muted}${item.desc}${RESET}`);
        } else {
          lines.push(`    ${badge} ${C.text}${item.id}${RESET} ${C.muted}— ${item.name}${RESET}`);
        }
      });
    }

    lines.push('');
    lines.push(`    ${C.muted}type to filter • ↑/↓ navigate • enter install • esc back${RESET}`);
    return lines;
  }

  function render() {
    stdout.write('\x1B[2J\x1B[3J\x1B[H'); // Clear screen and scrollback
    stdout.write('\x1B[?25l'); // Hide cursor

    const out: string[] = [''];
    out.push(...renderBanner());
    out.push('');

    if (statusMessage) {
      out.push(`    ${C.success}${statusMessage}${RESET}`);
      out.push('');
    }

    if (screen === 'home') {
      out.push(...renderHomeScreen());
    } else if (screen === 'skills') {
      out.push(...renderSkillsScreen());
    } else if (screen === 'mcp') {
      out.push(...renderMcpScreen());
    } else if (screen === 'projects') {
      out.push(...renderProjectsScreen());
    } else if (screen === 'doctor') {
      out.push(...renderDoctorScreen());
    } else if (screen === 'search') {
      out.push(...renderSearchScreen());
    }

    stdout.write(out.join('\n') + '\n');
  }

  readline.emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();

  render();

  stdin.on('keypress', async (str, key) => {
    if (!key) return;

    if (key.ctrl && key.name === 'c') {
      cleanupAndExit();
      return;
    }

    // Handle live typing inside search mode
    if (screen === 'search') {
      if (key.name === 'escape') {
        screen = 'home';
        cursorIndex = 0;
        searchQuery = '';
        render();
        return;
      }
      if (key.name === 'backspace') {
        searchQuery = searchQuery.slice(0, -1);
        cursorIndex = 0;
        render();
        return;
      }
      if (key.name === 'up') {
        const matches = getFilteredItems();
        if (matches.length > 0) {
          cursorIndex = (cursorIndex - 1 + Math.min(8, matches.length)) % Math.min(8, matches.length);
        }
        render();
        return;
      }
      if (key.name === 'down') {
        const matches = getFilteredItems();
        if (matches.length > 0) {
          cursorIndex = (cursorIndex + 1) % Math.min(8, matches.length);
        }
        render();
        return;
      }
      if (key.name === 'return' || key.name === 'enter') {
        const matches = getFilteredItems();
        const chosen = matches[cursorIndex];
        if (chosen) {
          if (chosen.type === 'skill') {
            const res = await installSkill(process.cwd(), chosen.id);
            statusMessage = res.success
              ? `✓ Installed skill "${chosen.id}" into .agents/skills/ & .claude/skills/`
              : `✕ ${res.message}`;
          } else {
            const res = await installMcpServer(process.cwd(), chosen.id);
            statusMessage = res.success
              ? `✓ Added MCP server "${chosen.id}" to .mcp.json`
              : `✕ ${res.message}`;
          }
          screen = 'home';
          cursorIndex = 0;
          searchQuery = '';
          render();
        }
        return;
      }
      if (str && str.length === 1 && !key.ctrl && !key.meta && str >= ' ') {
        searchQuery += str;
        cursorIndex = 0;
        render();
        return;
      }
      return;
    }

    // Global quit
    if (key.name === 'q') {
      cleanupAndExit();
      return;
    }

    // Global 's' to jump to search
    if (key.name === 's' && screen === 'home') {
      screen = 'search';
      searchQuery = '';
      cursorIndex = 0;
      statusMessage = null;
      render();
      return;
    }

    // Back navigation
    if (key.name === 'escape' || key.name === 'b' || key.name === 'left') {
      if (screen !== 'home') {
        screen = 'home';
        cursorIndex = 0;
        render();
      }
      return;
    }

    // Rescan shortcut in projects or doctor
    if (key.name === 'r') {
      if (screen === 'projects') {
        statusMessage = 'Scanning directory tree for Godot projects...';
        render();
        try {
          projects = await scanForGodotProjects(process.cwd());
          if (projects.length === 0) {
            projects = await scanForGodotProjects(os.homedir(), 3);
          }
          statusMessage = `✓ Found ${projects.length} Godot project(s)`;
        } catch {
          statusMessage = 'Scan completed.';
        }
        cursorIndex = 0;
        render();
        return;
      }
      if (screen === 'doctor') {
        doctorItems = null;
        render();
        doctorItems = await runSystemDiagnostics(process.cwd());
        render();
        return;
      }
    }

    // Up / Down / j / k navigation
    if (key.name === 'up' || key.name === 'k') {
      statusMessage = null;
      const len =
        screen === 'home'
          ? homeActions.length
          : screen === 'skills'
          ? CURATED_SKILLS.length
          : screen === 'mcp'
          ? OFFICIAL_GODOT_MCP_SERVERS.length
          : screen === 'projects'
          ? Math.max(1, projects.length)
          : 1;
      cursorIndex = (cursorIndex - 1 + len) % len;
      render();
      return;
    }

    if (key.name === 'down' || key.name === 'j') {
      statusMessage = null;
      const len =
        screen === 'home'
          ? homeActions.length
          : screen === 'skills'
          ? CURATED_SKILLS.length
          : screen === 'mcp'
          ? OFFICIAL_GODOT_MCP_SERVERS.length
          : screen === 'projects'
          ? Math.max(1, projects.length)
          : 1;
      cursorIndex = (cursorIndex + 1) % len;
      render();
      return;
    }

    // Enter / Select
    if (key.name === 'return' || key.name === 'enter' || key.name === 'right') {
      if (screen === 'home') {
        await homeActions[cursorIndex].onSelect();
        render();
      } else if (screen === 'skills') {
        const skill = CURATED_SKILLS[cursorIndex];
        const res = await installSkill(process.cwd(), skill.id);
        statusMessage = res.success
          ? `✓ Installed skill "${skill.id}" (v${skill.version}) into .agents/skills/`
          : `✕ ${res.message}`;
        render();
      } else if (screen === 'mcp') {
        const mcp = OFFICIAL_GODOT_MCP_SERVERS[cursorIndex];
        const res = await installMcpServer(process.cwd(), mcp.id);
        statusMessage = res.success
          ? `✓ Configured MCP server "${mcp.id}" in .mcp.json`
          : `✕ ${res.message}`;
        render();
      }
    }
  });
}
