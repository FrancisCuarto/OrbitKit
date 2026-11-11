import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Language, TRANSLATIONS } from '../content/translations';
import { safeCopyToClipboard } from '../utils/clipboard';

interface Props {
  lang: Language;
}

interface CommandTab {
  id: 'install' | 'gui' | 'upgrade-cli' | 'uninstall-cli' | 'scan' | 'update' | 'mcp';
  labelKey: 'tabInstall' | 'tabGui' | 'tabUpgradeCli' | 'tabUninstallCli' | 'tabScan' | 'tabUpdate' | 'tabMcp';
  command: string;
  output: string[];
}

export function TerminalWidget({ lang }: Props) {
  const [activeTab, setActiveTab] = useState<'install' | 'gui' | 'upgrade-cli' | 'uninstall-cli' | 'scan' | 'update' | 'mcp'>('install');
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[lang].hero;

  const TABS: CommandTab[] = [
    {
      id: 'install',
      labelKey: 'tabInstall',
      command: 'npm install -g @francisiv/vgskillframe',
      output: [
        '+ @francisiv/vgskillframe@0.6.4',
        'added 6 packages in 1.1s',
        '✓ vgskillframe, vgskill, and orbitkit commands registered globally in PATH',
        '✓ Godot Editor Plugin auto-configured (addons/vgskillframe)',
        '✓ Run "vgskillframe ui" to open the interactive web dashboard',
        '✓ Run "vgskillframe" in your terminal to open the TUI navigator'
      ]
    },
    {
      id: 'gui',
      labelKey: 'tabGui',
      command: 'vgskillframe ui',
      output: [
        '🚀 Starting VGskillframe GUI Dashboard...',
        '✓ VGskillframe GUI Dashboard is live!',
        '  ➜ Local:   http://localhost:4567',
        '  ➜ Target:  /home/francis/game',
        '✓ Connected: Godot Plugin active, 10 AI skills ready'
      ]
    },
    {
      id: 'upgrade-cli',
      labelKey: 'tabUpgradeCli',
      command: 'vgskillframe upgrade',
      output: [
        '🔍 Checking VGskillframe CLI version against NPM & GitHub...',
        '  Installed version: v0.6.3  →  Latest version: v0.6.4',
        '✓ VGskillframe actualizado correctamente: v0.6.3 → v0.6.4'
      ]
    },
    {
      id: 'uninstall-cli',
      labelKey: 'tabUninstallCli',
      command: 'vgskillframe uninstall',
      output: [
        '🗑️  Removing global @francisiv/vgskillframe binary and symlinks...',
        '✓ VGskillframe CLI (@francisiv/vgskillframe) fue desinstalado globalmente del sistema.'
      ]
    },
    {
      id: 'scan',
      labelKey: 'tabScan',
      command: 'vgskillframe scan .',
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
      command: 'vgskillframe update --all',
      output: [
        '🔄 Checking ecosystem versions against catalog...',
        '✓ Updated skill "gdscript-architect" (v1.0.0 → v1.2.0)',
        '✓ Updated skill "godot-blender-pipeline" (v1.2.0)',
        '✓ All 3 Godot projects synchronized with latest standards!'
      ]
    },
    {
      id: 'mcp',
      labelKey: 'tabMcp',
      command: 'vgskillframe mcp add godot-docs-ctx7',
      output: [
        '⚙️  Configuring Godot 4 Context7 (ctx7) & GDScript LSP bridge...',
        '✓ Written to .mcp.json',
        '✓ Antigravity, Claude Code & Cursor can now inspect Godot in real time'
      ]
    }
  ];

  const currentTabData = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handleCopy = () => {
    void safeCopyToClipboard(currentTabData.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-30 pointer-events-auto w-full max-w-3xl mx-auto rounded-2xl bg-godot-card border border-godot-border shadow-2xl overflow-hidden font-mono text-xs sm:text-sm text-left">
      {/* Window Titlebar & Large-Hitbox Tab Bar */}
      <div className="relative z-30 px-4 pt-3.5 pb-3 bg-godot-950 border-b border-godot-border space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="ml-2 text-xs text-slate-400 font-sans font-medium flex items-center">
            <Terminal className="w-3.5 h-3.5 mr-1.5 text-godot-400" />
            terminal — vgskillframe v0.6.4
          </span>
        </div>

        {/* Expanded Hitbox Tab Pills */}
        <div className="relative z-30 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2" role="tablist">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setActiveTab(tab.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(tab.id);
                }}
                className={`relative z-30 pointer-events-auto w-full min-h-[46px] px-3 py-2.5 rounded-xl text-xs font-sans font-semibold cursor-pointer select-none flex items-center justify-center text-center transition-colors duration-150 ${
                  active
                    ? 'bg-godot-500 text-white shadow-md shadow-godot-500/25 border border-godot-400'
                    : 'bg-godot-card text-slate-200 hover:text-white hover:bg-godot-border border border-godot-border'
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
        <div className="flex items-center justify-between bg-godot-card/80 p-3.5 rounded-xl border border-godot-border">
          <div className="flex items-center space-x-2 overflow-x-auto text-slate-200">
            <span className="text-godot-400 font-bold select-none">$</span>
            <span className="font-semibold text-white">{currentTabData.command}</span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center px-4 py-2 ml-3 rounded-xl bg-godot-500/20 hover:bg-godot-500 text-godot-300 hover:text-white border border-godot-500/30 transition text-xs font-sans font-semibold cursor-pointer select-none whitespace-nowrap"
          >
            <span className="inline-flex mr-1.5 shrink-0">
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </span>
            <span>{copied ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy')}</span>
          </button>
        </div>

        {/* Simulated Command Output */}
        <div className="space-y-1.5 text-xs text-slate-400 pt-1">
          {currentTabData.output.map((line, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-slate-600 select-none">&gt;</span>
              <span className={line.includes('✓') || line.startsWith('+') ? 'text-emerald-400 font-medium' : ''}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
