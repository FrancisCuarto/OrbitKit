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
              <h3 className="text-2xl font-bold text-white">OrbitKit / DevDock CLI Reference</h3>
              <p className="text-slate-300 text-sm leading-relaxed [text-wrap:pretty]">
                The primary command-line tool for managing Godot 4 projects, AI agent skills, and environment health. Both <code className="text-godot-300 font-mono text-xs">orbitkit</code> and <code className="text-godot-300 font-mono text-xs">devdock</code> binary aliases are supported.
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
                      v0.6.4
                    </span>
                  </div>
                  <code className="block p-3 rounded-lg bg-godot-950 font-mono text-xs sm:text-sm text-godot-300 border border-godot-border">
                    npm install -g @francisiv/orbitkit
                  </code>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">{lang === 'es' ? 'Abre la interfaz:' : 'Open TUI:'} <code className="text-slate-200 font-mono">orbitkit</code></span>
                  <button
                    type="button"
                    onClick={() => handleCopy('npm install -g @francisiv/orbitkit', 'quick_npm')}
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
                    orbitkit upgrade
                  </code>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">{lang === 'es' ? 'Solo verificar:' : 'Check only:'} <code className="text-slate-200 font-mono">--check</code></span>
                  <button
                    type="button"
                    onClick={() => handleCopy('orbitkit upgrade', 'upgrade_npm')}
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
                    orbitkit uninstall
                  </code>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">{lang === 'es' ? 'Limpia symlinks globales' : 'Cleans global symlinks'}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('orbitkit uninstall', 'uninstall_cli')}
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
                    cmd: 'orbitkit gui',
                    desc: 'Launches the interactive Web GUI Dashboard (localhost:4567) with visual project explorer, 1-click AI Skills installer, MCP manager, and live diagnostics.'
                  },
                  {
                    cmd: 'orbitkit',
                    desc: 'Launches the interactive Terminal User Interface (TUI) with automatic version checking, live search, and 1-key Skill/MCP installation.'
                  },
                  {
                    cmd: 'orbitkit upgrade [--check]',
                    desc: 'Checks your installed CLI version against NPM & GitHub and automatically upgrades @francisiv/orbitkit globally.'
                  },
                  {
                    cmd: 'orbitkit uninstall [--project]',
                    desc: 'Cleanly uninstalls the global @francisiv/orbitkit CLI binary and symlinks from your system.'
                  },
                  {
                    cmd: 'orbitkit scan [directory]',
                    desc: 'Recursively locates all Godot projects on your system. Reports installed addons, AI skills, and MCP configuration status.'
                  },
                  {
                    cmd: 'orbitkit check [--json]',
                    desc: 'Queries the versioned remote catalog to detect newly published AI skills, outdated project skills, and CLI updates.'
                  },
                  {
                    cmd: 'orbitkit update [--all]',
                    desc: 'Safely applies skill and MCP updates with SHA-256 checksum verification and atomic extraction.'
                  },
                  {
                    cmd: 'orbitkit init',
                    desc: 'Initializes OrbitKit in the current Godot project. Installs addons/orbitkit and configures .mcp.json.'
                  },
                  {
                    cmd: 'orbitkit skill list',
                    desc: 'Displays the catalog of verified AI Skills tailored specifically for Godot 4 and Blender 3D.'
                  },
                  {
                    cmd: 'orbitkit skill install <skill-id>',
                    desc: 'Installs or updates an AI Skill directly into .agents/skills/ and .claude/skills/ in your project.'
                  },
                  {
                    cmd: 'orbitkit mcp add <server-id>',
                    desc: 'Configures a Model Context Protocol server (e.g. ctx7 or godot-lsp) in .mcp.json.'
                  },
                  {
                    cmd: 'orbitkit doctor',
                    desc: 'Runs full diagnostic self-checks: verifies Godot 4 binary in PATH, tests GDScript LSP port 6005, and validates current project context.'
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
                How OrbitKit bridges AI assistants directly to Godot editor internal services and live documentation.
              </p>
            </div>

            <div className="rounded-xl bg-godot-card border border-godot-border overflow-hidden divide-y divide-godot-border/60">
              {[
                {
                  id: 'godot-engine-bridge',
                  name: 'godot-engine-bridge',
                  desc: 'Live editor control bridge: runs game instances, monitors runtime console errors, hot-reloads scripts, and inspects nodes dynamically.',
                  cmd: 'orbitkit mcp add godot-engine-bridge'
                },
                {
                  id: 'godot-lsp',
                  name: 'godot-lsp',
                  desc: "Connects AI agents to Godot's GDScript LSP on port 6005 for real-time syntax checking, typed parameter suggestions, and signature help.",
                  cmd: 'orbitkit mcp add godot-lsp'
                },
                {
                  id: 'ctx7',
                  name: 'ctx7 (Context7 by Upstash)',
                  desc: 'Injects live, version-locked API docs straight from Context7 into the prompt context to completely eliminate AI hallucinations.',
                  cmd: 'orbitkit mcp add ctx7'
                },
                {
                  id: 'godot-docs',
                  name: 'godot-docs',
                  desc: 'Zero-latency offline documentation access for all Godot 4 classes, methods, signals, constants, and properties.',
                  cmd: 'orbitkit mcp add godot-docs'
                },
                {
                  id: 'godot-scene-inspector',
                  name: 'godot-scene-inspector',
                  desc: 'Parses .tscn scene hierarchies and .tres resource definitions so agents can navigate node trees without corrupting UID links.',
                  cmd: 'orbitkit mcp add godot-scene-inspector'
                },
                {
                  id: 'godot-gut-runner',
                  name: 'godot-gut-runner',
                  desc: 'Automates unit test execution using the GUT framework and streams test pass/fail reports directly to your AI assistant.',
                  cmd: 'orbitkit mcp add godot-gut-runner'
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
              <h3 className="text-2xl font-bold text-white">Curated AI Skills for Godot 4</h3>
              <p className="text-slate-300 text-sm leading-relaxed [text-wrap:pretty]">
                Skills guide coding agents like Antigravity, Claude Code, and Codex to write idiomatic GDScript 4 code.
              </p>
            </div>

            <div className="rounded-xl bg-godot-card border border-godot-border overflow-hidden divide-y divide-godot-border/60">
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
                <div key={s.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-bold text-white flex items-center">
                      <Bot className="w-4 h-4 mr-2 text-purple-400" />
                      {s.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed [text-wrap:pretty]">{s.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(`orbitkit skill install ${s.id}`, s.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#23689b] hover:bg-[#2d7bb6] text-white transition text-xs font-mono whitespace-nowrap shrink-0 border border-godot-400/30"
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
          <div className="space-y-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">OrbitKit Godot Editor Plugin</h3>
              <p className="text-slate-300 text-sm leading-relaxed [text-wrap:pretty]">
                Manage installed packages, updates and diagnostics without leaving the Godot editor.
              </p>
            </div>

            <div className="rounded-xl bg-godot-card border border-godot-border p-6 sm:p-8 space-y-6">
              <ol className="list-decimal list-inside space-y-5 text-slate-300 text-sm">
                <li className="leading-relaxed">
                  <span className="font-semibold text-white">Plugin placement:</span>
                  <p className="ml-6 text-slate-300 mt-1">
                    The plugin is auto-installed by the CLI into <code className="bg-godot-950 px-2 py-0.5 rounded text-godot-300 border border-godot-border font-mono text-xs">res://addons/orbitkit/</code>.
                  </p>
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold text-white">Enabled in Project Settings:</span>
                  <p className="ml-6 text-slate-300 mt-1">
                    In the Godot editor, navigate to <span className="text-white font-medium">Project → Project Settings → Plugins</span> and ensure <strong className="text-white">OrbitKit</strong> is enabled.
                  </p>
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold text-white">Clean uninstallation & Diagnostics:</span>
                  <p className="ml-6 text-slate-300 mt-1">
                    Use the <strong className="text-white">Installed</strong> tab inside Godot or run <code className="bg-godot-950 px-2 py-0.5 rounded text-godot-300 border border-godot-border font-mono text-xs">orbitkit doctor</code> to verify health anytime.
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
