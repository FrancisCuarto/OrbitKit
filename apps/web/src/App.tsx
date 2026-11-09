import { useState } from 'react';
import { Search, ShieldCheck, Box, Bot, Code, Sparkles, Download, ExternalLink, Cpu } from 'lucide-react';

interface MockResource {
  id: string;
  name: string;
  type: string;
  version: string;
  description: string;
  author: string;
  downloads: number;
  tags: string[];
}

const SAMPLE_RESOURCES: MockResource[] = [
  {
    id: 'godot-dialogue-system',
    name: 'Dialogue Flow System',
    type: 'godot_addon',
    version: '1.2.0',
    description: 'Node-based branching dialogue system with localization and character portraits.',
    author: 'DevDock Team',
    downloads: 1420,
    tags: ['dialogue', 'ui', 'narrative']
  },
  {
    id: 'gdscript-expert-skill',
    name: 'GDScript Expert Agent Skill',
    type: 'ai_skill',
    version: '1.0.1',
    description: 'AI agent instructions tailored for Godot 4.x idiomatic GDScript and engine patterns.',
    author: 'AI GameLab',
    downloads: 980,
    tags: ['ai-skill', 'gdscript', 'prompt']
  },
  {
    id: 'retro-crt-shader',
    name: 'PSX CRT Screen Shader',
    type: 'shader_material',
    version: '2.0.0',
    description: 'Realistic cathode-ray tube screen curvature and scanline post-processing shader.',
    author: 'PixelForge',
    downloads: 2150,
    tags: ['shader', 'retro', 'psx']
  },
  {
    id: 'character-controller-3d',
    name: 'Modular 3D Character Controller',
    type: 'script_system',
    version: '1.1.0',
    description: 'First-person and third-person physics-based controller with slope correction.',
    author: 'VoxelCraft',
    downloads: 870,
    tags: ['controller', 'physics', '3d']
  }
];

export function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filtered = SAMPLE_RESOURCES.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'all' || res.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-sky-500/20">
              D
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">DevDock</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v1.0 Plan
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-6 text-sm font-medium text-slate-300">
            <a href="#catalog" className="hover:text-white transition">Explore</a>
            <a href="#plugin" className="hover:text-white transition">Godot Plugin</a>
            <a href="#manifest" className="hover:text-white transition">Manifest Spec</a>
            <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Privacy by Design
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950"></div>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Everything your game dev environment needs, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              in one single place.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Discover, install, diagnose, and manage Godot 4.x addons, reusable shaders, game scripts, and AI skills with zero friction and guaranteed integrity.
          </p>

          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search dialogue systems, AI skills, shaders, character controllers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-wrap gap-2 justify-center pb-8 border-b border-slate-800">
          {[
            { id: 'all', label: 'All Resources', icon: Box },
            { id: 'godot_addon', label: 'Godot Addons', icon: Cpu },
            { id: 'ai_skill', label: 'AI Skills', icon: Bot },
            { id: 'script_system', label: 'Scripts & Systems', icon: Code },
            { id: 'shader_material', label: 'Shaders', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition ${
                  active
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      by <span className="text-slate-300 font-medium">{item.author}</span> • v{item.version}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                    {item.type.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-slate-800/80 text-slate-400 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  {item.downloads} downloads
                </span>

                <button className="flex items-center text-xs font-semibold text-sky-400 hover:text-sky-300 transition bg-sky-950/40 border border-sky-800/50 hover:bg-sky-900/40 px-3 py-1.5 rounded-lg">
                  Install via Plugin
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 bg-slate-950 text-center text-xs text-slate-500">
        <p>DevDock — Open Ecosystem for Game Developers & Godot Engine.</p>
        <p className="mt-1">Free & Open Source under MIT License. No tracking or telemetry.</p>
      </footer>
    </div>
  );
}
export default App;
