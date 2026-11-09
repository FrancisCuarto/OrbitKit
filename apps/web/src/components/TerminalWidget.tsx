import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Language, TRANSLATIONS } from '../content/translations';

interface Props {
  lang: Language;
}

interface CommandTab {
  id: 'install' | 'scan' | 'update' | 'mcp';
  labelKey: 'tabInstall' | 'tabScan' | 'tabUpdate' | 'tabMcp';
  command: string;
  output: string[];
}

export function TerminalWidget({ lang }: Props) {
  const [activeTab, setActiveTab] = useState<'install' | 'scan' | 'update' | 'mcp'>('install');
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[lang].hero;

  const TABS: CommandTab[] = [
    {
      id: 'install',
      labelKey: 'tabInstall',
      command: 'npm install -g @devdock/cli',
      output: [
        '+ @devdock/cli@0.1.0',
        'added 6 packages in 1.4s',
        '✓ devdock command registered globally in PATH'
      ]
    },
    {
      id: 'scan',
      labelKey: 'tabScan',
      command: 'devdock scan .',
      output: [
        '🔍 Scanning for Godot projects...',
        'Found 3 Godot project(s):',
        '  📁 CyberRogue (res://addons: 2, skills: none) → Update available',
        '  📁 NeonPlatformer (res://addons: 1, skills: 2) → Up to date',
        '  📁 SpaceExplorer (res://addons: 0, skills: 1) → Up to date'
      ]
    },
    {
      id: 'update',
      labelKey: 'tabUpdate',
      command: 'devdock update --all',
      output: [
        '🔄 Checking ecosystem versions against catalog...',
        '✓ Updated skill "gdscript-architect" (v1.0.0 → v1.2.0)',
        '✓ Updated skill "godot-shader-expert" (v1.0.0 → v1.1.0)',
        '✓ All 3 Godot projects synchronized with latest standards!'
      ]
    },
    {
      id: 'mcp',
      labelKey: 'tabMcp',
      command: 'devdock mcp add godot-lsp',
      output: [
        '⚙️  Configuring Godot GDScript LSP bridge on port 6005...',
        '✓ Written to .mcp.json',
        '✓ Antigravity, Claude Code & Cursor can now inspect Godot in real time'
      ]
    }
  ];

  const currentTabData = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTabData.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl bg-godot-card border border-godot-border shadow-2xl overflow-hidden font-mono text-xs sm:text-sm text-left">
      {/* Window Titlebar */}
      <div className="flex items-center justify-between px-4 py-3 bg-godot-950/90 border-b border-godot-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="ml-2 text-xs text-slate-400 font-sans font-medium flex items-center">
            <Terminal className="w-3.5 h-3.5 mr-1.5 text-godot-400" />
            terminal — devdock
          </span>
        </div>

        {/* Tab pills */}
        <div className="flex items-center space-x-1">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition ${
                  active
                    ? 'bg-godot-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-godot-border/60'
                }`}
              >
                {t[tab.labelKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="p-4 sm:p-6 bg-godot-950/60 space-y-4">
        {/* Command line */}
        <div className="flex items-center justify-between bg-godot-card/80 p-3 rounded-xl border border-godot-border">
          <div className="flex items-center space-x-2 overflow-x-auto text-slate-200">
            <span className="text-godot-400 font-bold select-none">$</span>
            <span className="font-semibold text-white">{currentTabData.command}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center px-3 py-1.5 ml-2 rounded-lg bg-godot-500/20 hover:bg-godot-500 text-godot-300 hover:text-white border border-godot-500/30 transition text-xs font-sans whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Simulated Command Output */}
        <div className="space-y-1.5 text-xs text-slate-400 pt-1">
          {currentTabData.output.map((line, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-slate-600 select-none">&gt;</span>
              <span className={line.includes('✓') ? 'text-emerald-400 font-medium' : ''}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
