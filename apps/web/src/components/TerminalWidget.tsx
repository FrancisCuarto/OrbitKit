import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Language, TRANSLATIONS } from '../content/translations';
import { safeCopyToClipboard } from '../utils/clipboard';

interface Props {
  lang: Language;
}

interface CommandTab {
  id: 'install' | 'gui' | 'upgrade-cli' | 'uninstall-cli' | 'scan' | 'update' | 'mcp' | 'record';
  labelKey: 'tabInstall' | 'tabGui' | 'tabUpgradeCli' | 'tabUninstallCli' | 'tabScan' | 'tabUpdate' | 'tabMcp' | 'tabRecord';
  command: string;
  output: string[];
}

export function TerminalWidget({ lang }: Props) {
  const [activeTab, setActiveTab] = useState<'install' | 'gui' | 'upgrade-cli' | 'uninstall-cli' | 'scan' | 'update' | 'mcp' | 'record'>('install');
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[lang].hero;

  const TABS: CommandTab[] = [
    {
      id: 'install',
      labelKey: 'tabInstall',
      command: 'npm install -g @francisiv/vgskillframe',
      output: [
        '+ @francisiv/vgskillframe@0.7.0',
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
        '🚀 Starting VGSkillFrame GUI Dashboard...',
        '✓ VGSkillFrame GUI Dashboard is live!',
        '  ➜ Local:   http://localhost:4567',
        '  ➜ Target:  /home/francis/game',
        '✓ Connected: Godot Plugin active, 20 AI skills ready'
      ]
    },
    {
      id: 'record',
      labelKey: 'tabRecord',
      command: 'vgskillframe record --last --prompt',
      output: [
        '✈ VGSkillFrame Blackbox Flight Recorder — Incident inc_1794329000',
        '  Status: CRASHED (Exit code 1) | Godot v4.3.stable',
        '  SCRIPT ERROR: Invalid get index \'health\' (on base: \'Nil\').',
        '    at: _on_hit (res://scenes/player/player.gd:42)',
        '✓ Extracted GDScript source context & active scene tree snapshot',
        '✓ Synthesized AI diagnostic prompt ready for Claude Code / Cursor'
      ]
    },
    {
      id: 'upgrade-cli',
      labelKey: 'tabUpgradeCli',
      command: 'vgskillframe upgrade',
      output: [
        '🔍 Checking VGSkillFrame CLI version against NPM & GitHub...',
        '  Installed version: v0.6.4  →  Latest version: v0.7.0',
        '✓ VGSkillFrame actualizado correctamente: v0.6.4 → v0.7.0'
      ]
    },
    {
      id: 'uninstall-cli',
      labelKey: 'tabUninstallCli',
      command: 'vgskillframe uninstall',
      output: [
        '🗑️  Removing global @francisiv/vgskillframe binary and symlinks...',
        '✓ VGSkillFrame CLI (@francisiv/vgskillframe) fue desinstalado globalmente del sistema.'
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
    <div className="w-full bg-godot-950 text-slate-200 border-2 border-ink shadow-[8px_8px_0_0_#15130f] font-mono text-xs sm:text-sm text-left">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-godot-border text-[11px] uppercase tracking-[0.14em] text-slate-500">
        <span className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-godot-400" />
          vgskillframe.tty
        </span>
        <span className="tabular-nums">v0.7.0</span>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-godot-border" role="tablist">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-3.5 py-2.5 text-[11px] uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-godot-500 text-godot-300'
                  : 'border-transparent text-slate-500 hover:text-slate-200'
              }`}
            >
              {t[tab.labelKey]}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 min-h-[260px] space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 overflow-x-auto whitespace-nowrap">
            <span className="text-godot-400 select-none">$ </span>
            <span className="text-slate-100">{currentTabData.command}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 border border-godot-border text-[11px] uppercase tracking-wider text-slate-400 hover:bg-godot-500 hover:text-godot-950 hover:border-godot-500 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? (lang === 'es' ? 'Copiado' : 'Copied') : lang === 'es' ? 'Copiar' : 'Copy'}
          </button>
        </div>

        <div className="space-y-1.5 text-xs text-slate-400">
          {currentTabData.output.map((line, idx) => (
            <div
              key={idx}
              className={line.includes('✓') || line.startsWith('+') ? 'text-[#b5d97a]' : line.includes('ERROR') || line.includes('CRASHED') ? 'text-godot-300' : ''}
            >
              {line}
            </div>
          ))}
          <div className="cursor-block text-slate-500 pt-1">
            <span className="text-godot-400">$</span>
          </div>
        </div>
      </div>
    </div>
  );
}
