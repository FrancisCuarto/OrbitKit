import { useState } from 'react';
import {
  ShieldCheck,
  Terminal,
  Layers,
  Bot,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  FolderSearch,
  Stethoscope
} from 'lucide-react';
import { Language, TRANSLATIONS } from './content/translations';
import { TerminalWidget } from './components/TerminalWidget';
import { DocsSection } from './components/DocsSection';

export function App() {
  const [lang, setLang] = useState<Language>('es');
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen flex flex-col bg-godot-950 text-slate-100 font-sans selection:bg-godot-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="border-b border-godot-border/80 bg-godot-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-godot-500 flex items-center justify-center shadow-lg shadow-godot-500/25 group-hover:scale-105 transition">
              {/* Godot Robot Icon SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9 8C9.55 8 10 8.45 10 9C10 9.55 9.55 10 9 10C8.45 10 8 9.55 8 9C8 8.45 8.45 8 9 8ZM15 8C15.55 8 16 8.45 16 9C16 9.55 15.55 10 15 10C14.45 10 14 9.55 14 9C14 8.45 14.45 8 15 8ZM12 18C9.33 18 7.18 16.11 6.64 14H17.36C16.82 16.11 14.67 18 12 18Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-godot-400 transition">
                  DevDock
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-godot-500/20 text-godot-300 border border-godot-500/30">
                  CLI v0.1.0
                </span>
              </div>
            </div>
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">{t.nav.features}</a>
            <a href="#how-it-works" className="hover:text-white transition">{t.nav.howItWorks}</a>
            <a href="#docs" className="hover:text-white transition">{t.nav.docs}</a>
            <a href="#docs" className="hover:text-white transition">{t.nav.mcp}</a>
            <a href="#docs" className="hover:text-white transition">{t.nav.skills}</a>
            <a
              href="https://github.com/FrancisCuarto/OrbitKit"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white flex items-center transition"
            >
              {t.nav.github}
              <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </a>
          </nav>

          {/* Action buttons + Language Selector */}
          <div className="flex items-center space-x-3">
            {/* Language toggle ES / EN */}
            <div className="flex items-center bg-godot-card border border-godot-border rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLang('es')}
                className={`px-2 py-1 rounded transition ${
                  lang === 'es' ? 'bg-godot-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded transition ${
                  lang === 'en' ? 'bg-godot-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <a
              href="#docs"
              className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-xl bg-godot-500 hover:bg-godot-400 text-white transition shadow-lg shadow-godot-500/20"
            >
              <Terminal className="w-3.5 h-3.5 mr-1.5" />
              {t.nav.install}
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-16 px-4 text-center overflow-hidden">
        {/* Godot Blue Radial Glow Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-godot-600/20 via-godot-950 to-godot-950"></div>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-godot-500/10 border border-godot-500/30 text-godot-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-godot-400 animate-pulse"></span>
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            {t.hero.headline1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-godot-300 via-godot-400 to-sky-300">
              {t.hero.headline2}
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero.sub}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#docs"
              className="px-6 py-3 rounded-xl bg-godot-500 hover:bg-godot-400 text-white font-semibold text-sm transition shadow-lg shadow-godot-500/25 flex items-center"
            >
              {t.hero.btnDocs}
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a
              href="https://github.com/FrancisCuarto/OrbitKit"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-godot-card hover:bg-godot-cardHover text-slate-200 border border-godot-border font-semibold text-sm transition flex items-center"
            >
              {t.hero.btnGithub}
              <ExternalLink className="w-4 h-4 ml-2 text-slate-400" />
            </a>
          </div>

          {/* Interactive Terminal Widget */}
          <div className="pt-8">
            <TerminalWidget lang={lang} />
          </div>
        </div>
      </section>

      {/* 3. The Problem & Solution Section (Engram Style) */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-godot-400 bg-godot-500/10 border border-godot-500/20 px-3 py-1 rounded-full">
            {t.problem.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.problem.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="p-6 sm:p-8 rounded-2xl bg-godot-card/60 border border-rose-900/40 space-y-6">
            <div className="flex items-center space-x-3 text-rose-400 font-bold text-lg">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <XCircle className="w-6 h-6 text-rose-400" />
              </div>
              <span>{t.problem.beforeTitle}</span>
            </div>

            <ul className="space-y-4 text-sm text-slate-400">
              {[t.problem.before1, t.problem.before2, t.problem.before3, t.problem.before4].map(
                (item, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="text-rose-500 font-bold select-none mt-0.5">✕</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* After */}
          <div className="p-6 sm:p-8 rounded-2xl bg-godot-card border border-godot-500/40 shadow-xl shadow-godot-500/5 space-y-6">
            <div className="flex items-center space-x-3 text-emerald-400 font-bold text-lg">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-white">{t.problem.afterTitle}</span>
            </div>

            <ul className="space-y-4 text-sm text-slate-300">
              {[t.problem.after1, t.problem.after2, t.problem.after3, t.problem.after4].map(
                (item, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="text-emerald-400 font-bold select-none mt-0.5">✓</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Features Grid ("Everything you need, nothing you don't") */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto border-t border-godot-border/60">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-godot-400 bg-godot-500/10 border border-godot-500/20 px-3 py-1 rounded-full">
            {t.features.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t.features.headline}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {t.features.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FolderSearch,
              color: 'text-godot-400 bg-godot-500/10',
              title: t.features.card1.title,
              desc: t.features.card1.desc,
              code: 'devdock scan .'
            },
            {
              icon: Layers,
              color: 'text-purple-400 bg-purple-500/10',
              title: t.features.card2.title,
              desc: t.features.card2.desc,
              code: 'devdock mcp add godot-lsp'
            },
            {
              icon: Bot,
              color: 'text-sky-400 bg-sky-500/10',
              title: t.features.card3.title,
              desc: t.features.card3.desc,
              code: 'devdock skill install gdscript-architect'
            },
            {
              icon: RefreshCw,
              color: 'text-emerald-400 bg-emerald-500/10',
              title: t.features.card4.title,
              desc: t.features.card4.desc,
              code: 'devdock update --all'
            },
            {
              icon: ShieldCheck,
              color: 'text-amber-400 bg-amber-500/10',
              title: t.features.card5.title,
              desc: t.features.card5.desc,
              code: 'SHA-256 Checksum Verified'
            },
            {
              icon: Stethoscope,
              color: 'text-rose-400 bg-rose-500/10',
              title: t.features.card6.title,
              desc: t.features.card6.desc,
              code: 'devdock doctor'
            }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-godot-card border border-godot-border hover:border-godot-400/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className={`p-3 rounded-xl w-fit ${card.color} mb-4 group-hover:scale-105 transition`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-godot-300 transition">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-godot-border">
                  <code className="text-[11px] font-mono text-godot-300 bg-godot-950 px-2 py-1 rounded">
                    $ {card.code}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 max-w-7xl mx-auto border-t border-godot-border/60">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-godot-400 bg-godot-500/10 border border-godot-500/20 px-3 py-1 rounded-full">
            {t.how.eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.how.headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: t.how.step1Title,
              desc: t.how.step1Desc,
              tag: 'npm i -g @francisiv/orbitkit'
            },
            {
              step: '02',
              title: t.how.step2Title,
              desc: t.how.step2Desc,
              tag: 'devdock scan .'
            },
            {
              step: '03',
              title: t.how.step3Title,
              desc: t.how.step3Desc,
              tag: 'Godot LSP (Port 6005)'
            }
          ].map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-godot-card border border-godot-border relative overflow-hidden flex flex-col justify-between"
            >
              <div className="text-5xl font-black text-godot-border/40 font-mono mb-4 select-none">
                {s.step}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-godot-border">
                <span className="text-xs font-mono font-medium text-godot-400">
                  {s.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Complete Documentation Section */}
      <DocsSection lang={lang} />

      {/* 7. Footer */}
      <footer className="border-t border-godot-border/80 py-10 bg-godot-950 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">DevDock</span>
            <span>— Open Ecosystem for Godot Engine & AI Coding Assistants</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <a
              href="https://github.com/FrancisCuarto/OrbitKit"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center"
            >
              GitHub Repository
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <span className="flex items-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              100% Privacy by Design (No Telemetry)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
