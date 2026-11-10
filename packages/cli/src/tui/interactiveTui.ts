import readline from 'node:readline';
import os from 'node:os';
import { scanForGodotProjects, DiscoveredProject } from '../core/scanner.js';
import { CURATED_SKILLS, installSkill } from '../core/skillsManager.js';
import { OFFICIAL_GODOT_MCP_SERVERS, installMcpServer } from '../core/mcpManager.js';
import { runSystemDiagnostics, DiagnosticItem } from '../core/doctor.js';
import { updateAllProjects } from '../core/updater.js';

type TuiTab = 'deck' | 'skills' | 'mcp' | 'projects' | 'doctor' | 'search';

// 24-bit TrueColor ANSI palette — Godot 4 + Orbital Telemetry HUD
const fg = (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`;
const bg = (r: number, g: number, b: number) => `\x1b[48;2;${r};${g};${b}m`;
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const C = {
  frame: fg(58, 92, 125),                      // Godot slate border
  frameBright: fg(71, 140, 191),               // Official Godot Blue (#478cbf)
  godotBlue: `${BOLD}${fg(71, 140, 191)}`,     // Bold Godot Blue
  sky: `${BOLD}${fg(56, 189, 248)}`,           // Bright Telemetry Sky (#38bdf8)
  cyan: fg(125, 211, 252),                     // Soft Cyan
  blenderOrange: `${BOLD}${fg(245, 121, 42)}`, // Blender Orange (#f5792a)
  emerald: `${BOLD}${fg(16, 185, 129)}`,       // Context7 Emerald (#10b981)
  amber: `${BOLD}${fg(245, 158, 11)}`,         // Warning Amber
  rose: `${BOLD}${fg(244, 63, 94)}`,           // Alert Rose
  white: `${BOLD}${fg(241, 245, 249)}`,        // Crisp White
  text: fg(203, 213, 225),                     // Slate 300
  muted: fg(100, 116, 139),                    // Slate 500
  tabActive: `${BOLD}${bg(71, 140, 191)}${fg(255, 255, 255)}`,
  tabInactive: `${fg(148, 163, 184)}`,
  rowSelected: `${BOLD}${bg(25, 45, 65)}${fg(125, 211, 252)}`,
  pillBg: `${bg(19, 32, 46)}${fg(125, 211, 252)}`
};

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

function padRight(str: string, width: number): string {
  const len = visibleLength(str);
  if (len >= width) return str;
  return str + ' '.repeat(width - len);
}

function truncateVisible(str: string, maxLen: number): string {
  const clean = stripAnsi(str);
  if (clean.length <= maxLen) return str;
  return clean.slice(0, Math.max(0, maxLen - 1)) + '…';
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxWidth) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function startInteractiveTui(): Promise<void> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) {
    console.log('OrbitKit TUI requires an interactive terminal (TTY).');
    return;
  }

  let projects: DiscoveredProject[] = [];
  try {
    projects = await scanForGodotProjects(process.cwd());
  } catch {
    projects = [];
  }

  const TABS_ORDER: TuiTab[] = ['deck', 'skills', 'mcp', 'projects', 'doctor'];
  let activeTab: TuiTab = 'deck';
  let cursorIndex = 0;
  let searchQuery = '';
  let statusLog = 'Ready. Use ↑/↓ to navigate, ←/→ (or 1-5) to switch docks, Enter to execute.';
  let statusType: 'info' | 'ok' | 'warn' | 'err' = 'info';
  let doctorItems: DiagnosticItem[] | null = null;

  const deckActions = [
    {
      id: 'goto-skills',
      title: 'Browse & Install AI Skills',
      badge: `${CURATED_SKILLS.length} curated`,
      summary: 'Inject specialized Godot 4.x & Blender 3D SKILL.md rules into .agents/skills and .claude/skills.',
      target: '.agents/skills/* & .claude/skills/*',
      onRun: async () => {
        activeTab = 'skills';
        cursorIndex = 0;
      }
    },
    {
      id: 'goto-mcp',
      title: 'Configure MCP Bridges',
      badge: `${OFFICIAL_GODOT_MCP_SERVERS.length} servers`,
      summary: 'Connect GDScript LSP (:6005), Context7 (ctx7) live docs, and Scene Tree Inspector to .mcp.json.',
      target: '.mcp.json (Project Root)',
      onRun: async () => {
        activeTab = 'mcp';
        cursorIndex = 0;
      }
    },
    {
      id: 'sync-all',
      title: 'Batch Sync All Godot Projects',
      badge: 'update --all',
      summary: 'Scans the workspace tree and updates every discovered Godot 4 project with latest skills & MCPs.',
      target: process.cwd(),
      onRun: async () => {
        statusLog = 'Synchronizing all Godot projects in workspace...';
        statusType = 'info';
        render();
        const res = await updateAllProjects(process.cwd());
        projects = await scanForGodotProjects(process.cwd());
        statusLog = `Synced ${res.length} project(s) with latest Godot 4 Skills & MCP servers.`;
        statusType = 'ok';
      }
    },
    {
      id: 'scan-home',
      title: 'Deep Scan Workspace / Home Dir',
      badge: 'scanner',
      summary: 'Recursively searches for project.godot files, reporting installed addons, AI skills, and MCP status.',
      target: os.homedir(),
      onRun: async () => {
        statusLog = 'Scanning directory tree for Godot 4 projects...';
        statusType = 'info';
        render();
        const cwdProjects = await scanForGodotProjects(process.cwd());
        projects = cwdProjects.length > 0 ? cwdProjects : await scanForGodotProjects(os.homedir(), 3);
        activeTab = 'projects';
        cursorIndex = 0;
        statusLog = `Discovered ${projects.length} Godot project(s).`;
        statusType = projects.length > 0 ? 'ok' : 'warn';
      }
    },
    {
      id: 'run-doctor',
      title: 'Run Environment & LSP Doctor',
      badge: 'diagnostics',
      summary: 'Verifies Godot 4 binary in PATH, checks GDScript Language Server port 6005, and inspects project.godot.',
      target: 'System PATH + localhost:6005',
      onRun: async () => {
        activeTab = 'doctor';
        cursorIndex = 0;
        statusLog = 'Running system & GDScript LSP diagnostics...';
        statusType = 'info';
        render();
        doctorItems = await runSystemDiagnostics(process.cwd());
        statusLog = 'Diagnostics complete.';
        statusType = 'ok';
      }
    },
    {
      id: 'open-search',
      title: 'Quick Filter Skills & MCPs',
      badge: 'press /',
      summary: 'Instant fuzzy filter across all Godot 4 AI skills, Blender glTF pipelines, and MCP servers.',
      target: 'Interactive Filter',
      onRun: async () => {
        activeTab = 'search';
        searchQuery = '';
        cursorIndex = 0;
      }
    },
    {
      id: 'quit',
      title: 'Exit OrbitKit Mission Control',
      badge: 'press q',
      summary: 'Close the interactive terminal interface and return to your shell.',
      target: 'process.exit(0)',
      onRun: async () => {
        cleanupAndExit();
      }
    }
  ];

  function cleanupAndExit() {
    stdout.write('\x1B[?25h');
    if (stdin.isTTY) {
      stdin.setRawMode(false);
    }
    stdin.pause();
    stdout.write('\n');
    process.exit(0);
  }

  function getFilteredItems() {
    const q = searchQuery.toLowerCase().trim();
    const skillMatches = CURATED_SKILLS.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    ).map((s) => ({
      kind: 'SKILL' as const,
      id: s.id,
      title: s.name,
      version: `v${s.version}`,
      desc: s.description,
      target: `.agents/skills/${s.id}/SKILL.md`
    }));

    const mcpMatches = OFFICIAL_GODOT_MCP_SERVERS.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    ).map((m) => ({
      kind: 'MCP' as const,
      id: m.id,
      title: m.name,
      version: m.command,
      desc: m.description,
      target: `.mcp.json → ${m.command} ${m.args.join(' ')}`
    }));

    return [...skillMatches, ...mcpMatches];
  }

  const TOTAL_W = 86;
  const LEFT_W = 38;
  const RIGHT_W = TOTAL_W - LEFT_W - 3; // 45

  function renderHeader(): string[] {
    const lines: string[] = [];
    const topBar = `╭${'─'.repeat(TOTAL_W - 2)}╮`;
    lines.push(`  ${C.frameBright}${topBar}${RESET}`);

    // Original Orbital Satellite Emblem + Mission Control Header
    const row1 =
      `  ${C.sky}   . · ✦ · .   ${RESET}  ${C.white}ORBITKIT${RESET} ${C.frameBright}//${RESET} ${C.godotBlue}GODOT 4 ORBITAL COMMAND DECK${RESET} ${C.pillBg} v0.3.0 ${RESET}`;
    const row2 =
      `  ${C.frameBright} ╭───(${RESET}${C.white} ⚙ ${RESET}${C.frameBright})───╮ ${RESET}  ${C.text}AI Skills, Live MCP Telemetry & Blender 3D Pipeline Manager${RESET}`;
    const row3 =
      `  ${C.frameBright}(${RESET}  ${C.emerald}●${RESET} ──┼── ${C.blenderOrange}◉${RESET}  ${C.frameBright})${RESET}  ${C.emerald}● CTX7 DOCS${RESET}   ${C.sky}● GDSCRIPT LSP :6005${RESET}   ${C.blenderOrange}● BLENDER GLTF${RESET}   ${C.godotBlue}● ${projects.length} PROJ${RESET}`;
    const row4 =
      `  ${C.frameBright} ╰───(${RESET}${C.sky} ◈ ${RESET}${C.frameBright})───╯ ${RESET}  ${C.muted}Workspace: ${truncateVisible(process.cwd(), 54)}${RESET}`;

    for (const r of [row1, row2, row3, row4]) {
      lines.push(`  ${C.frameBright}│${RESET}${padRight(r, TOTAL_W - 2)}${C.frameBright}│${RESET}`);
    }

    // Navigation Dock Tabs Bar
    lines.push(`  ${C.frameBright}├${'─'.repeat(TOTAL_W - 2)}┤${RESET}`);
    const tabs: { id: TuiTab; label: string }[] = [
      { id: 'deck', label: ' 1:🛰️ Deck ' },
      { id: 'skills', label: ` 2:🧠 Skills (${CURATED_SKILLS.length}) ` },
      { id: 'mcp', label: ` 3:🔌 MCP (${OFFICIAL_GODOT_MCP_SERVERS.length}) ` },
      { id: 'projects', label: ` 4:📁 Projects (${projects.length}) ` },
      { id: 'doctor', label: ' 5:🩺 Doctor ' },
      { id: 'search', label: ' /:🔍 Filter ' }
    ];

    const renderedTabs = tabs
      .map((t) => (activeTab === t.id ? `${C.tabActive}${t.label}${RESET}` : `${C.tabInactive}${t.label}${RESET}`))
      .join(`${C.frame} │ ${RESET}`);

    lines.push(`  ${C.frameBright}│${RESET} ${padRight(renderedTabs, TOTAL_W - 3)}${C.frameBright}│${RESET}`);
    lines.push(`  ${C.frameBright}├${'─'.repeat(LEFT_W)}┬${'─'.repeat(RIGHT_W)}┤${RESET}`);

    return lines;
  }

  function buildSplitRows(leftLines: string[], rightLines: string[], minHeight = 13): string[] {
    const count = Math.max(minHeight, leftLines.length, rightLines.length);
    const rows: string[] = [];
    for (let i = 0; i < count; i++) {
      const l = leftLines[i] || '';
      const r = rightLines[i] || '';
      rows.push(
        `  ${C.frameBright}│${RESET}${padRight(l, LEFT_W)}${C.frame}│${RESET}${padRight(r, RIGHT_W)}${C.frameBright}│${RESET}`
      );
    }
    return rows;
  }

  function renderDeckBody(): string[] {
    const left: string[] = [];
    left.push(` ${C.godotBlue}COMMAND MODULES${RESET}`);
    left.push('');

    deckActions.forEach((act, idx) => {
      const selected = idx === cursorIndex;
      const title = truncateVisible(act.title, LEFT_W - 5);
      if (selected) {
        left.push(` ${C.rowSelected} ❯ ${padRight(title, LEFT_W - 5)} ${RESET}`);
      } else {
        left.push(`   ${C.text}${title}${RESET}`);
      }
    });

    const selectedAct = deckActions[cursorIndex] || deckActions[0];
    const right: string[] = [];
    right.push(` ${C.sky}INSPECTOR // MODULE TELEMETRY${RESET}`);
    right.push(` ${C.frame}${'─'.repeat(RIGHT_W - 2)}${RESET}`);
    right.push(` ${C.white}${selectedAct.title}${RESET}`);
    right.push(` ${C.muted}Tag:${RESET} ${C.emerald}[${selectedAct.badge}]${RESET}`);
    right.push(` ${C.muted}Target:${RESET} ${C.cyan}${truncateVisible(selectedAct.target, RIGHT_W - 10)}${RESET}`);
    right.push('');
    for (const wLine of wrapText(selectedAct.summary, RIGHT_W - 3)) {
      right.push(` ${C.text}${wLine}${RESET}`);
    }
    right.push('');
    right.push(` ${C.frame}${'─'.repeat(RIGHT_W - 2)}${RESET}`);
    right.push(` ${C.godotBlue}ECOSYSTEM BRIDGES:${RESET}`);
    right.push(`  ${C.emerald}✓${RESET} ${C.text}Godot 4.x Engine & GDScript 2.0${RESET}`);
    right.push(`  ${C.blenderOrange}✓${RESET} ${C.text}Blender 3D glTF 2.0 (-col / PBR)${RESET}`);
    right.push(`  ${C.sky}✓${RESET} ${C.text}Context7 (ctx7) + LSP Port 6005${RESET}`);

    return buildSplitRows(left, right);
  }

  function renderSkillsBody(): string[] {
    const left: string[] = [];
    left.push(` ${C.godotBlue}CURATED AI SKILLS (Enter = Install)${RESET}`);
    left.push('');

    CURATED_SKILLS.forEach((skill, idx) => {
      const selected = idx === cursorIndex;
      const label = truncateVisible(skill.id, LEFT_W - 6);
      if (selected) {
        left.push(` ${C.rowSelected} ❯ ${padRight(label, LEFT_W - 5)} ${RESET}`);
      } else {
        left.push(`   ${C.text}${label}${RESET}`);
      }
    });

    const skill = CURATED_SKILLS[cursorIndex] || CURATED_SKILLS[0];
    const right: string[] = [];
    right.push(` ${C.sky}SKILL INSPECTOR // SKILL.md${RESET}`);
    right.push(` ${C.frame}${'─'.repeat(RIGHT_W - 2)}${RESET}`);
    right.push(` ${C.white}${ truncateVisible(skill.name, RIGHT_W - 3) }${RESET}`);
    right.push(` ${C.muted}ID:${RESET} ${C.cyan}${skill.id}${RESET}   ${C.muted}Ver:${RESET} ${C.emerald}v${skill.version}${RESET}`);
    right.push(` ${C.muted}Path:${RESET} ${C.text}.agents/skills/${skill.id}${RESET}`);
    right.push('');
    for (const wLine of wrapText(skill.description, RIGHT_W - 3)) {
      right.push(` ${C.text}${wLine}${RESET}`);
    }
    right.push('');
    right.push(` ${C.emerald}▶ Press [Enter] to inject into project${RESET}`);

    return buildSplitRows(left, right);
  }

  function renderMcpBody(): string[] {
    const left: string[] = [];
    left.push(` ${C.godotBlue}MCP SERVERS (Enter = Configure)${RESET}`);
    left.push('');

    OFFICIAL_GODOT_MCP_SERVERS.forEach((mcp, idx) => {
      const selected = idx === cursorIndex;
      const label = truncateVisible(mcp.id, LEFT_W - 6);
      if (selected) {
        left.push(` ${C.rowSelected} ❯ ${padRight(label, LEFT_W - 5)} ${RESET}`);
      } else {
        left.push(`   ${C.text}${label}${RESET}`);
      }
    });

    const mcp = OFFICIAL_GODOT_MCP_SERVERS[cursorIndex] || OFFICIAL_GODOT_MCP_SERVERS[0];
    const right: string[] = [];
    right.push(` ${C.sky}MCP BRIDGE INSPECTOR // .mcp.json${RESET}`);
    right.push(` ${C.frame}${'─'.repeat(RIGHT_W - 2)}${RESET}`);
    right.push(` ${C.white}${truncateVisible(mcp.name, RIGHT_W - 3)}${RESET}`);
    right.push(` ${C.muted}Server ID:${RESET} ${C.cyan}${mcp.id}${RESET}`);
    right.push(` ${C.muted}Command:${RESET} ${C.emerald}${truncateVisible(`${mcp.command} ${mcp.args.join(' ')}`, RIGHT_W - 11)}${RESET}`);
    right.push('');
    for (const wLine of wrapText(mcp.description, RIGHT_W - 3)) {
      right.push(` ${C.text}${wLine}${RESET}`);
    }
    right.push('');
    right.push(` ${C.emerald}▶ Press [Enter] to write to .mcp.json${RESET}`);

    return buildSplitRows(left, right);
  }

  function renderProjectsBody(): string[] {
    const left: string[] = [];
    left.push(` ${C.godotBlue}GODOT 4 PROJECTS (r = Scan ~)${RESET}`);
    left.push('');

    if (projects.length === 0) {
      left.push(`   ${C.muted}No project.godot in CWD${RESET}`);
      left.push(`   ${C.sky}Press 'r' to scan Home Dir${RESET}`);
    } else {
      projects.forEach((p, idx) => {
        const selected = idx === cursorIndex;
        const label = truncateVisible(p.name, LEFT_W - 6);
        if (selected) {
          left.push(` ${C.rowSelected} ❯ ${padRight(label, LEFT_W - 5)} ${RESET}`);
        } else {
          left.push(`   ${C.text}${label}${RESET}`);
        }
      });
    }

    const right: string[] = [];
    right.push(` ${C.sky}PROJECT TELEMETRY${RESET}`);
    right.push(` ${C.frame}${'─'.repeat(RIGHT_W - 2)}${RESET}`);

    const proj = projects[cursorIndex];
    if (!proj) {
      right.push(` ${C.amber}No Godot 4 project selected.${RESET}`);
      right.push('');
      right.push(` ${C.text}Press ${BOLD}r${RESET}${C.text} to scan ${os.homedir()}${RESET}`);
      right.push(` ${C.text}or run OrbitKit inside a directory${RESET}`);
      right.push(` ${C.text}containing a ${C.cyan}project.godot${RESET}${C.text} file.${RESET}`);
    } else {
      right.push(` ${C.white}${truncateVisible(proj.name, RIGHT_W - 3)}${RESET}`);
      right.push(` ${C.muted}Path:${RESET} ${C.cyan}${truncateVisible(proj.projectPath, RIGHT_W - 8)}${RESET}`);
      right.push(` ${C.muted}MCP Config:${RESET} ${proj.hasMcpConfig ? `${C.emerald}Active (.mcp.json)${RESET}` : `${C.amber}Not configured${RESET}`}`);
      right.push('');
      right.push(` ${C.godotBlue}Installed AI Skills (${proj.installedSkills.length}):${RESET}`);
      if (proj.installedSkills.length > 0) {
        for (const s of proj.installedSkills.slice(0, 4)) {
          right.push(`  ${C.emerald}•${RESET} ${C.text}${s}${RESET}`);
        }
      } else {
        right.push(`  ${C.muted}None installed yet${RESET}`);
      }
      right.push('');
      right.push(` ${C.godotBlue}Installed Addons (${proj.installedAddons.length}):${RESET}`);
      right.push(
        `  ${C.text}${proj.installedAddons.length ? truncateVisible(proj.installedAddons.join(', '), RIGHT_W - 4) : 'None'}${RESET}`
      );
    }

    return buildSplitRows(left, right);
  }

  function renderDoctorBody(): string[] {
    const left: string[] = [];
    left.push(` ${C.godotBlue}DIAGNOSTIC CHECKS (r = Re-run)${RESET}`);
    left.push('');

    if (!doctorItems) {
      left.push(`   ${C.muted}Running health checks...${RESET}`);
    } else {
      doctorItems.forEach((item, idx) => {
        const selected = idx === cursorIndex;
        const icon = item.status === 'ok' ? `${C.emerald}✓${RESET}` : item.status === 'warning' ? `${C.amber}⚠${RESET}` : `${C.rose}✗${RESET}`;
        const label = truncateVisible(item.name, LEFT_W - 7);
        if (selected) {
          left.push(` ${C.rowSelected} ❯ ${padRight(label, LEFT_W - 5)} ${RESET}`);
        } else {
          left.push(`   ${icon} ${C.text}${label}${RESET}`);
        }
      });
    }

    const right: string[] = [];
    right.push(` ${C.sky}DIAGNOSTIC DETAILS${RESET}`);
    right.push(` ${C.frame}${'─'.repeat(RIGHT_W - 2)}${RESET}`);

    const selectedItem = doctorItems?.[cursorIndex];
    if (!selectedItem) {
      right.push(` ${C.text}Press ${BOLD}r${RESET}${C.text} to run environment checks.${RESET}`);
    } else {
      const statusBadge =
        selectedItem.status === 'ok'
          ? `${C.emerald}[PASS]${RESET}`
          : selectedItem.status === 'warning'
          ? `${C.amber}[WARNING]${RESET}`
          : `${C.rose}[ERROR]${RESET}`;
      right.push(` ${statusBadge} ${C.white}${selectedItem.name}${RESET}`);
      right.push('');
      for (const wLine of wrapText(selectedItem.message, RIGHT_W - 3)) {
        right.push(` ${C.text}${wLine}${RESET}`);
      }
    }

    return buildSplitRows(left, right);
  }

  function renderSearchBody(): string[] {
    const matches = getFilteredItems();
    const left: string[] = [];
    left.push(` ${C.sky}FILTER:${RESET} ${C.white}${searchQuery}${RESET}${C.godotBlue}█${RESET}`);
    left.push(` ${C.frame}${'─'.repeat(LEFT_W - 2)}${RESET}`);

    if (matches.length === 0) {
      left.push(`   ${C.muted}No matching skills or MCPs${RESET}`);
    } else {
      matches.slice(0, 10).forEach((m, idx) => {
        const selected = idx === cursorIndex;
        const label = truncateVisible(`[${m.kind}] ${m.id}`, LEFT_W - 6);
        if (selected) {
          left.push(` ${C.rowSelected} ❯ ${padRight(label, LEFT_W - 5)} ${RESET}`);
        } else {
          left.push(`   ${C.text}${label}${RESET}`);
        }
      });
    }

    const right: string[] = [];
    right.push(` ${C.sky}SEARCH INSPECTOR (Enter = Install)${RESET}`);
    right.push(` ${C.frame}${'─'.repeat(RIGHT_W - 2)}${RESET}`);

    const item = matches[cursorIndex];
    if (!item) {
      right.push(` ${C.muted}Type to filter across all Godot 4${RESET}`);
      right.push(` ${C.muted}AI Skills and MCP servers.${RESET}`);
    } else {
      right.push(` ${C.white}${truncateVisible(item.title, RIGHT_W - 3)}${RESET}`);
      right.push(` ${C.muted}Type:${RESET} ${C.emerald}${item.kind}${RESET}   ${C.muted}ID:${RESET} ${C.cyan}${item.id}${RESET}`);
      right.push(` ${C.muted}Target:${RESET} ${C.text}${truncateVisible(item.target, RIGHT_W - 10)}${RESET}`);
      right.push('');
      for (const wLine of wrapText(item.desc, RIGHT_W - 3)) {
        right.push(` ${C.text}${wLine}${RESET}`);
      }
      right.push('');
      right.push(` ${C.emerald}▶ Press [Enter] to install${RESET}`);
    }

    return buildSplitRows(left, right);
  }

  function renderFooter(): string[] {
    const lines: string[] = [];
    lines.push(`  ${C.frameBright}├${'─'.repeat(LEFT_W)}┴${'─'.repeat(RIGHT_W)}┤${RESET}`);

    const statusIcon =
      statusType === 'ok'
        ? `${C.emerald}✓${RESET}`
        : statusType === 'warn'
        ? `${C.amber}⚠${RESET}`
        : statusType === 'err'
        ? `${C.rose}✗${RESET}`
        : `${C.sky}◈${RESET}`;

    const statusLine = ` ${statusIcon} ${C.text}${truncateVisible(statusLog, TOTAL_W - 6)}${RESET}`;
    lines.push(`  ${C.frameBright}│${RESET}${padRight(statusLine, TOTAL_W - 2)}${C.frameBright}│${RESET}`);
    lines.push(`  ${C.frameBright}├${'─'.repeat(TOTAL_W - 2)}┤${RESET}`);

    const helpLine =
      activeTab === 'search'
        ? ` ${C.sky}[Type]${RESET}${C.muted} Filter  ${C.sky}[↑/↓]${RESET}${C.muted} Select  ${C.sky}[Enter]${RESET}${C.muted} Install  ${C.sky}[Esc]${RESET}${C.muted} Exit Search${RESET}`
        : ` ${C.sky}[↑/↓]${RESET}${C.muted} Move  ${C.sky}[←/→ or 1-5]${RESET}${C.muted} Switch Dock  ${C.sky}[Enter]${RESET}${C.muted} Run/Install  ${C.sky}[/]${RESET}${C.muted} Filter  ${C.sky}[q]${RESET}${C.muted} Quit${RESET}`;

    lines.push(`  ${C.frameBright}│${RESET}${padRight(helpLine, TOTAL_W - 2)}${C.frameBright}│${RESET}`);
    lines.push(`  ${C.frameBright}╰${'─'.repeat(TOTAL_W - 2)}╯${RESET}`);
    return lines;
  }

  function getMaxCursorForActiveTab(): number {
    if (activeTab === 'deck') return Math.max(0, deckActions.length - 1);
    if (activeTab === 'skills') return Math.max(0, CURATED_SKILLS.length - 1);
    if (activeTab === 'mcp') return Math.max(0, OFFICIAL_GODOT_MCP_SERVERS.length - 1);
    if (activeTab === 'projects') return Math.max(0, projects.length - 1);
    if (activeTab === 'doctor') return Math.max(0, (doctorItems?.length || 1) - 1);
    if (activeTab === 'search') return Math.max(0, Math.min(9, getFilteredItems().length - 1));
    return 0;
  }

  function render() {
    stdout.write('\x1B[2J\x1B[0f\x1B[?25l');
    const out: string[] = [''];
    out.push(...renderHeader());

    if (activeTab === 'deck') out.push(...renderDeckBody());
    else if (activeTab === 'skills') out.push(...renderSkillsBody());
    else if (activeTab === 'mcp') out.push(...renderMcpBody());
    else if (activeTab === 'projects') out.push(...renderProjectsBody());
    else if (activeTab === 'doctor') out.push(...renderDoctorBody());
    else if (activeTab === 'search') out.push(...renderSearchBody());

    out.push(...renderFooter());
    stdout.write(out.join('\n') + '\n');
  }

  async function switchTab(nextTab: TuiTab) {
    activeTab = nextTab;
    cursorIndex = 0;
    if (nextTab === 'doctor' && !doctorItems) {
      statusLog = 'Running Godot 4 & LSP diagnostics...';
      statusType = 'info';
      render();
      doctorItems = await runSystemDiagnostics(process.cwd());
      statusLog = 'Diagnostics completed.';
      statusType = 'ok';
    }
    render();
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

    // Search input mode
    if (activeTab === 'search') {
      if (key.name === 'escape') {
        activeTab = 'deck';
        cursorIndex = 0;
        render();
        return;
      }
      if (key.name === 'up') {
        cursorIndex = Math.max(0, cursorIndex - 1);
        render();
        return;
      }
      if (key.name === 'down') {
        cursorIndex = Math.min(getMaxCursorForActiveTab(), cursorIndex + 1);
        render();
        return;
      }
      if (key.name === 'return' || key.name === 'enter') {
        const matches = getFilteredItems();
        const chosen = matches[cursorIndex];
        if (chosen) {
          const res =
            chosen.kind === 'SKILL'
              ? await installSkill(process.cwd(), chosen.id)
              : await installMcpServer(process.cwd(), chosen.id);
          statusLog = res.message;
          statusType = res.success ? 'ok' : 'err';
          render();
        }
        return;
      }
      if (key.name === 'backspace') {
        searchQuery = searchQuery.slice(0, -1);
        cursorIndex = 0;
        render();
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

    // Global shortcuts outside search
    if (key.name === 'q') {
      cleanupAndExit();
      return;
    }

    if (str === '/' || key.name === 's') {
      activeTab = 'search';
      searchQuery = '';
      cursorIndex = 0;
      render();
      return;
    }

    if (str === '1') return switchTab('deck');
    if (str === '2') return switchTab('skills');
    if (str === '3') return switchTab('mcp');
    if (str === '4') return switchTab('projects');
    if (str === '5') return switchTab('doctor');

    if (key.name === 'left') {
      const idx = TABS_ORDER.indexOf(activeTab);
      const prev = TABS_ORDER[(idx - 1 + TABS_ORDER.length) % TABS_ORDER.length];
      await switchTab(prev);
      return;
    }

    if (key.name === 'right' || key.name === 'tab') {
      const idx = TABS_ORDER.indexOf(activeTab);
      const next = TABS_ORDER[(idx + 1) % TABS_ORDER.length];
      await switchTab(next);
      return;
    }

    if (key.name === 'escape' || key.name === 'b') {
      activeTab = 'deck';
      cursorIndex = 0;
      render();
      return;
    }

    if (key.name === 'up' || key.name === 'k') {
      cursorIndex = Math.max(0, cursorIndex - 1);
      render();
      return;
    }

    if (key.name === 'down' || key.name === 'j') {
      cursorIndex = Math.min(getMaxCursorForActiveTab(), cursorIndex + 1);
      render();
      return;
    }

    if (key.name === 'r' && activeTab === 'projects') {
      statusLog = `Scanning ${os.homedir()} for Godot 4 projects...`;
      statusType = 'info';
      render();
      projects = await scanForGodotProjects(os.homedir(), 3);
      cursorIndex = 0;
      statusLog = `Discovered ${projects.length} Godot project(s) in ${os.homedir()}`;
      statusType = projects.length > 0 ? 'ok' : 'warn';
      render();
      return;
    }

    if (key.name === 'r' && activeTab === 'doctor') {
      statusLog = 'Re-running Godot 4 & LSP diagnostics...';
      statusType = 'info';
      render();
      doctorItems = await runSystemDiagnostics(process.cwd());
      statusLog = 'Diagnostics refreshed.';
      statusType = 'ok';
      render();
      return;
    }

    if (key.name === 'return' || key.name === 'enter') {
      if (activeTab === 'deck') {
        const act = deckActions[cursorIndex];
        if (act) {
          await act.onRun();
          render();
        }
      } else if (activeTab === 'skills') {
        const skill = CURATED_SKILLS[cursorIndex];
        if (skill) {
          const res = await installSkill(process.cwd(), skill.id);
          statusLog = res.message;
          statusType = res.success ? 'ok' : 'err';
          render();
        }
      } else if (activeTab === 'mcp') {
        const mcp = OFFICIAL_GODOT_MCP_SERVERS[cursorIndex];
        if (mcp) {
          const res = await installMcpServer(process.cwd(), mcp.id);
          statusLog = res.message;
          statusType = res.success ? 'ok' : 'err';
          render();
        }
      }
    }
  });
}
