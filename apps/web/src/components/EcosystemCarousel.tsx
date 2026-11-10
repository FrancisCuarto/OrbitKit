import React, { useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { Language } from '../content/translations';
import { safeCopyToClipboard } from '../utils/clipboard';

export interface EcosystemTool {
  id: string;
  name: string;
  categoryEs: string;
  categoryEn: string;
  brandColor: string;
  connectedMcp: string;
  connectedSkill: string;
  cliCommand: string;
  descEs: string;
  descEn: string;
  renderLogo: () => React.ReactNode;
}

export const ECOSYSTEM_TOOLS: EcosystemTool[] = [
  {
    id: 'godot',
    name: 'Godot Engine 4.x',
    categoryEs: 'Motor Principal 2D / 3D',
    categoryEn: 'Core 2D / 3D Game Engine',
    brandColor: '#478cbf',
    connectedMcp: 'godot-engine-bridge',
    connectedSkill: 'godot4-syntax-guardian',
    cliCommand: 'orbitkit mcp add godot-engine-bridge',
    descEs:
      'Control directo del editor Godot 4, ejecución en vivo, lectura de consola de errores y validación estricta de sintaxis GDScript 4.3+.',
    descEn:
      'Direct Godot 4 editor control, live game execution, runtime error console streaming, and strict GDScript 4.3+ syntax enforcement.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="8" fill="#478cbf" fillOpacity="0.2" />
        <path
          d="M24 8C14.6 8 7 15.1 7 24C7 32.9 14.6 40 24 40C33.4 40 41 32.9 41 24C41 15.1 33.4 8 24 8ZM17.5 19C18.9 19 20 20.1 20 21.5C20 22.9 18.9 24 17.5 24C16.1 24 15 22.9 15 21.5C15 20.1 16.1 19 17.5 19ZM30.5 19C31.9 19 33 20.1 33 21.5C33 22.9 31.9 24 30.5 24C29.1 24 28 22.9 28 21.5C28 20.1 29.1 19 30.5 19ZM24 34C19.1 34 15.1 30.9 14.2 26.8H33.8C32.9 30.9 28.9 34 24 34Z"
          fill="#478cbf"
        />
      </svg>
    )
  },
  {
    id: 'blender',
    name: 'Blender 3D',
    categoryEs: 'Modelado 3D, Rigging & glTF 2.0',
    categoryEn: '3D Modeling, Rigging & glTF 2.0',
    brandColor: '#f5792a',
    connectedMcp: 'godot-scene-inspector',
    connectedSkill: 'godot-blender-pipeline',
    cliCommand: 'orbitkit skill install godot-blender-pipeline',
    descEs:
      'Sincroniza pipelines de importación .blend y glTF 2.0, sufijos de colisión (-col, -convcol), Skeleton3D BoneMap y materiales PBR en Godot 4.',
    descEn:
      'Synchronizes .blend and glTF 2.0 import pipelines, collision suffixes (-col, -convcol), Skeleton3D BoneMap, and PBR materials in Godot 4.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="8" fill="#f5792a" fillOpacity="0.2" />
        <path
          d="M27.5 11L15 21.5M27.5 16L11 19.5M26.5 19C20.7 19 16 23.2 16 28.5C16 33.8 20.7 38 26.5 38C32.3 38 37 33.8 37 28.5C37 23.2 32.3 19 26.5 19Z"
          stroke="#f5792a"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="26.5" cy="28.5" r="4.5" fill="#265787" stroke="#69a7d0" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: 'ctx7',
    name: 'Context7 (ctx7)',
    categoryEs: 'Documentación Oficial en Vivo',
    categoryEn: 'Live Versioned Docs MCP',
    brandColor: '#10b981',
    connectedMcp: 'ctx7',
    connectedSkill: 'ctx7-docs-fetcher',
    cliCommand: 'orbitkit mcp add ctx7',
    descEs:
      'Inyecta documentación oficial actualizada y ejemplos verificados desde Upstash Context7 directo al prompt de tu IA para eliminar alucinaciones.',
    descEn:
      'Injects up-to-date official documentation and verified examples from Upstash Context7 straight into your AI prompt to eliminate hallucinations.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="8" fill="#10b981" fillOpacity="0.2" />
        <path
          d="M26 9L13 26H24L22 39L35 22H24L26 9Z"
          fill="#10b981"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    id: 'claude',
    name: 'Claude Code & Antigravity',
    categoryEs: 'Agentes de IA Autónomos',
    categoryEn: 'Autonomous Coding Agents',
    brandColor: '#d97757',
    connectedMcp: 'godot-lsp',
    connectedSkill: 'gdscript-fsm-master',
    cliCommand: 'orbitkit init',
    descEs:
      'Configura automáticamente .agents/skills/, .claude/skills/ y .mcp.json para que tus agentes programen arquitecturas limpias en Godot 4.',
    descEn:
      'Automatically configures .agents/skills/, .claude/skills/, and .mcp.json so your coding agents build clean architectures in Godot 4.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="8" fill="#d97757" fillOpacity="0.2" />
        <path
          d="M24 10L27.2 19.8L37 23L27.2 26.2L24 36L20.8 26.2L11 23L20.8 19.8L24 10Z"
          fill="#d97757"
        />
        <circle cx="34" cy="14" r="2.5" fill="#fbbf24" />
      </svg>
    )
  },
  {
    id: 'cursor',
    name: 'Cursor & VS Code LSP',
    categoryEs: 'IDE & GDScript Language Server',
    categoryEn: 'IDE & GDScript Language Server',
    brandColor: '#38bdf8',
    connectedMcp: 'godot-lsp',
    connectedSkill: 'godot4-syntax-guardian',
    cliCommand: 'orbitkit mcp add godot-lsp',
    descEs:
      'Conecta tu editor con el servidor de lenguaje nativo de Godot en el puerto 6005 para autocompletado tipado y diagnóstico instantáneo.',
    descEn:
      'Bridges your IDE to Godot’s native Language Server on port 6005 for typed autocompletion and instant compiler diagnostics.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="8" fill="#38bdf8" fillOpacity="0.2" />
        <path
          d="M14 17L24 11L34 17V31L24 37L14 31V17Z"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M14 17L24 23L34 17M24 23V37" stroke="#7dd3fc" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'gdshader',
    name: 'GDShader & Vulkan VFX',
    categoryEs: 'Shaders 2D / 3D & Post-Proceso',
    categoryEn: '2D / 3D Shaders & Post-Process',
    brandColor: '#a855f7',
    connectedMcp: 'godot-docs',
    connectedSkill: 'godot-shader-vfx',
    cliCommand: 'orbitkit skill install godot-shader-vfx',
    descEs:
      'Domina shaders canvas_item y spatial en Vulkan/Forward+, distorsión UV, disolución procedural y optimización de GPU.',
    descEn:
      'Master canvas_item and spatial shaders in Vulkan/Forward+, UV distortion, procedural dissolve, and GPU optimization.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="8" fill="#a855f7" fillOpacity="0.2" />
        <polygon
          points="24,10 37,34 11,34"
          stroke="#c084fc"
          strokeWidth="2.5"
          fill="#a855f7"
          fillOpacity="0.3"
        />
        <circle cx="24" cy="26" r="3.5" fill="#e9d5ff" />
      </svg>
    )
  },
  {
    id: 'gut',
    name: 'GUT Unit Testing',
    categoryEs: 'Testing Automatizado en Godot',
    categoryEn: 'Automated Godot Unit Testing',
    brandColor: '#f43f5e',
    connectedMcp: 'godot-gut-runner',
    connectedSkill: 'godot-save-system',
    cliCommand: 'orbitkit mcp add godot-gut-runner',
    descEs:
      'Ejecuta suites de pruebas unitarias GUT en modo headless y transmite los resultados pass/fail en vivo al agente de IA.',
    descEn:
      'Executes GUT unit test suites in headless mode and streams live pass/fail assertions directly to your AI coding agent.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="8" fill="#f43f5e" fillOpacity="0.2" />
        <path
          d="M24 10L35 15V24C35 31.5 29.8 36.8 24 39C18.2 36.8 13 31.5 13 24V15L24 10Z"
          stroke="#fb7185"
          strokeWidth="2.5"
        />
        <path d="M19 24.5L22.5 28L29.5 20.5" stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'enet',
    name: 'ENet & Multiplayer',
    categoryEs: 'Redes Autoridad Servidor & RPC',
    categoryEn: 'Authoritative Netcode & RPC',
    brandColor: '#eab308',
    connectedMcp: 'godot-docs',
    connectedSkill: 'godot-multiplayer-enet',
    cliCommand: 'orbitkit skill install godot-multiplayer-enet',
    descEs:
      'Arquitectura multijugador con ENetMultiplayerPeer, anotaciones @rpc seguras, MultiplayerSpawner y sincronización de estado.',
    descEn:
      'Multiplayer architecture using ENetMultiplayerPeer, secure @rpc annotations, MultiplayerSpawner, and state replication.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="8" fill="#eab308" fillOpacity="0.2" />
        <circle cx="24" cy="14" r="3.5" fill="#facc15" />
        <circle cx="14" cy="32" r="3.5" fill="#facc15" />
        <circle cx="34" cy="32" r="3.5" fill="#facc15" />
        <path d="M24 18L16 29M24 18L32 29M18 32H30" stroke="#fde047" strokeWidth="2" />
      </svg>
    )
  }
];

interface Props {
  lang: Language;
}

export function EcosystemCarousel({ lang }: Props) {
  const [selectedTool, setSelectedTool] = useState<EcosystemTool>(ECOSYSTEM_TOOLS[1]); // Default Blender 3D
  const [copied, setCopied] = useState(false);

  const handleCopy = (cmd: string) => {
    void safeCopyToClipboard(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 relative z-10 border-t border-godot-border/60">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em] [text-wrap:balance]">
          {lang === 'es'
            ? 'Godot, Blender y tus herramientas en órbita'
            : 'Godot, Blender & your tools in sync'}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed [text-wrap:pretty]">
          {lang === 'es'
            ? 'Selecciona cualquier componente para inspeccionar su conexión nativa mediante AI Skills y servidores MCP.'
            : 'Select any tool below to inspect its native bridge through AI Skills and MCP servers.'}
        </p>
      </div>

      {/* Accessible Interactive Ecosystem Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {ECOSYSTEM_TOOLS.map((tool) => {
            const isSelected = selectedTool.id === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setSelectedTool(tool)}
                className={`text-left p-3.5 sm:p-4 rounded-xl border transition cursor-pointer select-none ${
                  isSelected
                    ? 'bg-godot-card border-godot-400/80 ring-1 ring-godot-400/50'
                    : 'bg-godot-card/70 border-godot-border hover:border-slate-400 hover:bg-godot-card'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="shrink-0">{tool.renderLogo()}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-xs sm:text-sm truncate">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {lang === 'es' ? tool.categoryEs : tool.categoryEn}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-godot-border/60 flex items-center justify-between gap-1.5 text-xs font-mono text-slate-300">
                  <span className="truncate text-godot-300">{tool.connectedMcp}</span>
                  <span className="truncate text-purple-300">{tool.connectedSkill}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Tool Inspector Workbench (Flat Layout, Zero Nested Cards) */}
      <div className="max-w-5xl mx-auto px-4 mt-12 pt-8 border-t border-godot-border/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Tool Identity Column */}
          <div className="lg:col-span-5 flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-godot-card border border-godot-border shrink-0">
              {selectedTool.renderLogo()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selectedTool.brandColor }}
                />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  {lang === 'es' ? selectedTool.categoryEs : selectedTool.categoryEn}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">{selectedTool.name}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed [text-wrap:pretty]">
                {lang === 'es' ? selectedTool.descEs : selectedTool.descEn}
              </p>
            </div>
          </div>

          {/* Structured Telemetry Details */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-godot-card border border-godot-border">
                <div className="text-xs text-slate-400 uppercase font-mono">MCP Server</div>
                <div className="font-mono font-semibold text-white truncate mt-1">
                  {selectedTool.connectedMcp}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-godot-card border border-godot-border">
                <div className="text-xs text-slate-400 uppercase font-mono">AI Skill</div>
                <div className="font-mono font-semibold text-white truncate mt-1">
                  {selectedTool.connectedSkill}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-godot-card border border-emerald-500/40">
                <div className="text-xs text-slate-400 uppercase font-mono">Status</div>
                <div className="font-mono font-semibold text-emerald-400 flex items-center mt-1">
                  Ready <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>

            {/* Command Bar */}
            <div className="flex items-center justify-between bg-godot-card px-4 py-2.5 rounded-lg border border-godot-border">
              <code className="text-xs sm:text-sm font-mono text-godot-300 truncate mr-3">
                $ {selectedTool.cliCommand}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(selectedTool.cliCommand)}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#23689b] hover:bg-[#2d7bb6] text-white text-xs font-semibold transition shrink-0 border border-godot-400/30"
              >
                <span className="inline-flex mr-1.5 shrink-0">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </span>
                <span>
                  {copied
                    ? lang === 'es'
                      ? 'Copiado'
                      : 'Copied'
                    : lang === 'es'
                    ? 'Copiar Comando'
                    : 'Copy Command'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
