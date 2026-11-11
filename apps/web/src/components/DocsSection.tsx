import { useState } from 'react';
import { Terminal, Bot, Cpu, Copy, Check, Layers, RefreshCw, Trash2, Zap } from 'lucide-react';
import { Language, TRANSLATIONS } from '../content/translations';
import { safeCopyToClipboard } from '../utils/clipboard';

interface Props {
  lang: Language;
}

export function DocsSection({ lang }: Props) {
  const [activeTab, setActiveTab] = useState<'cli' | 'mcp' | 'skills' | 'plugin'>('cli');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const t = TRANSLATIONS[lang].docs;

  const handleCopy = (code: string, id: string) => {
    void safeCopyToClipboard(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="docs" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em] [text-wrap:balance]">
          {t.title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed [text-wrap:pretty]">
          {t.sub}
        </p>
      </div>

      {/* Clean Segmented Tab Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-godot-950 border border-godot-border rounded-xl max-w-2xl mx-auto mb-10" role="tablist">
        {[
          { id: 'cli', label: t.tabCli, icon: Terminal },
          { id: 'mcp', label: t.tabMcp, icon: Layers },
          { id: 'skills', label: t.tabSkills, icon: Bot },
          { id: 'plugin', label: t.tabPlugin, icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer select-none transition ${
                active
                  ? 'bg-[#23689b] text-white border border-godot-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-godot-card'
              }`}
            >
              <Icon className="w-4 h-4 mr-2 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-8">
        {/* TAB 1: CLI Commands */}
        {activeTab === 'cli' && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">VGSkillFrame (Videogame Skill Frame) CLI Reference</h3>
              <p className="text-slate-300 text-sm leading-relaxed [text-wrap:pretty]">
                The primary command-line tool for managing Godot 4 projects, AI agent skills, and environment health. Binary aliases <code className="text-godot-300 font-mono text-xs">vgskillframe</code>, <code className="text-godot-300 font-mono text-xs">vgskill</code>, and <code className="text-godot-300 font-mono text-xs">orbitkit</code> are supported.
              </p>
            </div>

            {/* Quick Install, Upgrade & Uninstall Strip */}
            <div id="update-cli" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* 1. Fresh Install Box */}
              <div className="p-5 rounded-xl bg-godot-card border border-godot-border space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-godot-400" />
                      <span className="font-semibold text-white text-sm">
                        {lang === 'es' ? '1. Instalar por NPM' : '1. Install via NPM'}
                      </span>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                      v0.7.0
                    </span>
                  </div>
                  <code className="block p-3 rounded-lg bg-godot-950 font-mono text-xs sm:text-sm text-godot-300 border border-godot-border">
                    npm install -g @francisiv/vgskillframe
                  </code>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">{lang === 'es' ? 'Abre la interfaz:' : 'Open TUI:'} <code className="text-slate-200 font-mono">vgskillframe</code></span>
                  <button
                    type="button"
                    onClick={() => handleCopy('npm install -g @francisiv/vgskillframe', 'quick_npm')}
                    className="flex items-center px-3 py-1.5 rounded bg-[#23689b] hover:bg-[#2d7bb6] text-white text-xs font-semibold transition"
                  >
                    <span className="inline-flex mr-1 shrink-0">
                      {copiedId === 'quick_npm' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </span>
                    <span>{copiedId === 'quick_npm' ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* 2. Upgrade Box */}
              <div className="p-5 rounded-xl bg-godot-card border border-emerald-500/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-white text-sm">
                        {lang === 'es' ? '2. Actualizar CLI' : '2. Upgrade CLI'}
                      </span>
                    </div>
                  </div>
                  <code className="block p-3 rounded-lg bg-godot-950 font-mono text-xs sm:text-sm text-emerald-300 border border-emerald-500/30">
                    vgskillframe upgrade
                  </code>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">{lang === 'es' ? 'Solo verificar:' : 'Check only:'} <code className="text-slate-200 font-mono">--check</code></span>
                  <button
                    type="button"
                    onClick={() => handleCopy('vgskillframe upgrade', 'upgrade_npm')}
                    className="flex items-center px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
                  >
                    <span className="inline-flex mr-1 shrink-0">
                      {copiedId === 'upgrade_npm' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </span>
                    <span>{copiedId === 'upgrade_npm' ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* 3. Uninstall Box */}
              <div className="p-5 rounded-xl bg-godot-card border border-rose-500/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span className="font-semibold text-white text-sm">
                        {lang === 'es' ? '3. Desinstalar CLI' : '3. Uninstall CLI'}
                      </span>
                    </div>
                  </div>
                  <code className="block p-3 rounded-lg bg-godot-950 font-mono text-xs sm:text-sm text-rose-300 border border-rose-500/30">
                    vgskillframe uninstall
                  </code>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">{lang === 'es' ? 'Limpia symlinks globales' : 'Cleans global symlinks'}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('vgskillframe uninstall', 'uninstall_cli')}
                    className="flex items-center px-3 py-1.5 rounded bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold transition"
                  >
                    <span className="inline-flex mr-1 shrink-0">
                      {copiedId === 'uninstall_cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </span>
                    <span>{copiedId === 'uninstall_cli' ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Structured Command Reference Table / Definition Rows */}
            <div className="rounded-xl bg-godot-card border border-godot-border overflow-hidden">
              <div className="p-4 bg-godot-950 border-b border-godot-border flex items-center justify-between text-xs font-mono text-slate-400">
                <span>COMMAND</span>
                <span>FUNCTIONALITY & PURPOSE</span>
              </div>
              <div className="divide-y divide-godot-border/60">
                {[
                  {
                    cmd: 'vgskillframe gui',
                    desc: 'Launches the interactive Web GUI Dashboard (localhost:4567) with visual project explorer, 1-click AI Skills installer, MCP manager, and live diagnostics.'
                  },
                  {
                    cmd: 'vgskillframe',
                    desc: 'Launches the interactive Terminal User Interface (TUI) with automatic version checking, live search, and 1-key Skill/MCP installation.'
                  },
                  {
                    cmd: 'vgskillframe upgrade [--check]',
                    desc: 'Checks your installed CLI version against NPM & GitHub and automatically upgrades @francisiv/vgskillframe globally.'
                  },
                  {
                    cmd: 'vgskillframe uninstall [--project]',
                    desc: 'Cleanly uninstalls the global @francisiv/vgskillframe CLI binary and symlinks from your system.'
                  },
                  {
                    cmd: 'vgskillframe scan [directory]',
                    desc: 'Recursively locates all Godot projects on your system. Reports installed addons, AI skills, and MCP configuration status.'
                  },
                  {
                    cmd: 'vgskillframe check [--json]',
                    desc: 'Queries the versioned remote catalog to detect newly published AI skills, outdated project skills, and CLI updates.'
                  },
                  {
                    cmd: 'vgskillframe update [--all]',
                    desc: 'Safely applies skill and MCP updates with SHA-256 checksum verification and atomic extraction.'
                  },
                  {
                    cmd: 'vgskillframe init',
                    desc: 'Initializes VGSkillFrame in the current Godot project. Installs addons/vgskillframe and configures .mcp.json.'
                  },
                  {
                    cmd: 'vgskillframe skill list',
                    desc: 'Displays the catalog of verified AI Skills tailored specifically for Godot 4 and Blender 3D.'
                  },
                  {
                    cmd: 'vgskillframe skill install <skill-id>',
                    desc: 'Installs or updates an AI Skill directly into .agents/skills/ and .claude/skills/ in your project.'
                  },
                  {
                    cmd: 'vgskillframe mcp add <server-id>',
                    desc: 'Configures a Model Context Protocol server (e.g. ctx7 or godot-lsp) in .mcp.json.'
                  },
                  {
                    cmd: 'vgskillframe record [--last] [--prompt] [--copy]',
                    desc: 'Blackbox Flight Recorder: captures Godot GDScript errors, recent input events, and scene tree hierarchy to synthesize AI-ready triage prompts for Claude Code, Cursor, and Antigravity.'
                  },
                  {
                    cmd: 'vgskillframe doctor',
                    desc: 'Runs full diagnostic self-checks: verifies Godot 4 binary in PATH, tests GDScript LSP port 6005, inspects Blackbox crash telemetry, and validates current project context.'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-godot-cardHover/50 transition"
                  >
                    <div className="space-y-1 md:max-w-md shrink-0">
                      <code className="text-godot-300 font-mono text-xs sm:text-sm font-semibold">
                        $ {item.cmd}
                      </code>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed flex-1 md:px-4 [text-wrap:pretty]">
                      {item.desc}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.cmd, `cmd_${idx}`)}
                      className="p-2 rounded-lg bg-godot-950 border border-godot-border text-slate-300 hover:text-white transition shrink-0 self-start md:self-auto"
                    >
                      {copiedId === `cmd_${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MCP Configuration */}
        {activeTab === 'mcp' && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">Model Context Protocol (MCP) Integration</h3>
              <p className="text-slate-300 text-sm leading-relaxed [text-wrap:pretty]">
                How VGSkillFrame bridges AI assistants directly to Godot editor internal services and live documentation.
              </p>
            </div>

            <div className="rounded-xl bg-godot-card border border-godot-border overflow-hidden divide-y divide-godot-border/60">
              {[
                {
                  id: 'godot-engine-bridge',
                  name: 'godot-engine-bridge',
                  desc: 'Live editor control bridge: runs game instances, monitors runtime console errors, hot-reloads scripts, and inspects nodes dynamically.',
                  cmd: 'vgskillframe mcp add godot-engine-bridge'
                },
                {
                  id: 'godot-lsp',
                  name: 'godot-lsp',
                  desc: "Connects AI agents to Godot's GDScript LSP on port 6005 for real-time syntax checking, typed parameter suggestions, and signature help.",
                  cmd: 'vgskillframe mcp add godot-lsp'
                },
                {
                  id: 'ctx7',
                  name: 'ctx7 (Context7 by Upstash)',
                  desc: 'Injects live, version-locked API docs straight from Context7 into the prompt context to completely eliminate AI hallucinations.',
                  cmd: 'vgskillframe mcp add ctx7'
                },
                {
                  id: 'godot-docs',
                  name: 'godot-docs',
                  desc: 'Zero-latency offline documentation access for all Godot 4 classes, methods, signals, constants, and properties.',
                  cmd: 'vgskillframe mcp add godot-docs'
                },
                {
                  id: 'godot-scene-inspector',
                  name: 'godot-scene-inspector',
                  desc: 'Parses .tscn scene hierarchies and .tres resource definitions so agents can navigate node trees without corrupting UID links.',
                  cmd: 'vgskillframe mcp add godot-scene-inspector'
                },
                {
                  id: 'godot-gut-runner',
                  name: 'godot-gut-runner',
                  desc: 'Automates unit test execution using the GUT framework and streams test pass/fail reports directly to your AI assistant.',
                  cmd: 'vgskillframe mcp add godot-gut-runner'
                }
              ].map((server) => (
                <div key={server.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 md:w-1/3 shrink-0">
                    <span className="font-bold text-white text-base flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-godot-400" />
                      {server.name}
                    </span>
                    <code className="text-xs font-mono text-godot-300 block">
                      $ {server.cmd}
                    </code>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed flex-1 md:px-4 [text-wrap:pretty]">
                    {server.desc}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(server.cmd, server.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#23689b] hover:bg-[#2d7bb6] text-white text-xs font-semibold transition shrink-0 self-start md:self-auto"
                  >
                    {copiedId === server.id ? (
                      <span className="flex items-center text-emerald-300">
                        <Check className="w-3.5 h-3.5 mr-1" /> Copiado
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copiar Comando
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Sample .mcp.json */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Generated Project Configuration: <code className="text-godot-300 font-mono">.mcp.json</code></span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(
                        {
                          mcpServers: {
                            'godot-engine-bridge': {
                              command: 'npx',
                              args: ['-y', '@devdock/mcp-godot-bridge']
                            },
                            'godot-lsp': {
                              command: 'npx',
                              args: ['-y', '@devdock/mcp-godot-lsp'],
                              env: { GODOT_LSP_PORT: '6005' }
                            },
                            'ctx7': {
                              command: 'npx',
                              args: ['-y', 'ctx7', 'mcp']
                            }
                          }
                        },
                        null,
                        2
                      ),
                      'mcp_json'
                    )
                  }
                  className="flex items-center text-godot-300 hover:text-white transition font-mono"
                >
                  <span className="inline-flex mr-1 shrink-0">
                    {copiedId === 'mcp_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </span>
                  <span>{copiedId === 'mcp_json' ? (lang === 'es' ? '¡Copiado!' : 'Copied') : (lang === 'es' ? 'Copiar JSON' : 'Copy JSON')}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-godot-950 font-mono text-xs text-slate-300 border border-godot-border overflow-x-auto">
{`{
  "mcpServers": {
    "godot-engine-bridge": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-bridge"]
    },
    "godot-lsp": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-lsp"],
      "env": { "GODOT_LSP_PORT": "6005" }
    },
    "ctx7": {
      "command": "npx",
      "args": ["-y", "ctx7", "mcp"]
    }
  }
}`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: Curated AI Skills */}
        {activeTab === 'skills' && (
          <div className="space-y-8">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/60">
                  {lang === 'es' ? '20 Skills Disponibles' : '20 Skills Available'}
                </span>
                <span className="text-xs text-slate-400">
                  {lang === 'es' ? '• Godot 4 + Universales para cualquier motor' : '• Godot 4 + Universal Engine-Agnostic'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {lang === 'es' ? 'Catálogo de AI Skills Oficiales' : 'Official Curated AI Skills Catalog'}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed [text-wrap:pretty]">
                {lang === 'es'
                  ? 'Instrucciones y protocolos de arquitectura listos para Antigravity, Claude Code, Cursor y Codex. Se instalan automáticamente en .agents/skills/ y .claude/skills/.'
                  : 'Architecture protocols and instructions ready for Antigravity, Claude Code, Cursor, and Codex. Auto-installed in .agents/skills/ and .claude/skills/.'}
              </p>
            </div>

            <div className="rounded-xl bg-godot-card border border-godot-border overflow-hidden divide-y divide-godot-border/60">
              {[
                // 1. Universal Skills (Engine-Agnostic)
                {
                  id: 'game-feel-kinesthetics',
                  name: 'Game Feel, Juice & Kinesthetics Master (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Reglas cinemáticas universales: coyote time (80-120ms), input buffering FIFO, sacudida de cámara por trauma al cuadrado, hit stop e interpolación exponencial.'
                    : 'Universal kinesthetics rules: coyote time (80-120ms), FIFO input buffering, trauma-squared screen shake, freeze frame hit-stop, and exponential dampening.'
                },
                {
                  id: 'gamedev-math-recipes',
                  name: 'Universal GameDev Math & Vector Recipes (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Matemáticas espaciales 2D/3D: SLERP y cuaterniones sin Gimbal Lock, conos de visión por producto punto, trayectorias balísticas y vectores de reflexión.'
                    : 'Essential 2D/3D game math: Quaternion SLERP without Gimbal Lock, dot-product vision cones, ballistic trajectory launch velocity, and reflection vectors.'
                },
                {
                  id: 'game-ai-behavior-trees',
                  name: 'Universal AI Behavior Tree Architecture (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Diseño desacoplado de árboles de comportamiento: nodos Composite (Selector, Sequence, Parallel), Decorators (Inverter, Cooldown) y memoria compartida Blackboard.'
                    : 'Decoupled Behavior Tree design: Composite nodes (Selector, Sequence, Parallel), Decorators (Inverter, Cooldown), Leaves, and Blackboard memory pattern.'
                },
                {
                  id: 'game-ai-utility-goap',
                  name: 'GOAP & Utility AI Architecture (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Planificación orientada a objetivos (GOAP con búsqueda hacia atrás A*) y curvas de utilidad matemáticas combinadas por media geométrica para toma de decisiones orgánicas.'
                    : 'Goal-Oriented Action Planning (GOAP backward A* search) and mathematical utility response curves combined via geometric mean for organic NPC decisions.'
                },
                {
                  id: 'procgen-dungeon-architect',
                  name: 'Procedural Dungeon & Level Generation (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Algoritmos generativos de mazmorras: Binary Space Partitioning (BSP), autómatas celulares para cuevas, Triangulación de Delaunay + MST con bucles y Drunkard Walk.'
                    : 'Procedural map generation: Binary Space Partitioning (BSP), Cellular Automata caves, Delaunay Triangulation + MST with hallway loops, and Drunkard Walk.'
                },
                {
                  id: 'procgen-wfc-solver',
                  name: 'Wave Function Collapse (WFC) Solver (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Generación por resolución de restricciones (WFC): colapso por entropía de Shannon, selección ponderada y propagación de compatibilidad de sockets por cola AC-3.'
                    : 'Constraint-satisfaction WFC solver: Shannon Entropy selection, weighted prototype collapse, and AC-3 directional socket constraint propagation.'
                },
                {
                  id: 'game-programming-patterns',
                  name: 'Game Programming Patterns & Decoupled Architecture (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Patrones de producción: Command Pattern (rollback, undo/redo, replays), Object Pooling sin sobrecarga de GC, Event Bus desacoplado y principios DOD / ECS.'
                    : 'Production patterns: Command Pattern (rollback, undo/redo, replays), zero-GC Object Pooling, type-safe Event Bus, and Data-Oriented Design / ECS principles.'
                },
                {
                  id: 'game-economy-loot-tables',
                  name: 'Loot Tables, Inventory Grids & Game Economy (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Sistemas de drop con peso probabilístico acumulativo, mecánicas de pity, empaquetamiento espacial en inventarios de grilla 2D y curvas exponenciales de XP.'
                    : 'Cumulative weighted drop tables, pity counters, 2D spatial grid inventory packing (Diablo-style), and exponential level scaling curves.'
                },
                {
                  id: 'narrative-dialogue-fsm',
                  name: 'Narrative Dialogue Trees & Quest State Machines (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Grafos dirigidos de conversación en JSON, evaluadores de flags de mundo, máquinas de estado de misiones (etapas e hitos) y claves de localización i18n.'
                    : 'Branching JSON conversation graphs, world flag condition evaluators, immutable quest lifecycle state machines, and tokenized i18n localization.'
                },
                {
                  id: 'shader-math-artistry',
                  name: 'Universal Shader Math & Procedural VFX (v1.0.0)',
                  badge: lang === 'es' ? 'Universal' : 'Universal',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Matemáticas de shaders independientes de motor: Signed Distance Functions (SDF 2D/3D), ruido procedural FBM, tramado ordenado con matriz Bayer y fórmulas PBR GGX.'
                    : 'Cross-engine shader math: 2D/3D Signed Distance Functions (SDF), procedural FBM noise, Bayer matrix ordered dithering, and Cook-Torrance GGX PBR formulas.'
                },
                // 2. Godot & Blender Specific Skills
                {
                  id: 'godot4-syntax-guardian',
                  name: 'Godot 4 Syntax Guardian (v1.3.0)',
                  badge: 'Godot 4.3+',
                  badgeColor: 'text-godot-300 bg-godot-950 border-godot-border',
                  desc: lang === 'es'
                    ? 'Protocolo anti-alucinación que prohíbe sintaxis obsoleta de Godot 3: impone TileMapLayer, FileAccess/DirAccess, Callables para señales y CharacterBody move_and_slide.'
                    : 'Anti-hallucination skill enforcing strict Godot 4.3+ rules: TileMapLayer, FileAccess/DirAccess, Callables signals, CharacterBody move_and_slide.'
                },
                {
                  id: 'godot-blender-pipeline',
                  name: 'Blender 3D to Godot 4 Asset Pipeline (v1.1.0)',
                  badge: 'Blender + Godot',
                  badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-900/60',
                  desc: lang === 'es'
                    ? 'Automatiza sufijos de importación .blend y glTF 2.0 (-col, -convcol, -loop), retargeting con Skeleton3D BoneMap y materiales PBR sin pasos manuales.'
                    : 'Automates .blend and glTF 2.0 import suffixes (-col, -convcol, -loop), Skeleton3D BoneMap retargeting, and PBR materials.'
                },
                {
                  id: 'gdscript-fsm-master',
                  name: 'GDScript Finite State Machine (v1.2.0)',
                  badge: 'Godot 4',
                  badgeColor: 'text-godot-300 bg-godot-950 border-godot-border',
                  desc: lang === 'es'
                    ? 'Patrón de máquina de estados modular y desacoplado usando nodos y clases State para combate, movimiento y comportamiento en GDScript.'
                    : 'Decoupled, modular state machine pattern using dedicated Node/State classes for combat, movement, and enemy AI in GDScript.'
                },
                {
                  id: 'godot-multiplayer-enet',
                  name: 'Godot 4 Multiplayer & Networking (v1.2.0)',
                  badge: 'Godot 4',
                  badgeColor: 'text-godot-300 bg-godot-950 border-godot-border',
                  desc: lang === 'es'
                    ? 'Arquitectura multijugador autoritativa con ENetMultiplayerPeer, anotaciones @rpc explícitas, MultiplayerSynchronizer y replicación de estado.'
                    : 'Authoritative multiplayer architecture using ENetMultiplayerPeer, RPC annotations (@rpc("any_peer", "call_local")), and SceneReplicationConfig.'
                },
                {
                  id: 'godot-shader-vfx',
                  name: 'Godot Shading Language (GDShader) VFX (v1.2.0)',
                  badge: 'Godot 4',
                  badgeColor: 'text-godot-300 bg-godot-950 border-godot-border',
                  desc: lang === 'es'
                    ? 'Pipeline de shaders para canvas_item 2D y spatial 3D, distorsión UV, disolución procedural y filtros con hint_screen_texture.'
                    : 'GLSL shader pipeline for 2D canvas_item and 3D spatial shaders, UV distortion, dissolve effects, and hint_screen_texture filters.'
                },
                {
                  id: 'godot-procedural-generation',
                  name: 'Procedural Generation & Pathfinding (v1.1.0)',
                  badge: 'Godot 4.3+',
                  badgeColor: 'text-godot-300 bg-godot-950 border-godot-border',
                  desc: lang === 'es'
                    ? 'Generación determinista con FastNoiseLite, colocación de salas, autotiling con TileMapLayer y navegación con AStar2D/AStar3D.'
                    : 'Deterministic generation with FastNoiseLite, dungeon room placement, TileMapLayer autotiling, and AStar2D/AStar3D navigation.'
                },
                {
                  id: 'godot-responsive-ui',
                  name: 'Responsive UI & Layouts (v1.1.0)',
                  badge: 'Godot 4',
                  badgeColor: 'text-godot-300 bg-godot-950 border-godot-border',
                  desc: lang === 'es'
                    ? 'Evita coordenadas fijas; implementa BoxContainers, MarginContainers, GridContainers, Anchors y tematización adaptativa.'
                    : 'Prevents hardcoded pixel coordinates; enforces BoxContainers, MarginContainers, GridContainers, Anchors, and Theme overrides.'
                },
                {
                  id: 'godot-save-system',
                  name: 'Cryptographic Save System (v1.0.0)',
                  badge: 'Godot 4',
                  badgeColor: 'text-godot-300 bg-godot-950 border-godot-border',
                  desc: lang === 'es'
                    ? 'Pipelines seguros de guardado/carga con serialización JSON/binaria y verificación de integridad criptográfica HMAC/SHA-256.'
                    : 'Anti-corruption and anti-tamper save/load pipelines using JSON/binary serialization and SHA-256 HMAC integrity verification.'
                },
                {
                  id: 'ctx7-docs-fetcher',
                  name: 'Context7 (ctx7) Live Docs Fetcher (v1.0.0)',
                  badge: 'MCP + Context7',
                  badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60',
                  desc: lang === 'es'
                    ? 'Instruye a los asistentes de IA a consultar documentación oficial y ejemplos de código verificados en Upstash Context7.'
                    : 'Instructs AI coding assistants to fetch fresh, version-specific library docs and syntax examples via Upstash Context7.'
                },
                {
                  id: 'gdscript-architect',
                  name: 'GDScript 4 Architect (v1.2.0)',
                  badge: 'Godot 4',
                  badgeColor: 'text-godot-300 bg-godot-950 border-godot-border',
                  desc: lang === 'es'
                    ? 'Alias histórico con pautas de tipado estricto, desacoplamiento por señales y composición de nodos sobre herencia profunda.'
                    : 'Legacy alias enforcing strict typing, signal decoupling, and node composition over deep inheritance in Godot 4.'
                }
              ].map((s) => (
                <div key={s.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-white flex items-center">
                        <Bot className="w-4 h-4 mr-2 text-purple-400 shrink-0" />
                        {s.name}
                      </h4>
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${s.badgeColor}`}>
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed [text-wrap:pretty]">{s.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(`vgskillframe skill install ${s.id}`, s.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#23689b] hover:bg-[#2d7bb6] text-white transition text-xs font-mono whitespace-nowrap shrink-0 border border-godot-400/30"
                  >
                    <span>{copiedId === s.id ? (lang === 'es' ? '¡Copiado!' : 'Copied Command!') : `vgskillframe skill install ${s.id}`}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Godot Editor Plugin */}
        {activeTab === 'plugin' && (
          <div className="space-y-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">VGSkillFrame Godot Editor Plugin</h3>
              <p className="text-slate-300 text-sm leading-relaxed [text-wrap:pretty]">
                Manage installed packages, updates and diagnostics without leaving the Godot editor.
              </p>
            </div>

            <div className="rounded-xl bg-godot-card border border-godot-border p-6 sm:p-8 space-y-6">
              <ol className="list-decimal list-inside space-y-5 text-slate-300 text-sm">
                <li className="leading-relaxed">
                  <span className="font-semibold text-white">Plugin placement:</span>
                  <p className="ml-6 text-slate-300 mt-1">
                    The plugin is auto-installed by the CLI into <code className="bg-godot-950 px-2 py-0.5 rounded text-godot-300 border border-godot-border font-mono text-xs">res://addons/vgskillframe/</code>.
                  </p>
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold text-white">Enabled in Project Settings:</span>
                  <p className="ml-6 text-slate-300 mt-1">
                    In the Godot editor, navigate to <span className="text-white font-medium">Project → Project Settings → Plugins</span> and ensure <strong className="text-white">VGSkillFrame</strong> is enabled.
                  </p>
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold text-white">Clean uninstallation & Diagnostics:</span>
                  <p className="ml-6 text-slate-300 mt-1">
                    Use the <strong className="text-white">Installed</strong> tab inside Godot or run <code className="bg-godot-950 px-2 py-0.5 rounded text-godot-300 border border-godot-border font-mono text-xs">vgskillframe doctor</code> to verify health anytime.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
