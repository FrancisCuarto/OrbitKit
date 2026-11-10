import { useState } from 'react';
import { Terminal, Bot, Cpu, Copy, Check, Sparkles, BookOpen, Layers, RefreshCw, Trash2 } from 'lucide-react';
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
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-godot-400 bg-godot-500/10 border border-godot-500/20 px-3 py-1 rounded-full">
          {t.eyebrow}
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.title}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          {t.sub}
        </p>
      </div>

      {/* Docs Tabs Container */}
      <div className="bg-godot-card border border-godot-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-godot-950/80 border-b border-godot-border" role="tablist">
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
                onPointerDown={() => setActiveTab(tab.id as any)}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer select-none transition ${
                  active
                    ? 'bg-godot-500 text-white shadow-md shadow-godot-500/20 border border-godot-400/50'
                    : 'bg-godot-card/50 text-slate-300 hover:text-white hover:bg-godot-cardHover border border-godot-border/50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 sm:p-8 space-y-8 text-sm">
          {/* TAB 1: CLI Commands */}
          {activeTab === 'cli' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">OrbitKit / DevDock CLI Reference</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  The primary command-line tool for managing Godot 4 projects, AI agent skills, and environment health. Both <code className="text-godot-300 font-mono text-xs">orbitkit</code> and <code className="text-godot-300 font-mono text-xs">devdock</code> binary aliases are supported.
                </p>
              </div>

              {/* Quick Install, Upgrade & Uninstall Grid */}
              <div id="update-cli" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Fresh Install Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-godot-950 via-godot-900 to-godot-950 border border-godot-500/30 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-godot-400" />
                        <span className="font-semibold text-white text-sm">
                          {lang === 'es' ? '1. Instalar por NPM' : '1. Install via NPM'}
                        </span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                          v0.6.0
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('npm install -g @francisiv/orbitkit', 'quick_npm')}
                        className="flex items-center px-2.5 py-1 rounded-lg bg-godot-card border border-godot-border text-xs text-slate-300 hover:text-white transition"
                      >
                        <span className="inline-flex mr-1 shrink-0">
                          {copiedId === 'quick_npm' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span>{copiedId === 'quick_npm' ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy')}</span>
                      </button>
                    </div>
                    <code className="block p-3 rounded-xl bg-black/60 font-mono text-xs sm:text-sm text-godot-300 border border-godot-border/60">
                      npm install -g @francisiv/orbitkit
                    </code>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
                    <span>{lang === 'es' ? '💡 Abre la interfaz:' : '💡 Open TUI:'}</span>
                    <code className="text-slate-300 bg-godot-card px-2 py-0.5 rounded border border-godot-border font-mono text-[11px]">
                      orbitkit
                    </code>
                  </div>
                </div>

                {/* 2. Dedicated Upgrade / Update Existing CLI Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-godot-900 to-godot-950 border border-emerald-500/40 space-y-3 flex flex-col justify-between shadow-lg shadow-emerald-500/5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-white text-sm">
                          {lang === 'es' ? '2. Comprobar y Actualizar' : '2. Check & Upgrade CLI'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('orbitkit upgrade', 'upgrade_npm')}
                        className="flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs transition"
                      >
                        <span className="inline-flex mr-1 shrink-0">
                          {copiedId === 'upgrade_npm' ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span>{copiedId === 'upgrade_npm' ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy')}</span>
                      </button>
                    </div>
                    <code className="block p-3 rounded-xl bg-black/60 font-mono text-xs sm:text-sm text-emerald-300 border border-emerald-500/30">
                      orbitkit upgrade
                    </code>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                    <span>
                      {lang === 'es'
                        ? 'Solo comprobar versión:'
                        : 'Only check version:'}
                    </span>
                    <code className="text-emerald-300 bg-godot-card px-2 py-0.5 rounded border border-godot-border font-mono text-[11px]">
                      orbitkit upgrade --check
                    </code>
                  </div>
                </div>

                {/* 3. Dedicated Uninstall CLI Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/35 via-godot-900 to-godot-950 border border-rose-500/35 space-y-3 flex flex-col justify-between shadow-lg shadow-rose-500/5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <span className="font-semibold text-white text-sm">
                          {lang === 'es' ? '3. Desinstalar CLI' : '3. Uninstall CLI'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('orbitkit uninstall', 'uninstall_cli')}
                        className="flex items-center px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs transition"
                      >
                        <span className="inline-flex mr-1 shrink-0">
                          {copiedId === 'uninstall_cli' ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span>{copiedId === 'uninstall_cli' ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy')}</span>
                      </button>
                    </div>
                    <code className="block p-3 rounded-xl bg-black/60 font-mono text-xs sm:text-sm text-rose-300 border border-rose-500/30">
                      orbitkit uninstall
                    </code>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                    <span>
                      {lang === 'es' ? 'O directo con NPM:' : 'Or directly via NPM:'}
                    </span>
                    <code className="text-rose-300 bg-godot-card px-2 py-0.5 rounded border border-godot-border font-mono text-[11px]">
                      npm uninstall -g @francisiv/orbitkit
                    </code>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    cmd: 'orbitkit gui  (or: orbitkit ui)',
                    desc: 'Launches the interactive Web GUI Dashboard in your default browser (localhost:4567) with visual project explorer, 1-click AI Skills installer, MCP manager, and live diagnostics.'
                  },
                  {
                    cmd: 'orbitkit  (or: orbitkit tui)',
                    desc: 'Launches the minimalist interactive Terminal User Interface (TUI) with automatic version checking, live search (/), and 1-key Skill/MCP installation.'
                  },
                  {
                    cmd: 'orbitkit upgrade [--check]',
                    desc: 'Checks your installed CLI version against NPM & GitHub and automatically upgrades @francisiv/orbitkit globally (pass --check to only compare versions).'
                  },
                  {
                    cmd: 'orbitkit uninstall [--project]',
                    desc: 'Cleanly uninstalls the global @francisiv/orbitkit CLI binary and symlinks from your system (pass --project to also remove .devdock/ from current project).'
                  },
                  {
                    cmd: 'orbitkit scan [directory]',
                    desc: 'Recursively locates all Godot projects (containing project.godot) on your system. Reports installed addons, AI skills, and MCP configuration status.'
                  },
                  {
                    cmd: 'orbitkit update [--all]',
                    desc: 'Checks installed skills and addons against latest catalog versions. Run with "--all" to batch update every Godot project on your PC.'
                  },
                  {
                    cmd: 'orbitkit init',
                    desc: 'Initializes DevDock inside a new or existing Godot project. Creates .devdock/, installs godot4-syntax-guardian skill, and configures godot-lsp MCP.'
                  },
                  {
                    cmd: 'orbitkit skill list',
                    desc: 'Displays the catalog of verified AI Skills tailored specifically for Godot 4.'
                  },
                  {
                    cmd: 'orbitkit skill install <skill-id>',
                    desc: 'Installs or updates an AI Skill directly into .agents/skills/ and .claude/skills/ in your project.'
                  },
                  {
                    cmd: 'orbitkit mcp list',
                    desc: 'Lists available Model Context Protocol servers (godot-engine-bridge, godot-lsp, godot-docs, godot-scene-inspector, godot-gut-runner, ctx7).'
                  },
                  {
                    cmd: 'orbitkit mcp add <server-id>',
                    desc: 'Configures a Model Context Protocol server (e.g. ctx7 or godot-lsp) in the project (.mcp.json).'
                  },
                  {
                    cmd: 'orbitkit doctor',
                    desc: 'Runs full diagnostic self-checks: verifies Godot 4 binary in PATH, tests GDScript LSP port 6005, and validates current project context.'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-godot-950/60 border border-godot-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-godot-300 font-mono text-xs sm:text-sm font-semibold">
                        $ {item.cmd}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.cmd, `cmd_${idx}`)}
                        className="p-1.5 rounded-lg bg-godot-card border border-godot-border text-slate-400 hover:text-white transition"
                      >
                        <span className="inline-flex">
                          {copiedId === `cmd_${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </button>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MCP Configuration */}
          {activeTab === 'mcp' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Model Context Protocol (MCP) Integration</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  How DevDock bridges AI assistants directly to Godot editor internal services.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-godot-950/60 border border-godot-border space-y-3">
                  <div className="flex items-center space-x-2 text-godot-400 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>godot-engine-bridge</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Live editor control bridge: runs game instances, monitors runtime console errors, hot-reloads scripts, and inspects nodes dynamically.
                  </p>
                  <code className="block p-2.5 rounded-lg bg-godot-card border border-godot-border font-mono text-xs text-slate-300">
                    devdock mcp add godot-engine-bridge
                  </code>
                </div>

                <div className="p-5 rounded-xl bg-godot-950/60 border border-godot-border space-y-3">
                  <div className="flex items-center space-x-2 text-godot-400 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>godot-lsp</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connects AI agents to Godot's GDScript LSP on port 6005 for real-time syntax checking, typed parameter suggestions, and signature help.
                  </p>
                  <code className="block p-2.5 rounded-lg bg-godot-card border border-godot-border font-mono text-xs text-slate-300">
                    devdock mcp add godot-lsp
                  </code>
                </div>

                <div className="p-5 rounded-xl bg-godot-950/60 border border-godot-border space-y-3">
                  <div className="flex items-center space-x-2 text-godot-400 font-semibold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>godot-docs</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Zero-latency offline documentation access for all Godot 4 classes, methods, signals, constants, and properties.
                  </p>
                  <code className="block p-2.5 rounded-lg bg-godot-card border border-godot-border font-mono text-xs text-slate-300">
                    devdock mcp add godot-docs
                  </code>
                </div>

                <div className="p-5 rounded-xl bg-godot-950/60 border border-godot-border space-y-3">
                  <div className="flex items-center space-x-2 text-godot-400 font-semibold text-sm">
                    <Layers className="w-4 h-4" />
                    <span>godot-scene-inspector</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Parses .tscn scene hierarchies and .tres resource definitions so agents can navigate node trees without corrupting UID links.
                  </p>
                  <code className="block p-2.5 rounded-lg bg-godot-card border border-godot-border font-mono text-xs text-slate-300">
                    devdock mcp add godot-scene-inspector
                  </code>
                </div>

                <div className="p-5 rounded-xl bg-godot-950/60 border border-godot-border space-y-3">
                  <div className="flex items-center space-x-2 text-godot-400 font-semibold text-sm">
                    <Cpu className="w-4 h-4" />
                    <span>godot-gut-runner</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automates unit test execution using the GUT framework and streams test pass/fail reports directly to your AI assistant.
                  </p>
                  <code className="block p-2.5 rounded-lg bg-godot-card border border-godot-border font-mono text-xs text-slate-300">
                    devdock mcp add godot-gut-runner
                  </code>
                </div>

                <div className="p-5 rounded-xl bg-godot-950/60 border border-godot-border space-y-3 border-emerald-500/30 bg-emerald-950/10">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>ctx7 (Context7 by Upstash)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Injects live, version-locked API docs straight from Context7 into the prompt context to completely eliminate AI hallucinations.
                  </p>
                  <code className="block p-2.5 rounded-lg bg-godot-card border border-godot-border font-mono text-xs text-emerald-300">
                    devdock mcp add ctx7
                  </code>
                </div>
              </div>

              {/* Sample .mcp.json */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Generated Project Configuration: <code className="text-godot-300">.mcp.json</code></span>
                  <button
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
                              'godot-docs': {
                                command: 'npx',
                                args: ['-y', '@devdock/mcp-godot-docs']
                              },
                              'godot-scene-inspector': {
                                command: 'npx',
                                args: ['-y', '@devdock/mcp-godot-project']
                              },
                              'godot-gut-runner': {
                                command: 'npx',
                                args: ['-y', '@devdock/mcp-godot-gut']
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
                    className="flex items-center text-godot-400 hover:text-godot-300 transition"
                  >
                    <span className="inline-flex mr-1 shrink-0">
                      {copiedId === 'mcp_json' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
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
    "godot-docs": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-docs"]
    },
    "godot-scene-inspector": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-project"]
    },
    "godot-gut-runner": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-gut"]
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
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Curated AI Skills for Godot 4</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Skills guide coding agents like Antigravity, Claude Code, and Codex to write idiomatic GDScript 4 code.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'godot4-syntax-guardian',
                    name: 'Godot 4 Syntax Guardian (v1.3.0)',
                    desc: 'Anti-hallucination skill enforcing strict Godot 4.3+ rules: TileMapLayer, FileAccess/DirAccess, Callables signals, CharacterBody move_and_slide.'
                  },
                  {
                    id: 'godot-blender-pipeline',
                    name: 'Blender 3D to Godot 4 Asset Pipeline (v1.1.0)',
                    desc: 'Automates .blend and glTF 2.0 import suffixes (-col, -convcol, -loop), Skeleton3D BoneMap retargeting, and PBR materials.'
                  },
                  {
                    id: 'gdscript-fsm-master',
                    name: 'GDScript Finite State Machine (v1.2.0)',
                    desc: 'Decoupled, modular state machine pattern using dedicated Node/State classes for combat, movement, and enemy AI.'
                  },
                  {
                    id: 'godot-multiplayer-enet',
                    name: 'Godot 4 Multiplayer & Networking (v1.2.0)',
                    desc: 'Authoritative multiplayer architecture using ENetMultiplayerPeer, RPC annotations (@rpc("any_peer", "call_local")), and SceneReplicationConfig.'
                  },
                  {
                    id: 'godot-shader-vfx',
                    name: 'Godot Shading Language (GDShader) VFX (v1.2.0)',
                    desc: 'GLSL shader pipeline for 2D canvas_item and 3D spatial shaders, UV distortion, dissolve effects, and hint_screen_texture filters.'
                  },
                  {
                    id: 'godot-procedural-generation',
                    name: 'Procedural Generation & Pathfinding (v1.1.0)',
                    desc: 'Deterministic generation with FastNoiseLite, dungeon room placement, TileMapLayer autotiling, and AStar2D/AStar3D navigation.'
                  },
                  {
                    id: 'godot-responsive-ui',
                    name: 'Responsive UI & Layouts (v1.1.0)',
                    desc: 'Prevents hardcoded pixel coordinates; enforces BoxContainers, MarginContainers, GridContainers, Anchors, and Theme overrides.'
                  },
                  {
                    id: 'godot-save-system',
                    name: 'Cryptographic Save System (v1.0.0)',
                    desc: 'Anti-corruption and anti-tamper save/load pipelines using JSON/binary serialization and SHA-256 HMAC integrity verification.'
                  },
                  {
                    id: 'ctx7-docs-fetcher',
                    name: 'Context7 (ctx7) Live Docs Fetcher (v1.0.0)',
                    desc: 'Instructs AI coding assistants to fetch fresh, version-specific library docs and syntax examples via Upstash Context7.'
                  }
                ].map((s) => (
                  <div key={s.id} className="p-5 rounded-xl bg-godot-950/60 border border-godot-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center">
                        <Bot className="w-4 h-4 mr-2 text-purple-400" />
                        {s.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(`orbitkit skill install ${s.id}`, s.id)}
                      className="px-3 py-1.5 rounded-lg bg-godot-500/20 hover:bg-godot-500 text-godot-300 hover:text-white border border-godot-500/30 transition text-xs font-mono whitespace-nowrap"
                    >
                      <span>{copiedId === s.id ? (lang === 'es' ? '¡Copiado!' : 'Copied Command!') : `orbitkit skill install ${s.id}`}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Godot Editor Plugin */}
          {activeTab === 'plugin' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">DevDock Godot Editor Plugin</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Manage installed packages, updates and diagnostics without leaving the Godot editor.
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-4 text-slate-300 text-xs sm:text-sm">
                <li className="leading-relaxed">
                  <span className="font-semibold text-white">Addon placement:</span>
                  <p className="ml-6 text-slate-400 mt-1">
                    The addon lives in <code className="bg-godot-950 px-2 py-0.5 rounded text-godot-300 border border-godot-border">res://addons/devdock/</code>.
                  </p>
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold text-white">Enable in Project Settings:</span>
                  <p className="ml-6 text-slate-400 mt-1">
                    In the Godot editor, navigate to <span className="text-white font-medium">Project → Project Settings → Plugins</span> and enable the <strong className="text-white">DevDock</strong> plugin.
                  </p>
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold text-white">Clean uninstallation & Diagnostics:</span>
                  <p className="ml-6 text-slate-400 mt-1">
                    Use the <strong className="text-white">Installed</strong> tab inside Godot to check health or uninstall any package with one click without leaving behind orphaned files.
                  </p>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
