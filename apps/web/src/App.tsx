import { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  Box,
  Bot,
  Code,
  Sparkles,
  Cpu,
  Heart,
  BookOpen,
  FolderTree,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { ResourceSummary, ResourceDetail, CategorySummary } from '@devdock/shared-types';
import { fetchResources, fetchResourceDetail, fetchCategories } from './services/api';
import { getLocalFavorites } from './services/favorites';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { CategoriesView } from './components/CategoriesView';
import { DocumentationView } from './components/DocumentationView';

type TabView = 'explore' | 'categories' | 'favorites' | 'docs';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabView>('explore');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiLive, setIsApiLive] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ResourceDetail | null>(null);
  const [, setFavoritesVersion] = useState(0);

  const loadCatalog = async () => {
    setIsLoading(true);
    const [resResult, catResult] = await Promise.all([
      fetchResources({ search: searchTerm, type: selectedType }),
      fetchCategories()
    ]);
    setResources(resResult.items);
    setCategories(catResult.items);
    setIsApiLive(!resResult.isFallback);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCatalog();
  }, [selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCatalog();
  };

  const handleOpenDetail = async (id: string) => {
    const detail = await fetchResourceDetail(id);
    if (detail) {
      setSelectedDetail(detail);
    }
  };

  const handleSelectCategoryFromGrid = (typeSlug: string) => {
    setSelectedType(typeSlug);
    setCurrentTab('explore');
  };

  const favoritedIds = getLocalFavorites();
  const displayedResources = currentTab === 'favorites'
    ? resources.filter((r) => favoritedIds.includes(r.id))
    : resources;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => setCurrentTab('explore')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
              D
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-sky-400 transition">
                DevDock
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v1.0
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-4 text-sm font-medium text-slate-300">
            <button
              onClick={() => setCurrentTab('explore')}
              className={`flex items-center px-3 py-1.5 rounded-lg transition ${
                currentTab === 'explore'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Box className="w-4 h-4 mr-1.5" />
              Explore
            </button>

            <button
              onClick={() => setCurrentTab('categories')}
              className={`flex items-center px-3 py-1.5 rounded-lg transition ${
                currentTab === 'categories'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FolderTree className="w-4 h-4 mr-1.5" />
              Categories
            </button>

            <button
              onClick={() => setCurrentTab('favorites')}
              className={`flex items-center px-3 py-1.5 rounded-lg transition ${
                currentTab === 'favorites'
                  ? 'bg-slate-800 text-rose-400 font-semibold'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Heart className="w-4 h-4 mr-1.5" />
              Favorites
              {favoritedIds.length > 0 && (
                <span className="ml-1.5 text-xs bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-300">
                  {favoritedIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('docs')}
              className={`flex items-center px-3 py-1.5 rounded-lg transition ${
                currentTab === 'docs'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              Docs
            </button>

            {/* Connection badge */}
            <div
              className={`hidden md:flex items-center text-xs px-2.5 py-1 rounded-full border ${
                isApiLive
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-500/30 text-amber-400'
              }`}
            >
              {isApiLive ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  API Live
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline Mode
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Container View Switcher */}
      <main className="flex-1">
        {currentTab === 'docs' && <DocumentationView />}

        {currentTab === 'categories' && (
          <CategoriesView
            categories={categories}
            onSelectCategory={handleSelectCategoryFromGrid}
          />
        )}

        {(currentTab === 'explore' || currentTab === 'favorites') && (
          <div>
            {/* Hero Banner (only on Explore) */}
            {currentTab === 'explore' && (
              <section className="relative py-16 px-4 text-center overflow-hidden border-b border-slate-900">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950"></div>
                <div className="max-w-4xl mx-auto space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    Everything your game dev environment needs, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-indigo-400">
                      in one single place.
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
                    Centralized discovery, integrity validation, clean installation, and diagnostics for Godot 4 addons and AI skills.
                  </p>

                  <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search dialogue systems, AI skills, shaders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-24 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition shadow-inner text-sm"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-2 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Search
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            {/* Favorites Title Banner */}
            {currentTab === 'favorites' && (
              <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
                    <Heart className="w-6 h-6 fill-rose-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Your Saved Favorites</h1>
                    <p className="text-xs text-slate-400">
                      Saved locally in your browser. No registration required.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Catalog & Filter Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              {currentTab === 'explore' && (
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All Packages', icon: Box },
                      { id: 'godot_addon', label: 'Godot Addons', icon: Cpu },
                      { id: 'ai_skill', label: 'AI Skills', icon: Bot },
                      { id: 'shader_material', label: 'Shaders', icon: Sparkles },
                      { id: 'script_system', label: 'Scripts', icon: Code }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = selectedType === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedType(tab.id)}
                          className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                            active
                              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 mr-1.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={loadCatalog}
                    title="Refresh Catalog"
                    className="flex items-center text-xs text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 border border-slate-800 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              )}

              {/* Resource Grid */}
              {displayedResources.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
                  <p className="text-slate-400 text-sm">
                    {currentTab === 'favorites'
                      ? 'You have not saved any packages to your favorites yet.'
                      : 'No packages found matching your criteria.'}
                  </p>
                  {currentTab === 'favorites' && (
                    <button
                      onClick={() => setCurrentTab('explore')}
                      className="text-xs px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition font-medium"
                    >
                      Browse Catalog
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {displayedResources.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onOpenDetail={handleOpenDetail}
                      onFavoriteChange={() => setFavoritesVersion((v) => v + 1)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedDetail && (
        <ResourceDetailModal
          resource={selectedDetail}
          onClose={() => setSelectedDetail(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DevDock — Open Ecosystem for Game Developers & Godot Engine</span>
          <div className="flex items-center space-x-4 text-emerald-400">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              100% Privacy by Design (No Tracking)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
