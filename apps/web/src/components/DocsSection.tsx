import { useState } from 'react';
import { Terminal, Bot, Cpu, Copy, Check, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Language, TRANSLATIONS } from '../content/translations';

interface Props {
  lang: Language;
}

export function DocsSection({ lang }: Props) {
  const [activeTab, setActiveTab] = useState<'cli' | 'mcp' | 'skills' | 'plugin'>('cli');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const t = TRANSLATIONS[lang].docs;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
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
        <div className="flex flex-wrap items-center gap-2 p-3 bg-godot-950/80 border-b border-godot-border">
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
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                  active
                    ? 'bg-godot-500 text-white shadow-md shadow-godot-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-godot-cardHover border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
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
                <h3 className="text-xl font-bold text-white">DevDock CLI Reference</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  The primary tool for managing Godot projects, AI agent skills, and environment health.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    cmd: 'devdock scan [directory]',
                    desc: 'Recursively locates all Godot projects (containing project.godot) on your system. Reports installed addons, AI skills, and MCP configuration status.'
                  },
                  {
                    cmd: 'devdock update [--all]',
                    desc: 'Checks installed skills and addons against latest catalog versions. Run with "--all" to batch update every Godot project on your PC.'
                  },
                  {
                    cmd: 'devdock init',
                    desc: 'Initializes DevDock inside a new or existing Godot project. Creates .devdock/, installs gdscript-architect skill, and configures godot-lsp MCP.'
                  },
                  {
                    cmd: 'devdock skill list',
                    desc: 'Displays the catalog of verified AI Skills tailored specifically for Godot 4.'
                  },
                  {
                    cmd: 'devdock skill install <skill-id>',
                    desc: 'Installs or updates an AI Skill directly into .agents/skills/ and .claude/skills/ in your project.'
                  },
                  {
                    cmd: 'devdock mcp add <server-id>',
                    desc: 'Configures a Model Context Protocol server (e.g. godot-lsp or godot-docs) in the project (.mcp.json).'
                  },
                  {
                    cmd: 'devdock doctor',
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
                        onClick={() => handleCopy(item.cmd, `cmd_${idx}`)}
                        className="p-1.5 rounded-lg bg-godot-card border border-godot-border text-slate-400 hover:text-white transition"
                      >
                        {copiedId === `cmd_${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-godot-950/60 border border-godot-border space-y-3">
                  <div className="flex items-center space-x-2 text-godot-400 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>godot-lsp MCP Server</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connects your AI agent to Godot's native GDScript Language Server running on port 6005. The agent gets real-time compilation errors, method signatures, and auto-completions as it writes code.
                  </p>
                  <code className="block p-2.5 rounded-lg bg-godot-card border border-godot-border font-mono text-xs text-slate-300">
                    devdock mcp add godot-lsp
                  </code>
                </div>

                <div className="p-5 rounded-xl bg-godot-950/60 border border-godot-border space-y-3">
                  <div className="flex items-center space-x-2 text-godot-400 font-semibold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>godot-docs MCP Server</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Provides instantaneous offline access to the complete Godot 4 class library documentation, including node inheritance trees, methods, signals, and properties.
                  </p>
                  <code className="block p-2.5 rounded-lg bg-godot-card border border-godot-border font-mono text-xs text-slate-300">
                    devdock mcp add godot-docs
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
                              'godot-lsp': {
                                command: 'npx',
                                args: ['-y', '@devdock/mcp-godot-lsp'],
                                env: { GODOT_LSP_PORT: '6005' }
                              },
                              'godot-docs': {
                                command: 'npx',
                                args: ['-y', '@devdock/mcp-godot-docs']
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
                    {copiedId === 'mcp_json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy JSON
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-godot-950 font-mono text-xs text-slate-300 border border-godot-border overflow-x-auto">
{`{
  "mcpServers": {
    "godot-lsp": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-lsp"],
      "env": {
        "GODOT_LSP_PORT": "6005"
      }
    },
    "godot-docs": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-docs"]
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
                    id: 'gdscript-architect',
                    name: 'GDScript 4 Architect Skill (v1.2.0)',
                    desc: 'Enforces strict static typing, custom typed signals, @export and @onready conventions, and node composition over deep inheritance.'
                  },
                  {
                    id: 'godot-shader-expert',
                    name: 'Godot Shading Language Expert (v1.1.0)',
                    desc: 'Optimized GLSL guidelines for 2D canvas_item and 3D spatial shaders, UV mathematics, and post-processing.'
                  },
                  {
                    id: 'godot-ui-master',
                    name: 'Responsive UI Master (v1.0.0)',
                    desc: 'Prevents manual pixel coordinate positioning; guides layout design using Margin, VBox, HBox, Grid containers and theme overrides.'
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
                      onClick={() => handleCopy(`devdock skill install ${s.id}`, s.id)}
                      className="px-3 py-1.5 rounded-lg bg-godot-500/20 hover:bg-godot-500 text-godot-300 hover:text-white border border-godot-500/30 transition text-xs font-mono whitespace-nowrap"
                    >
                      {copiedId === s.id ? 'Copied Command!' : `devdock skill install ${s.id}`}
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
