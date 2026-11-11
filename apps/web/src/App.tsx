import { useState } from 'react';
import {
  ShieldCheck,
  Terminal,
  Bot,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Stethoscope,
  Copy,
  Check,
  Trash2,
  Boxes,
  Zap,
  Radio,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Language, TRANSLATIONS } from './content/translations';
import { TerminalWidget } from './components/TerminalWidget';
import { DocsSection } from './components/DocsSection';
import { Orbit3DScene } from './components/Orbit3DScene';
import { AnimatedBackground } from './components/AnimatedBackground';
import { EcosystemCarousel } from './components/EcosystemCarousel';
import { SeoHead } from './components/SeoHead';
import { safeCopyToClipboard } from './utils/clipboard';

export function App() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('lang') === 'en') return 'en';
    }
    return 'es';
  });
  const [copiedUpgrade, setCopiedUpgrade] = useState(false);
  const [copiedUninstall, setCopiedUninstall] = useState(false);
  const [copiedBlender, setCopiedBlender] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleCopyUpgrade = () => {
    void safeCopyToClipboard('vgskillframe upgrade');
    setCopiedUpgrade(true);
    setTimeout(() => setCopiedUpgrade(false), 2000);
  };

  const handleCopyUninstall = () => {
    void safeCopyToClipboard('vgskillframe uninstall');
    setCopiedUninstall(true);
    setTimeout(() => setCopiedUninstall(false), 2000);
  };

  const handleCopyBlender = () => {
    void safeCopyToClipboard('vgskillframe skill install godot-blender-pipeline');
    setCopiedBlender(true);
    setTimeout(() => setCopiedBlender(false), 2000);
  };

  const handleCopyMcp = () => {
    void safeCopyToClipboard('vgskillframe mcp add ctx7');
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-godot-950 text-slate-100 font-sans selection:bg-godot-500 selection:text-white isolate">
      {/* Dynamic SEO & OpenGraph Synchronizer */}
      <SeoHead lang={lang} />

      {/* Full-Page Canvas Background */}
      <AnimatedBackground />

      {/* 1. Header / Navbar */}
      <header className="border-b border-godot-border bg-godot-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#23689b] flex items-center justify-center transition group-hover:bg-[#2d7bb6]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9 8C9.55 8 10 8.45 10 9C10 9.55 9.55 10 9 10C8.45 10 8 9.55 8 9C8 8.45 8.45 8 9 8ZM15 8C15.55 8 16 8.45 16 9C16 9.55 15.55 10 15 10C14.45 10 14 9.55 14 9C14 8.45 14.45 8 15 8ZM12 18C9.33 18 7.18 16.11 6.64 14H17.36C16.82 16.11 14.67 18 12 18Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-godot-300 transition">
                VGskillframe
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-godot-card text-godot-300 border border-godot-border tabular-nums">
                v0.7.0
              </span>
            </div>
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <a href="#ecosystem" className="hover:text-white transition">
              {lang === 'es' ? 'Ecosistema 3D' : '3D Ecosystem'}
            </a>
            <a href="#problem" className="hover:text-white transition">
              {lang === 'es' ? 'Arquitectura' : 'Architecture'}
            </a>
            <a href="#features" className="hover:text-white transition">
              {t.nav.features}
            </a>
            <a href="#how-it-works" className="hover:text-white transition">
              {t.nav.howItWorks}
            </a>
            <a href="#docs" className="hover:text-white transition">
              {t.nav.docs}
            </a>
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
                type="button"
                onClick={() => setLang('es')}
                className={`px-2.5 py-1 rounded transition ${
                  lang === 'es' ? 'bg-[#23689b] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded transition ${
                  lang === 'en' ? 'bg-[#23689b] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <a
              href="#docs"
              className="flex items-center text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#23689b] hover:bg-[#2d7bb6] text-white transition border border-godot-400/30"
            >
              <Terminal className="w-3.5 h-3.5 mr-1.5" />
              {t.nav.install}
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Interactive 3D Orbital Canvas */}
      <section className="relative z-10 pt-16 pb-16 px-4 text-center overflow-hidden">
        {/* Interactive 3D Geodesic Core & Orbiting Satellites */}
        <Orbit3DScene />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Engineering Release Spec Ribbon */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-3.5 py-1.5 rounded-lg bg-godot-card border border-godot-border text-xs font-mono text-slate-300">
            <span className="flex items-center text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
              VGskillframe v0.7.0
            </span>
            <span className="text-slate-600 select-none">•</span>
            <span className="text-slate-200">Godot 4.3+</span>
            <span className="text-slate-600 select-none">•</span>
            <span className="text-slate-200">Blender 3D</span>
            <span className="text-slate-600 select-none">•</span>
            <span className="text-slate-200">Model Context Protocol</span>
            <span className="text-slate-600 select-none">•</span>
            <span className="text-slate-200">Blackbox Flight Recorder</span>
          </div>

          {/* Solid High-Contrast Headline (No Gradient Text) */}
          <h1 className="headline-shadow text-4xl sm:text-6xl font-black tracking-[-0.03em] text-white leading-[1.08] max-w-4xl mx-auto [text-wrap:balance]">
            {t.hero.headline1}{' '}
            <span className="text-godot-300">
              {t.hero.headline2}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed [text-wrap:pretty]">
            {t.hero.sub}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#docs"
              className="px-6 py-3 rounded-lg bg-[#23689b] hover:bg-[#2d7bb6] text-white font-semibold text-sm transition border border-godot-400/30 flex items-center"
            >
              {t.hero.btnDocs}
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a
              href="https://github.com/FrancisCuarto/OrbitKit"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-lg bg-godot-card hover:bg-godot-cardHover text-slate-200 border border-godot-border font-semibold text-sm transition flex items-center"
            >
              {t.hero.btnGithub}
              <ExternalLink className="w-4 h-4 ml-2 text-slate-400" />
            </a>
          </div>

          {/* Interactive Terminal Widget */}
          <div className="relative z-30 pt-6">
            <TerminalWidget lang={lang} />
          </div>
        </div>
      </section>

      {/* 3. Connected 3D Ecosystem Grid & Tool Inspector */}
      <div id="ecosystem" className="relative z-10">
        <EcosystemCarousel lang={lang} />
      </div>

      {/* 4. The Architectural Comparison Workbench (Clean Divider Layout, Zero Nested Cards) */}
      <section id="problem" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-godot-border/60">
        <div className="max-w-3xl mx-auto mb-12 text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em] [text-wrap:balance]">
            {t.problem.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed [text-wrap:pretty]">
            {lang === 'es'
              ? 'Por qué los modelos de lenguaje generales fallan en Godot 4 y cómo VGskillframe establece una conexión viva entre el motor y tu agente de código.'
              : 'Why generic language models hallucinate in Godot 4 and how VGskillframe establishes a live runtime bridge between engine diagnostics and AI coding agents.'}
          </p>
        </div>

        {/* Dual-Pane Architectural Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Pane 1: Modo Convencional / Entorno Desconectado */}
          <div className="rounded-xl bg-godot-card border border-rose-950/80 p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-rose-950/80">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-extrabold text-white text-base">
                    {lang === 'es' ? 'Modo Aislado (Sin VGskillframe)' : 'Isolated Mode (Without VGskillframe)'}
                  </span>
                </div>
                <span className="text-xs font-mono uppercase text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-900/60">
                  {lang === 'es' ? 'Desconectado' : 'Offline'}
                </span>
              </div>

              {/* Clean Structured List with Dividers (No Nested Cards) */}
              <div className="mt-4 divide-y divide-rose-950/70">
                {[
                  {
                    aspect: lang === 'es' ? 'Sintaxis & Runtime' : 'Syntax & Runtime',
                    detail: t.problem.before2
                  },
                  {
                    aspect: lang === 'es' ? 'Inspección del Motor' : 'Engine Inspection',
                    detail: t.problem.before3
                  },
                  {
                    aspect: lang === 'es' ? 'Gestión de Addons' : 'Addon Management',
                    detail: t.problem.before1
                  },
                  {
                    aspect: lang === 'es' ? 'Diagnóstico de Salud' : 'Health Diagnostics',
                    detail: t.problem.before4
                  }
                ].map((row, idx) => (
                  <div key={idx} className="py-3.5 space-y-1">
                    <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-semibold">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{row.aspect}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-5 [text-wrap:pretty]">
                      {row.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-godot-border/60 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>GDScript 3.x drift</span>
              <span className="text-rose-400 font-semibold">Errors at compile time</span>
            </div>
          </div>

          {/* Pane 2: Arquitectura VGskillframe en Vivo */}
          <div className="rounded-xl bg-godot-card border border-godot-500/40 p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-godot-border">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-extrabold text-white text-base">
                    {lang === 'es' ? 'Arquitectura VGskillframe en Vivo' : 'Live VGskillframe Architecture'}
                  </span>
                </div>
                <span className="text-xs font-mono uppercase text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/60">
                  {lang === 'es' ? 'Bidireccional' : 'Bidirectional'}
                </span>
              </div>

              {/* Clean Structured List with Dividers (No Nested Cards) */}
              <div className="mt-4 divide-y divide-godot-border/60">
                {[
                  {
                    aspect: lang === 'es' ? 'Sintaxis & Runtime' : 'Syntax & Runtime',
                    detail: t.problem.after2
                  },
                  {
                    aspect: lang === 'es' ? 'Inspección del Motor' : 'Engine Inspection',
                    detail: t.problem.after3
                  },
                  {
                    aspect: lang === 'es' ? 'Gestión de Addons' : 'Addon Management',
                    detail: t.problem.after1
                  },
                  {
                    aspect: lang === 'es' ? 'Diagnóstico de Salud' : 'Health Diagnostics',
                    detail: t.problem.after4
                  }
                ].map((row, idx) => (
                  <div key={idx} className="py-3.5 space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{row.aspect}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-5 [text-wrap:pretty]">
                      {row.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-godot-border/60 text-xs font-mono text-slate-300 flex items-center justify-between">
              <span>LSP Port 6005 + Context7</span>
              <span className="text-emerald-400 font-semibold">0 syntax drift</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Asymmetric Engineering Workbench (Purpose-Built Layout) */}
      <section id="features" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-godot-border/60">
        <div className="max-w-3xl mx-auto mb-14 text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em] [text-wrap:balance]">
            {t.features.headline}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed [text-wrap:pretty]">
            {t.features.sub}
          </p>
        </div>

        {/* Asymmetric Studio Layout */}
        <div className="space-y-6">
          {/* Top Hero Workbench Block: Godot 4 Editor Integration & Live LSP Bridge */}
          <div className="rounded-xl bg-godot-card border border-godot-border p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-godot-950 border border-godot-border text-xs font-mono text-godot-300">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Telemetry Socket • Port 6005</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight [text-wrap:balance]">
                  {lang === 'es'
                    ? 'Plugin Nativo de Editor + Puente MCP Bidireccional'
                    : 'Native Editor Plugin + Bidirectional MCP Bridge'}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed [text-wrap:pretty]">
                  {lang === 'es'
                    ? 'VGskillframe instala automáticamente el plugin de editor en res://addons/vgskillframe y conecta Antigravity, Claude Code, Cursor y Codex directamente al Language Server de Godot 4.3+. Tu agente de código analiza árboles de escenas y captura errores de compilación antes de que ejecutes el juego.'
                    : 'VGskillframe auto-installs the Godot 4 Editor plugin under res://addons/vgskillframe and connects Antigravity, Claude Code, Cursor, and Codex directly to the live GDScript LSP. Your AI agent inspects scene trees and catches runtime errors before you run the project.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-godot-950 text-slate-300 border border-godot-border">
                    addons/vgskillframe/plugin.cfg
                  </span>
                  <span className="px-2.5 py-1 rounded bg-godot-950 text-slate-300 border border-godot-border">
                    127.0.0.1:6005 (LSP)
                  </span>
                  <span className="px-2.5 py-1 rounded bg-godot-950 text-emerald-400 border border-emerald-500/30">
                    AST Validation Ready
                  </span>
                </div>
              </div>

              {/* Integrated Telemetry Display Column (Border-Separated, No Nested Card) */}
              <div className="lg:col-span-6 pt-6 lg:pt-0 lg:border-l border-godot-border/80 lg:pl-8 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-godot-border/80 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-white font-semibold">Godot Engine 4.3.stable</span>
                  </div>
                  <span className="tabular-nums">PID: 49201</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <p className="text-emerald-400 flex items-center">
                    <Check className="w-3.5 h-3.5 mr-2 shrink-0" />
                    addons/vgskillframe/plugin.cfg enabled in project.godot
                  </p>
                  <p className="text-sky-300 flex items-center">
                    <Radio className="w-3.5 h-3.5 mr-2 shrink-0" />
                    GDScript LSP socket streaming on port 6005
                  </p>
                  <p className="text-purple-300 flex items-center">
                    <Bot className="w-3.5 h-3.5 mr-2 shrink-0" />
                    Agent Context: 20 curated skills loaded in .agents/skills
                  </p>
                  <p className="text-slate-400 pt-2 border-t border-godot-border/60">
                    $ vgskillframe doctor: System ready, 0 blockers detected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Two Asymmetric Feature Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar A: Blender 3D Pipeline */}
            <div className="rounded-xl bg-godot-card border border-godot-border p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-semibold">
                  <Boxes className="w-4 h-4" />
                  <span>{lang === 'es' ? 'Pipeline 3D & glTF 2.0' : '3D Pipeline & glTF 2.0'}</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {lang === 'es'
                    ? 'Sincronizador Blender 3D ➔ Godot 4'
                    : 'Blender 3D ➔ Godot 4 Synchronizer'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed [text-wrap:pretty]">
                  {lang === 'es'
                    ? 'Automatiza sufijos de colisión (-col para StaticBody3D, -convcol para mallas convexas, -navmesh), remapeo de esqueletos Skeleton3D y materiales PBR sin pasos manuales.'
                    : 'Automates collision suffixes (-col for StaticBody3D, -convcol for convex hulls, -navmesh), Skeleton3D bone remapping, and PBR materials without manual re-export loops.'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-godot-950 border border-godot-border font-mono text-xs">
                <code className="text-amber-300 truncate mr-2">
                  vgskillframe skill install godot-blender-pipeline
                </code>
                <button
                  type="button"
                  onClick={handleCopyBlender}
                  className="px-2.5 py-1 rounded bg-[#23689b] hover:bg-[#2d7bb6] text-white border border-godot-400/30 text-xs font-semibold transition shrink-0"
                >
                  {copiedBlender ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Pillar B: Context7 MCP & Curated Skills */}
            <div className="rounded-xl bg-godot-card border border-godot-border p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-semibold">
                  <Zap className="w-4 h-4" />
                  <span>{lang === 'es' ? 'Grounding Oficial en Vivo' : 'Live Official Grounding'}</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {lang === 'es'
                    ? 'Context7 (ctx7) + Skills Anti-Alucinación'
                    : 'Context7 (ctx7) + Anti-Hallucination Skills'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed [text-wrap:pretty]">
                  {lang === 'es'
                    ? 'Inyecta la documentación oficial indexada de Godot 4.3+ directamente al prompt de tu IA vía Context7 MCP. Incluye directrices de tipado estricto (godot4-syntax-guardian).'
                    : 'Injects official indexed Godot 4.3+ documentation directly into your AI prompt via Context7 MCP. Bundles strict static typing rules (godot4-syntax-guardian).'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-godot-950 border border-godot-border font-mono text-xs">
                <code className="text-sky-300 truncate mr-2">
                  vgskillframe mcp add ctx7
                </code>
                <button
                  type="button"
                  onClick={handleCopyMcp}
                  className="px-2.5 py-1 rounded bg-[#23689b] hover:bg-[#2d7bb6] text-white border border-godot-400/30 text-xs font-semibold transition shrink-0"
                >
                  {copiedMcp ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Technical Dock: Diagnostics, Batch Update & Security */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-godot-card border border-godot-border space-y-2.5">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-semibold">
                <Stethoscope className="w-4 h-4" />
                <span>{lang === 'es' ? 'Diagnóstico Clínico' : 'Clinical Diagnostics'}</span>
              </div>
              <h4 className="font-bold text-white text-base">vgskillframe doctor</h4>
              <p className="text-xs text-slate-300 leading-relaxed [text-wrap:pretty]">
                {t.features.card6.desc}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-godot-card border border-godot-border space-y-2.5">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-semibold">
                <RefreshCw className="w-4 h-4" />
                <span>{lang === 'es' ? 'Sincronizador en Lote' : 'Batch Synchronizer'}</span>
              </div>
              <h4 className="font-bold text-white text-base">vgskillframe update --all</h4>
              <p className="text-xs text-slate-300 leading-relaxed [text-wrap:pretty]">
                {t.features.card4.desc}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-godot-card border border-godot-border space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'es' ? '100% Privacidad Local' : '100% Local Privacy'}</span>
              </div>
              <h4 className="font-bold text-white text-base">SHA-256 & Anti-ZipSlip</h4>
              <p className="text-xs text-slate-300 leading-relaxed [text-wrap:pretty]">
                {t.features.card5.desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Sequential Pipeline Flow (Clean Single Elevation) */}
      <section id="how-it-works" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-godot-border/60">
        <div className="max-w-3xl mx-auto mb-14 text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em] [text-wrap:balance]">
            {t.how.headline}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed [text-wrap:pretty]">
            {lang === 'es'
              ? 'Flujo de trabajo unificado desde la terminal hasta tu editor Godot 4.'
              : 'A unified developer workflow from your terminal to the Godot 4 editor.'}
          </p>
        </div>

        {/* 3-Step Sequential Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              phase: lang === 'es' ? 'Fase 1: Instalación Global' : 'Phase 1: Global Install',
              title: t.how.step1Title,
              desc: t.how.step1Desc,
              command: 'npm i -g @francisiv/vgskillframe',
              status: lang === 'es' ? 'Binario registrado en PATH' : 'Binary linked in PATH'
            },
            {
              phase: lang === 'es' ? 'Fase 2: Escaneo & Plugin' : 'Phase 2: Scan & Plugin',
              title: t.how.step2Title,
              desc: t.how.step2Desc,
              command: 'vgskillframe scan .',
              status: lang === 'es' ? 'res://addons/vgskillframe configurado' : 'res://addons/vgskillframe configured'
            },
            {
              phase: lang === 'es' ? 'Fase 3: Agentes en Vivo' : 'Phase 3: Live Agents',
              title: t.how.step3Title,
              desc: t.how.step3Desc,
              command: 'vgskillframe mcp add ctx7',
              status: lang === 'es' ? 'Godot LSP (puerto 6005) activo' : 'Godot LSP (port 6005) active'
            }
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-godot-card border border-godot-border flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-godot-400 font-semibold px-2 py-0.5 rounded bg-godot-950 border border-godot-border">
                  {step.phase}
                </span>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed [text-wrap:pretty]">{step.desc}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-godot-border/60">
                <code className="block text-xs font-mono text-godot-300 bg-godot-950 px-3 py-1.5 rounded border border-godot-border truncate">
                  $ {step.command}
                </code>
                <div className="text-xs font-mono text-slate-400 flex items-center">
                  <Check className="w-3 h-3 text-emerald-400 mr-1.5 shrink-0" />
                  <span>{step.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated Operations Workbench: Upgrade & Clean Uninstall */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upgrade Station */}
          <div className="p-6 rounded-xl bg-godot-card border border-emerald-500/30 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-emerald-400 text-xs font-mono font-semibold">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Auto-Actualizador (v0.7.0)' : 'Self-Updater (v0.7.0)'}</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                {lang === 'es' ? '¿Ya tenías instalado VGskillframe? Actualizar CLI' : 'Already installed? Upgrade CLI'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed [text-wrap:pretty]">
                {lang === 'es'
                  ? 'Comprueba tu versión instalada contra NPM y GitHub y actualiza el binario en un solo paso (o presiona "u" dentro de vgskillframe):'
                  : 'Checks your installed version against NPM and GitHub and updates the binary in one step (or press "u" inside vgskillframe):'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-godot-950 px-3.5 py-2.5 rounded-lg font-mono text-xs sm:text-sm">
              <div className="flex items-center space-x-2 px-2">
                <span className="text-emerald-400 font-bold select-none">$</span>
                <code className="text-emerald-300 font-semibold whitespace-nowrap">
                  vgskillframe upgrade
                </code>
              </div>
              <button
                type="button"
                onClick={handleCopyUpgrade}
                className="flex items-center justify-center px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs transition whitespace-nowrap"
              >
                <span className="inline-flex mr-1.5 shrink-0">
                  {copiedUpgrade ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </span>
                <span>
                  {copiedUpgrade
                    ? lang === 'es'
                      ? '¡Copiado!'
                      : 'Copied!'
                    : lang === 'es'
                    ? 'Copiar comando'
                    : 'Copy command'}
                </span>
              </button>
            </div>
          </div>

          {/* Clean Uninstall Station */}
          <div className="p-6 rounded-xl bg-godot-card border border-rose-500/30 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-rose-400 text-xs font-mono font-semibold">
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Desinstalación Limpia' : 'Clean Uninstallation'}</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                {lang === 'es' ? '¿Quieres desinstalar VGskillframe CLI?' : 'Want to uninstall VGskillframe CLI?'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed [text-wrap:pretty]">
                {lang === 'es'
                  ? 'Elimina limpiamente el binario global y enlaces simbólicos de tu sistema (o elige "Uninstall CLI" dentro de la interfaz):'
                  : 'Cleanly removes the global binary and symlinks from your system (or select "Uninstall CLI" inside the TUI):'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-godot-950 px-3.5 py-2.5 rounded-lg font-mono text-xs sm:text-sm">
              <div className="flex items-center space-x-2 px-2">
                <span className="text-rose-400 font-bold select-none">$</span>
                <code className="text-rose-300 font-semibold whitespace-nowrap">
                  vgskillframe uninstall
                </code>
              </div>
              <button
                type="button"
                onClick={handleCopyUninstall}
                className="flex items-center justify-center px-4 py-2 rounded bg-rose-500 hover:bg-rose-400 text-slate-950 font-sans font-bold text-xs transition whitespace-nowrap"
              >
                <span className="inline-flex mr-1.5 shrink-0">
                  {copiedUninstall ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </span>
                <span>
                  {copiedUninstall
                    ? lang === 'es'
                      ? '¡Copiado!'
                      : 'Copied!'
                    : lang === 'es'
                    ? 'Copiar comando'
                    : 'Copy command'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Complete Documentation Section */}
      <div className="relative z-10">
        <DocsSection lang={lang} />
      </div>

      {/* 8. Engineering Footer */}
      <footer className="relative z-10 border-t border-godot-border py-10 bg-godot-950 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">VGskillframe (Videogame Skill Frame)</span>
            <span>— Open Ecosystem for Godot Engine, Blender & AI Coding Assistants</span>
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
