import { useState, useEffect } from 'react';
import { Download, Heart, Eye, Cpu, Bot, Sparkles, Code } from 'lucide-react';
import { ResourceSummary } from '../types';
import { isLocalFavorite, toggleLocalFavorite } from '../services/favorites';

interface Props {
  resource: ResourceSummary;
  onOpenDetail: (id: string) => void;
  onFavoriteChange?: () => void;
}

export function ResourceCard({ resource, onOpenDetail, onFavoriteChange }: Props) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isLocalFavorite(resource.id));
  }, [resource.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleLocalFavorite(resource.id);
    setIsFav(newState);
    if (onFavoriteChange) onFavoriteChange();
  };

  const getTypeBadge = () => {
    switch (resource.type) {
      case 'godot_addon':
        return (
          <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Cpu className="w-3 h-3 mr-1" />
            Addon
          </span>
        );
      case 'ai_skill':
        return (
          <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bot className="w-3 h-3 mr-1" />
            AI Skill
          </span>
        );
      case 'shader_material':
        return (
          <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Shader
          </span>
        );
      default:
        return (
          <span className="flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code className="w-3 h-3 mr-1" />
            Script
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onOpenDetail(resource.id)}
      className="p-6 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition cursor-pointer group flex flex-col justify-between shadow-md hover:shadow-xl hover:shadow-sky-500/5"
    >
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition">
                {resource.name}
              </h3>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                v{resource.latest_version}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              by <span className="text-slate-300 font-medium">{resource.author}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {getTypeBadge()}
            <button
              onClick={handleToggle}
              title={isFav ? 'Remove favorite' : 'Save favorite'}
              className={`p-1.5 rounded-lg border transition ${
                isFav
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-300 mt-4 leading-relaxed line-clamp-3">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-slate-800/60 text-slate-400 rounded-md font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-xs text-slate-400 flex items-center">
          <Download className="w-3.5 h-3.5 mr-1" />
          {resource.downloads_count} downloads
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(resource.id);
          }}
          className="flex items-center text-xs font-medium text-sky-400 hover:text-sky-300 transition bg-sky-950/40 border border-sky-800/50 hover:bg-sky-900/40 px-3 py-1.5 rounded-lg"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Details & Manifest
        </button>
      </div>
    </div>
  );
}
