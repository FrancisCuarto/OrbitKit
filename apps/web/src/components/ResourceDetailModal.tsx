import { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Bot,
  Sparkles,
  Code,
  FolderDown,
  Layers,
  Heart
} from 'lucide-react';
import { ResourceDetail } from '@devdock/shared-types';
import { isLocalFavorite, toggleLocalFavorite } from '../services/favorites';

interface Props {
  resource: ResourceDetail;
  onClose: () => void;
}

export function ResourceDetailModal({ resource, onClose }: Props) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(resource.latest_version);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isLocalFavorite(resource.id));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resource.id, onClose]);

  const handleCopyHash = () => {
    const checksum = resource.manifest.integrity?.checksum;
    if (checksum) {
      navigator.clipboard.writeText(checksum);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyCommand = () => {
    const cmd = `devdock install ${resource.id}@${selectedVersion}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleToggleFav = () => {
    const newState = toggleLocalFavorite(resource.id);
    setIsFav(newState);
  };

  const getTypeIcon = () => {
    switch (resource.type) {
      case 'godot_addon':
        return <Cpu className="w-5 h-5 text-sky-400" />;
      case 'ai_skill':
        return <Bot className="w-5 h-5 text-purple-400" />;
      case 'shader_material':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      default:
        return <Code className="w-5 h-5 text-emerald-400" />;
    }
  };

  const godotVersions = resource.manifest.compatibility?.godot || [];
  const aiAgents = resource.manifest.compatibility?.ai_agents || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
              {getTypeIcon()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">{resource.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  v{selectedVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Created by <span className="text-slate-200 font-medium">{resource.author}</span> • License: {resource.license}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleFav}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-2 rounded-xl border transition ${
                isFav
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Overview
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{resource.description}</p>
          </div>

          {/* Quick Install Banner */}
          <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                Install via DevDock CLI / Plugin
              </div>
              <div className="text-xs font-mono text-slate-300 mt-1">
                devdock install {resource.id}@{selectedVersion}
              </div>
            </div>
            <button
              onClick={handleCopyCommand}
              className="flex items-center text-xs font-medium px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition shadow-sm"
            >
              {copiedCommand ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Copied Command!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Command
                </>
              )}
            </button>
          </div>

          {/* Compatibility & Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                <Layers className="w-4 h-4 mr-1.5 text-sky-400" />
                Compatibility
              </div>
              {godotVersions.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-slate-400">Godot Engine: </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {godotVersions.map((v) => (
                      <span
                        key={v}
                        className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono"
                      >
                        Godot {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {aiAgents.length > 0 && (
                <div>
                  <span className="text-xs text-slate-400">Compatible AI Agents: </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {aiAgents.map((agent) => (
                      <span
                        key={agent}
                        className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                <FolderDown className="w-4 h-4 mr-1.5 text-emerald-400" />
                Installation Target
              </div>
              <div className="text-xs text-slate-300 font-mono bg-slate-900 px-3 py-2 rounded-lg border border-slate-700/60 truncate">
                {resource.manifest.installation.destination}
              </div>
              {resource.manifest.health_check && (
                <div className="mt-2 text-xs text-slate-400">
                  Required checks:{' '}
                  <span className="text-slate-300 font-mono">
                    {resource.manifest.health_check.required_files?.join(', ') || 'Standard validation'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Security & Integrity Inspection */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Cryptographic Integrity Verification
              </div>
              <span className="text-xs font-mono text-slate-400 uppercase">
                {resource.manifest.integrity?.algorithm || 'sha256'}
              </span>
            </div>

            {resource.manifest.integrity?.checksum ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                <span className="truncate mr-3 select-all">{resource.manifest.integrity.checksum}</span>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center text-xs text-sky-400 hover:text-sky-300 transition whitespace-nowrap"
                >
                  {copiedHash ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Verified through repository source release.</p>
            )}
          </div>

          {/* Source Link & Versions */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span>Versions:</span>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
              >
                {resource.versions.map((ver) => (
                  <option key={ver} value={ver}>
                    v{ver} {ver === resource.latest_version ? '(latest)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {resource.manifest.source?.repository && (
              <a
                href={`https://github.com/${resource.manifest.source.repository}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-sky-400 hover:text-sky-300 transition mt-2 sm:mt-0"
              >
                View GitHub Repository
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
