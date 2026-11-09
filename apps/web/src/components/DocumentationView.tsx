import { useState } from 'react';
import { Terminal, Shield, Bot, Cpu, Check, Copy } from 'lucide-react';

export function DocumentationView() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'skills' | 'manifest' | 'security'>('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">DevDock Documentation</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Everything you need to know about discovering, installing, configuring, and publishing game dev packages.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {[
          { id: 'quickstart', label: 'Godot Plugin Setup', icon: Cpu },
          { id: 'skills', label: 'AI Skills Guide', icon: Bot },
          { id: 'manifest', label: 'Manifest Specification', icon: Terminal },
          { id: 'security', label: 'Security & Privacy', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        {activeTab === 'quickstart' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Installing DevDock in your Godot 4.x Project</h2>
              <p className="text-slate-400 text-sm mt-1">
                The DevDock editor plugin allows managing addons and AI skills directly from Godot.
              </p>
            </div>

            <ol className="list-decimal list-inside space-y-4 text-slate-300 text-sm">
              <li className="leading-relaxed">
                <span className="font-semibold text-white">Copy the addon folder:</span>
                <p className="ml-6 text-slate-400 mt-1">
                  Place the <code className="bg-slate-800 px-2 py-0.5 rounded text-sky-400">devdock</code> folder into your Godot project's <code className="bg-slate-800 px-2 py-0.5 rounded text-sky-400">res://addons/devdock/</code>.
                </p>
              </li>

              <li className="leading-relaxed">
                <span className="font-semibold text-white">Enable the plugin:</span>
                <p className="ml-6 text-slate-400 mt-1">
                  In Godot, go to <span className="text-white font-medium">Project → Project Settings → Plugins</span> and check the box next to <strong className="text-white">DevDock</strong>.
                </p>
              </li>

              <li className="leading-relaxed">
                <span className="font-semibold text-white">Open the DevDock Dock:</span>
                <p className="ml-6 text-slate-400 mt-1">
                  You will now see a new tab titled <strong className="text-white">DevDock</strong> on the right panel. From there, search and install packages with one click.
                </p>
              </li>
            </ol>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">AI Skills Integration</h2>
              <p className="text-slate-400 text-sm mt-1">
                AI Skills are specialized prompt protocols and documentation that teach AI agents (Antigravity, Claude Code, Codex) how to design Godot games effectively.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2 text-sm text-slate-300">
              <div className="font-semibold text-purple-400 flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                Where are skills installed?
              </div>
              <p className="text-xs text-slate-400">
                Skills install automatically into <code className="text-sky-300 bg-slate-900 px-1.5 py-0.5 rounded">.agents/skills/&lt;skill-name&gt;/</code> in your project root, where compatible AI agents detect and load them.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'manifest' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Resource Manifest Template</h2>
              <p className="text-slate-400 text-sm mt-1">
                Every resource distributed through DevDock requires a validated manifest.
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      {
                        id: 'my-dialogue-system',
                        name: 'My Dialogue System',
                        version: '1.0.0',
                        type: 'godot_addon',
                        description: 'Custom narrative dialogue engine for Godot 4.',
                        author: 'DevName',
                        license: 'MIT',
                        compatibility: { godot: ['4.3', '4.4'] },
                        source: {
                          provider: 'github',
                          repository: 'devname/dialogue-system',
                          release: 'v1.0.0'
                        },
                        installation: {
                          method: 'archive',
                          destination: 'res://addons/my_dialogue_system'
                        },
                        integrity: {
                          algorithm: 'sha256',
                          checksum: '0000000000000000000000000000000000000000000000000000000000000000'
                        },
                        health_check: {
                          type: 'file_validation',
                          required_files: ['plugin.cfg']
                        }
                      },
                      null,
                      2
                    ),
                    'manifest_code'
                  )
                }
                className="absolute right-3 top-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center"
              >
                {copiedCode === 'manifest_code' ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </>
                )}
              </button>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-sky-300 overflow-x-auto">
{`{
  "id": "my-dialogue-system",
  "name": "My Dialogue System",
  "version": "1.0.0",
  "type": "godot_addon",
  "description": "Custom narrative dialogue engine for Godot 4.",
  "author": "DevName",
  "license": "MIT",
  "compatibility": {
    "godot": ["4.3", "4.4"]
  },
  "source": {
    "provider": "github",
    "repository": "devname/dialogue-system",
    "release": "v1.0.0"
  },
  "installation": {
    "method": "archive",
    "destination": "res://addons/my_dialogue_system"
  },
  "integrity": {
    "algorithm": "sha256",
    "checksum": "YOUR_SHA256_HASH_HERE"
  },
  "health_check": {
    "type": "file_validation",
    "required_files": ["plugin.cfg"]
  }
}`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Security & Privacy by Design</h2>
              <p className="text-slate-400 text-sm mt-1">
                How DevDock protects your local workstation and development projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <span className="font-semibold text-emerald-400 text-sm">Anti-ZipSlip Protection</span>
                <p className="text-slate-400 leading-relaxed">
                  Every file inside an archive is checked before extraction. If an archive attempts to escape the designated folder using relative paths (`../`), extraction aborts immediately.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <span className="font-semibold text-emerald-400 text-sm">Strict Destination Guardrails</span>
                <p className="text-slate-400 leading-relaxed">
                  Packages can only install into authorized project directories (`res://addons/`, `res://scripts/`, `.agents/skills/`). System directories are strictly prohibited.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <span className="font-semibold text-emerald-400 text-sm">Zero Personal Telemetry</span>
                <p className="text-slate-400 leading-relaxed">
                  DevDock never reads your private scripts, scene files, commit messages, or prompts. No tracking pixels or advertising libraries are loaded.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <span className="font-semibold text-emerald-400 text-sm">SHA-256 Checksums</span>
                <p className="text-slate-400 leading-relaxed">
                  Downloads are matched byte-for-byte against cryptographic signatures before unpacking to ensure no man-in-the-middle tampering.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
