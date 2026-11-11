import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Copy, Check } from 'lucide-react';
import { Language, TRANSLATIONS } from './content/translations';
import { TerminalWidget } from './components/TerminalWidget';
import { DocsSection } from './components/DocsSection';
import { SeoHead } from './components/SeoHead';
import { safeCopyToClipboard } from './utils/clipboard';

const REPO_URL = 'https://github.com/FrancisCuarto/OrbitKit';
const INSTALL_CMD = 'npm i -g @francisiv/vgskillframe';

/** Small mono label used as section index ("01 / EL PROBLEMA"). */
function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
      <span className="bg-ink text-paper px-1.5 py-0.5 tabular-nums">{index}</span>
      <span>{children}</span>
      <span className="h-px flex-1 bg-ink/20" />
    </div>
  );
}

export function App() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('lang') === 'en') return 'en';
    }
    return 'es';
  });
  const [copied, setCopied] = useState<string | null>(null);
  const t = TRANSLATIONS[lang];
  const es = lang === 'es';

  const copy = (cmd: string) => {
    void safeCopyToClipboard(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied((c) => (c === cmd ? null : c)), 1800);
  };

  const CopyButton = ({ cmd, dark = false }: { cmd: string; dark?: boolean }) => (
    <button
      type="button"
      onClick={() => copy(cmd)}
      aria-label={es ? `Copiar: ${cmd}` : `Copy: ${cmd}`}
      className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
        dark
          ? 'border border-paper/25 text-paper/80 hover:bg-signal hover:text-ink hover:border-signal'
          : 'border border-ink text-ink hover:bg-ink hover:text-paper'
      }`}
    >
      {copied === cmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied === cmd ? (es ? 'Copiado' : 'Copied') : es ? 'Copiar' : 'Copy'}
    </button>
  );

  const modules = [
    {
      id: 'M-01',
      title: t.features.card1.title,
      desc: t.features.card1.desc,
      cmd: 'vgskillframe scan .'
    },
    {
      id: 'M-02',
      title: t.features.card3.title,
      desc: t.features.card3.desc,
      cmd: 'vgskillframe skill install godot4-syntax-guardian'
    },
    {
      id: 'M-03',
      title: t.features.card2.title,
      desc: t.features.card2.desc,
      cmd: 'vgskillframe mcp add ctx7'
    },
    {
      id: 'M-04',
      title: es ? 'Caja negra de crashes' : 'Crash blackbox',
      desc: es
        ? 'Graba errores de GDScript, los últimos inputs y el árbol de escena al momento del crash, y arma un prompt de diagnóstico listo para pegar en tu agente.'
        : 'Records GDScript errors, the last inputs and the scene tree at crash time, then builds a diagnostic prompt ready to paste into your agent.',
      cmd: 'vgskillframe record --last --prompt'
    },
    {
      id: 'M-05',
      title: es ? 'Pipeline Blender → Godot' : 'Blender → Godot pipeline',
      desc: es
        ? 'Sufijos de colisión (-col, -convcol, -navmesh), remapeo de Skeleton3D y materiales PBR sin re-exportar a mano.'
        : 'Collision suffixes (-col, -convcol, -navmesh), Skeleton3D remapping and PBR materials without manual re-export loops.',
      cmd: 'vgskillframe skill install godot-blender-pipeline'
    },
    {
      id: 'M-06',
      title: t.features.card4.title,
      desc: t.features.card4.desc,
      cmd: 'vgskillframe update --all'
    },
    {
      id: 'M-07',
      title: t.features.card6.title,
      desc: t.features.card6.desc,
      cmd: 'vgskillframe doctor'
    },
    {
      id: 'M-08',
      title: t.features.card5.title,
      desc: t.features.card5.desc,
      cmd: null
    }
  ];

  const problemRows = [
    { aspect: es ? 'Sintaxis' : 'Syntax', before: t.problem.before2, after: t.problem.after2 },
    { aspect: es ? 'Editor' : 'Editor', before: t.problem.before3, after: t.problem.after3 },
    { aspect: es ? 'Addons' : 'Addons', before: t.problem.before1, after: t.problem.after1 },
    { aspect: es ? 'Mantenimiento' : 'Upkeep', before: t.problem.before4, after: t.problem.after4 }
  ];

  const stages = [
    { stage: '1-1', title: t.how.step1Title, desc: t.how.step1Desc, cmd: INSTALL_CMD },
    { stage: '1-2', title: t.how.step2Title, desc: t.how.step2Desc, cmd: 'vgskillframe init' },
    { stage: '1-3', title: t.how.step3Title, desc: t.how.step3Desc, cmd: 'vgskillframe mcp add godot-lsp' }
  ];

  const navItems = [
    { href: '#problema', label: es ? 'Problema' : 'Problem' },
    { href: '#modulos', label: es ? 'Módulos' : 'Modules' },
    { href: '#inicio', label: es ? 'Inicio' : 'Start' },
    { href: '#docs', label: es ? 'Manual' : 'Manual' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-sans">
      <SeoHead lang={lang} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2.5 group" aria-label="VGSkillFrame">
            <span className="font-display text-[22px] leading-none bg-ink text-paper px-1.5 pt-1 pb-0.5 group-hover:bg-signal group-hover:text-ink transition">
              VG
            </span>
            <span className="font-bold tracking-tight text-[17px]">skillframe</span>
            <span className="hidden sm:inline font-mono text-[11px] text-ink-mute tabular-nums">v0.7.0</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 font-mono text-xs uppercase tracking-wider">
            {navItems.map((item, i) => (
              <a key={item.href} href={item.href} className="hover:text-signal-dark transition">
                <span className="text-ink-mute mr-1 tabular-nums">0{i + 1}</span>
                {item.label}
              </a>
            ))}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center hover:text-signal-dark transition">
              GitHub <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </nav>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center" role="group" aria-label="Language">
              {(['es', 'en'] as const).map((l, i) => (
                <span key={l} className="flex items-center">
                  {i > 0 && <span className="text-ink/30 mx-1">/</span>}
                  <button
                    type="button"
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={`uppercase ${lang === l ? 'text-ink underline decoration-2 decoration-signal underline-offset-4' : 'text-ink-mute hover:text-ink'}`}
                  >
                    {l}
                  </button>
                </span>
              ))}
            </div>
            <a href="#inicio" className="hidden sm:inline-flex bg-ink text-paper px-3 py-2 uppercase tracking-wider hover:bg-signal hover:text-ink transition">
              {t.nav.install}
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="graph-paper border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16 lg:pt-20 lg:pb-20 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-8">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
              Videogame Skill Frame — {es ? 'manual de uso' : 'user manual'} · Godot 4.3+ · Blender · MCP
            </p>

            <h1 className="font-display text-[64px] sm:text-[96px] lg:text-[112px] [text-wrap:balance]">
              {t.hero.headline1} <span className="text-signal">{t.hero.headline2}</span>
            </h1>

            <p className="text-lg leading-relaxed text-ink-soft max-w-xl [text-wrap:pretty]">{t.hero.sub}</p>

            <div className="space-y-4">
              <div className="flex items-stretch max-w-xl border-2 border-ink bg-ink text-paper">
                <code className="flex-1 px-4 py-3.5 font-mono text-sm overflow-x-auto whitespace-nowrap">
                  <span className="text-signal-light select-none">$ </span>
                  {INSTALL_CMD}
                </code>
                <button
                  type="button"
                  onClick={() => copy(INSTALL_CMD)}
                  className="px-4 bg-signal text-ink font-mono text-xs uppercase tracking-wider font-semibold hover:bg-paper transition inline-flex items-center gap-1.5"
                >
                  {copied === INSTALL_CMD ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === INSTALL_CMD ? (es ? 'Listo' : 'Done') : es ? 'Copiar' : 'Copy'}
                </button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider">
                <a href="#docs" className="inline-flex items-center underline decoration-2 decoration-signal underline-offset-4 hover:text-signal-dark">
                  {t.hero.btnDocs} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </a>
                <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center hover:text-signal-dark">
                  {t.hero.btnGithub} <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 lg:pt-10">
            <TerminalWidget lang={lang} />
          </div>
        </div>

        {/* Spec strip */}
        <div className="border-t-2 border-ink bg-paper">
          <dl className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 divide-x divide-ink/20">
            {[
              [es ? 'Motor' : 'Engine', 'Godot 4.3+'],
              ['Pipeline', 'Blender → glTF 2.0'],
              [es ? 'Protocolo' : 'Protocol', 'MCP · LSP :6005'],
              [es ? 'Agentes' : 'Agents', 'Claude · Cursor · Antigravity'],
              [es ? 'Licencia' : 'License', 'MIT · open source']
            ].map(([k, v]) => (
              <div key={k} className="px-4 sm:px-6 py-4">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">{k}</dt>
                <dd className="font-semibold mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 01 — Problem */}
      <section id="problema" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-20 lg:py-28 space-y-10">
        <SectionLabel index="01">{t.problem.eyebrow}</SectionLabel>
        <h2 className="font-display text-5xl sm:text-7xl max-w-4xl [text-wrap:balance]">{t.problem.title}</h2>

        <div className="border-2 border-ink">
          <div className="hidden md:grid grid-cols-12 border-b-2 border-ink font-mono text-xs uppercase tracking-wider">
            <div className="col-span-2 px-5 py-3 text-ink-mute">{es ? 'Aspecto' : 'Aspect'}</div>
            <div className="col-span-5 px-5 py-3 border-l border-ink/20 text-ink-mute">{t.problem.beforeTitle}</div>
            <div className="col-span-5 px-5 py-3 border-l-2 border-ink bg-ink text-paper">{t.problem.afterTitle}</div>
          </div>
          {problemRows.map((row, i) => (
            <div key={row.aspect} className={`grid md:grid-cols-12 ${i > 0 ? 'border-t border-ink/20' : ''}`}>
              <div className="md:col-span-2 px-5 pt-5 md:py-5 font-display text-2xl">{row.aspect}</div>
              <div className="md:col-span-5 px-5 py-3 md:py-5 md:border-l border-ink/20 text-ink-mute line-through decoration-ink/30">
                {row.before}
              </div>
              <div className="md:col-span-5 px-5 pb-5 md:py-5 md:border-l-2 border-ink bg-paper-dim font-medium">
                <span className="text-signal-dark font-mono mr-2">→</span>
                {row.after}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editor plugin band (dark) */}
      <section className="bg-ink text-paper border-y-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-paper/50">
              res://addons/vgskillframe
            </p>
            <h2 className="font-display text-5xl sm:text-6xl [text-wrap:balance]">
              {es ? 'Un dock dentro de Godot.' : 'A dock inside Godot.'}{' '}
              <span className="text-signal">{es ? 'No otra pestaña.' : 'Not another tab.'}</span>
            </h2>
            <p className="text-paper/70 leading-relaxed [text-wrap:pretty]">
              {es
                ? 'El CLI instala y habilita el plugin en project.godot. Desde el editor ves skills, servidores MCP, el árbol de escena y la caja negra de crashes, y tu agente se conecta al Language Server de GDScript en el puerto 6005.'
                : 'The CLI installs and enables the plugin in project.godot. From the editor you see skills, MCP servers, the scene tree and the crash blackbox, while your agent connects to the GDScript Language Server on port 6005.'}
            </p>
            <ul className="font-mono text-sm space-y-2 text-paper/80">
              <li><span className="text-signal mr-2">■</span>plugin.cfg {es ? 'habilitado en' : 'enabled in'} project.godot</li>
              <li><span className="text-signal mr-2">■</span>GDScript LSP · 127.0.0.1:6005</li>
              <li><span className="text-signal mr-2">■</span>.agents/skills · .claude/skills · .mcp.json</li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <figure className="border-2 border-paper/20">
              <video
                className="w-full block bg-black aspect-video"
                src="/orbitkit-preview.mp4"
                poster="/orbitkit-preview-poster.png"
                controls
                muted
                playsInline
                preload="none"
              />
              <figcaption className="flex justify-between px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-paper/50 border-t-2 border-paper/20">
                <span>{es ? 'Demo real del plugin' : 'Real plugin demo'}</span>
                <span>Godot 4</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 02 — Modules */}
      <section id="modulos" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-20 lg:py-28 space-y-10">
        <SectionLabel index="02">{t.features.eyebrow}</SectionLabel>
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <h2 className="lg:col-span-8 font-display text-5xl sm:text-7xl [text-wrap:balance]">{t.features.headline}</h2>
          <p className="lg:col-span-4 text-ink-soft leading-relaxed">{t.features.sub}</p>
        </div>

        <ol className="grid md:grid-cols-2 border-t-2 border-ink">
          {modules.map((m, i) => (
            <li
              key={m.id}
              className={`py-7 flex flex-col gap-4 border-b border-ink/20 ${i % 2 === 0 ? 'md:pr-10' : 'md:pl-10 md:border-l'}`}
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-signal-dark tabular-nums shrink-0">{m.id}</span>
                <h3 className="text-xl font-bold tracking-tight">{m.title}</h3>
              </div>
              <p className="text-ink-soft leading-relaxed pl-[52px] [text-wrap:pretty]">{m.desc}</p>
              {m.cmd && (
                <div className="pl-[52px] flex items-center gap-2 min-w-0">
                  <code className="flex-1 min-w-0 truncate font-mono text-[13px] bg-paper-dim border border-ink/15 px-3 py-1.5">
                    {m.cmd}
                  </code>
                  <CopyButton cmd={m.cmd} />
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className="hatch h-3 border-y-2 border-ink" aria-hidden="true" />

      {/* 03 — Start */}
      <section id="inicio" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-20 lg:py-28 space-y-10">
        <SectionLabel index="03">{t.how.eyebrow}</SectionLabel>
        <h2 className="font-display text-5xl sm:text-7xl max-w-4xl [text-wrap:balance]">{t.how.headline}</h2>

        <div className="grid md:grid-cols-3 border-2 border-ink">
          {stages.map((s, i) => (
            <div key={s.stage} className={`p-6 flex flex-col gap-5 ${i > 0 ? 'border-t-2 md:border-t-0 md:border-l-2 border-ink' : ''}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">Stage</span>
                <span className="font-display text-6xl text-signal tabular-nums">{s.stage}</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">{s.title.replace(/^\d\.\s*/, '')}</h3>
              <p className="text-ink-soft leading-relaxed flex-1">{s.desc}</p>
              <div className="flex items-center gap-2 min-w-0">
                <code className="flex-1 min-w-0 truncate font-mono text-[13px] bg-ink text-paper px-3 py-2">
                  <span className="text-signal-light select-none">$ </span>
                  {s.cmd}
                </code>
                <CopyButton cmd={s.cmd} />
              </div>
            </div>
          ))}
        </div>

        {/* Maintenance rows */}
        <div className="grid md:grid-cols-2 gap-x-10">
          {[
            {
              label: es ? 'Actualizar el CLI' : 'Upgrade the CLI',
              note: es ? 'Compara tu versión con npm y GitHub. También: tecla "u" en la TUI.' : 'Checks your version against npm and GitHub. Also: press "u" in the TUI.',
              cmd: 'vgskillframe upgrade'
            },
            {
              label: es ? 'Desinstalar' : 'Uninstall',
              note: es ? 'Quita el binario global y los symlinks. Tus proyectos no se tocan.' : 'Removes the global binary and symlinks. Your projects are left alone.',
              cmd: 'vgskillframe uninstall'
            }
          ].map((row) => (
            <div key={row.cmd} className="py-5 border-b border-ink/20 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <p className="font-bold">{row.label}</p>
                <p className="text-sm text-ink-mute">{row.note}</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-[13px] whitespace-nowrap">{row.cmd}</code>
                <CopyButton cmd={row.cmd} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 04 — Manual (dark appendix) */}
      <div className="bg-godot-950 text-slate-100 border-t-2 border-ink">
        <DocsSection lang={lang} />
      </div>

      {/* Footer */}
      <footer className="bg-paper border-t-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 space-y-8">
          <p className="font-display text-[18vw] lg:text-[200px] leading-[0.8] select-none" aria-hidden="true">
            VGskill<span className="text-signal">frame</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-between gap-4 font-mono text-xs uppercase tracking-wider text-ink-mute border-t border-ink/20 pt-5">
            <span>Videogame Skill Frame · {es ? 'hecho para devs de Godot y Blender' : 'built for Godot & Blender devs'}</span>
            <div className="flex gap-6">
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-ink inline-flex items-center">
                GitHub <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </a>
              <a href="https://www.npmjs.com/package/@francisiv/vgskillframe" target="_blank" rel="noreferrer" className="hover:text-ink inline-flex items-center">
                npm <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </a>
              <span>{es ? 'Sin telemetría' : 'No telemetry'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
