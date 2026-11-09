import { CategorySummary } from '../types';
import { Cpu, Bot, Sparkles, Code, ArrowRight } from 'lucide-react';

interface Props {
  categories: CategorySummary[];
  onSelectCategory: (typeSlug: string) => void;
}

export function CategoriesView({ categories, onSelectCategory }: Props) {
  const getIcon = (slug: string) => {
    switch (slug) {
      case 'godot-addons':
        return <Cpu className="w-6 h-6 text-sky-400" />;
      case 'ai-skills':
        return <Bot className="w-6 h-6 text-purple-400" />;
      case 'shaders':
        return <Sparkles className="w-6 h-6 text-pink-400" />;
      default:
        return <Code className="w-6 h-6 text-emerald-400" />;
    }
  };

  const getTargetType = (slug: string): string => {
    switch (slug) {
      case 'godot-addons':
        return 'godot_addon';
      case 'ai-skills':
        return 'ai_skill';
      case 'shaders':
        return 'shader_material';
      case 'scripts':
        return 'script_system';
      default:
        return 'all';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore by Category</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Browse specialized packages, engine extensions, AI assistant protocols, and shaders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const typeSlug = getTargetType(cat.slug);
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(typeSlug)}
              className="p-6 bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl cursor-pointer transition group flex flex-col justify-between shadow-lg hover:shadow-sky-500/10"
            >
              <div>
                <div className="p-3 bg-slate-800 rounded-xl w-fit mb-4 group-hover:scale-105 transition">
                  {getIcon(cat.slug)}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>{cat.resource_count} resource{cat.resource_count !== 1 ? 's' : ''}</span>
                <span className="flex items-center text-sky-400 group-hover:translate-x-1 transition">
                  Explore
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
