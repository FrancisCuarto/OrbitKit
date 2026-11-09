import React, { useState } from 'react';
import { Copy, Check, Sparkles, Layers, Bot, Cpu, ArrowRight } from 'lucide-react';
import { Language } from '../content/translations';
import { Tilt3DCard } from './Tilt3DCard';

export interface EcosystemTool {
  id: string;
  name: string;
  categoryEs: string;
  categoryEn: string;
  brandColor: string;
  glowClass: string;
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
    glowClass: 'from-[#478cbf]/30 to-[#478cbf]/5 border-[#478cbf]/50',
    connectedMcp: 'godot-engine-bridge',
    connectedSkill: 'godot4-syntax-guardian',
    cliCommand: 'orbitkit mcp add godot-engine-bridge',
    descEs:
      'Control directo del editor Godot 4, ejecución en vivo, lectura de consola de errores y validación estricta de sintaxis GDScript 4.3+.',
    descEn:
      'Direct Godot 4 editor control, live game execution, runtime error console streaming, and strict GDScript 4.3+ syntax enforcement.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#478cbf" fillOpacity="0.18" />
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
    glowClass: 'from-[#f5792a]/30 to-[#265787]/10 border-[#f5792a]/50',
    connectedMcp: 'godot-scene-inspector',
    connectedSkill: 'godot-blender-pipeline',
    cliCommand: 'orbitkit skill install godot-blender-pipeline',
    descEs:
      'Sincroniza pipelines de importación .blend y glTF 2.0, sufijos de colisión (-col, -convcol), Skeleton3D BoneMap y materiales PBR en Godot 4.',
    descEn:
      'Synchronizes .blend and glTF 2.0 import pipelines, collision suffixes (-col, -convcol), Skeleton3D BoneMap, and PBR materials in Godot 4.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#f5792a" fillOpacity="0.16" />
        {/* Blender Iconic Orange Ring + Blue Inner Core */}
        <path
          d="M27.5 11L15 21.5M27.5 16L11 19.5M26.5 19C20.7 19 16 23.2 16 28.5C16 33.8 20.7 38 26.5 38C32.3 38 37 33.8 37 28.5C37 23.2 32.3 19 26.5 19Z"
          stroke="#f5792a"
          strokeWidth="3.8"
          strokeLinecap="round"
        />
        <circle cx="26.5" cy="28.5" r="5" fill="#265787" stroke="#69a7d0" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: 'ctx7',
    name: 'Context7 (ctx7)',
    categoryEs: 'Documentación en Tiempo Real',
    categoryEn: 'Live Versioned Docs MCP',
    brandColor: '#10b981',
    glowClass: 'from-[#10b981]/30 to-[#10b981]/5 border-[#10b981]/50',
    connectedMcp: 'ctx7',
    connectedSkill: 'ctx7-docs-fetcher',
    cliCommand: 'orbitkit mcp add ctx7',
    descEs:
      'Inyecta documentación oficial actualizada y ejemplos verificados desde Upstash Context7 directo al prompt de tu IA para eliminar alucinaciones.',
    descEn:
      'Injects up-to-date official documentation and verified examples from Upstash Context7 straight into your AI prompt to eliminate hallucinations.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#10b981" fillOpacity="0.16" />
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
    glowClass: 'from-[#d97757]/30 to-[#d97757]/5 border-[#d97757]/50',
    connectedMcp: 'godot-lsp',
    connectedSkill: 'gdscript-fsm-master',
    cliCommand: 'orbitkit init',
    descEs:
      'Configura automáticamente .agents/skills/, .claude/skills/ y .mcp.json para que tus agentes programen arquitecturas limpias en Godot 4.',
    descEn:
      'Automatically configures .agents/skills/, .claude/skills/, and .mcp.json so your coding agents build clean architectures in Godot 4.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#d97757" fillOpacity="0.16" />
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
    glowClass: 'from-[#38bdf8]/30 to-[#38bdf8]/5 border-[#38bdf8]/50',
    connectedMcp: 'godot-lsp',
    connectedSkill: 'godot4-syntax-guardian',
    cliCommand: 'orbitkit mcp add godot-lsp',
    descEs:
      'Conecta tu editor con el servidor de lenguaje nativo de Godot en el puerto 6005 para autocompletado tipado y diagnóstico instantáneo.',
    descEn:
      'Bridges your IDE to Godot’s native Language Server on port 6005 for typed autocompletion and instant compiler diagnostics.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#38bdf8" fillOpacity="0.16" />
        <path
          d="M14 17L24 11L34 17V31L24 37L14 31V17Z"
          stroke="#38bdf8"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <path d="M14 17L24 23L34 17M24 23V37" stroke="#7dd3fc" strokeWidth="2.2" />
      </svg>
    )
  },
  {
    id: 'gdshader',
    name: 'GDShader & Vulkan VFX',
    categoryEs: 'Shaders 2D / 3D & Post-Proceso',
    categoryEn: '2D / 3D Shaders & Post-Process',
    brandColor: '#a855f7',
    glowClass: 'from-[#a855f7]/30 to-[#a855f7]/5 border-[#a855f7]/50',
    connectedMcp: 'godot-docs',
    connectedSkill: 'godot-shader-vfx',
    cliCommand: 'orbitkit skill install godot-shader-vfx',
    descEs:
      'Domina shaders canvas_item y spatial en Vulkan/Forward+, distorsión UV, disolución procedural y optimización de GPU.',
    descEn:
      'Master canvas_item and spatial shaders in Vulkan/Forward+, UV distortion, procedural dissolve, and GPU optimization.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#a855f7" fillOpacity="0.16" />
        <polygon
          points="24,10 37,34 11,34"
          stroke="#c084fc"
          strokeWidth="3"
          fill="#a855f7"
          fillOpacity="0.35"
        />
        <circle cx="24" cy="26" r="4" fill="#e9d5ff" />
      </svg>
    )
  },
  {
    id: 'aseprite',
    name: 'Aseprite & TileMapLayer',
    categoryEs: ' Arte 2D, Sprites & Autotiling',
    categoryEn: '2D Art, Sprites & Autotiling',
    brandColor: '#ec4899',
    glowClass: 'from-[#ec4899]/30 to-[#ec4899]/5 border-[#ec4899]/50',
    connectedMcp: 'godot-scene-inspector',
    connectedSkill: 'godot-procedural-generation',
    cliCommand: 'orbitkit skill install godot-procedural-generation',
    descEs:
      'Generación procedural de mapas 2D con TileMapLayer (Godot 4.3+), autotiling por bitmask, FastNoiseLite y pathfinding AStarGrid2D.',
    descEn:
      'Procedural 2D map generation using TileMapLayer (Godot 4.3+), terrain bitmask autotiling, FastNoiseLite, and AStarGrid2D pathfinding.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#ec4899" fillOpacity="0.16" />
        <rect x="13" y="13" width="22" height="22" rx="4" stroke="#f472b6" strokeWidth="2.8" />
        <rect x="18" y="19" width="4" height="6" fill="#f472b6" />
        <rect x="26" y="19" width="4" height="6" fill="#f472b6" />
      </svg>
    )
  },
  {
    id: 'gut',
    name: 'GUT Unit Testing',
    categoryEs: 'Testing Automatizado en Godot',
    categoryEn: 'Automated Godot Unit Testing',
    brandColor: '#f43f5e',
    glowClass: 'from-[#f43f5e]/30 to-[#f43f5e]/5 border-[#f43f5e]/50',
    connectedMcp: 'godot-gut-runner',
    connectedSkill: 'godot-save-system',
    cliCommand: 'orbitkit mcp add godot-gut-runner',
    descEs:
      'Ejecuta suites de pruebas unitarias GUT en modo headless y transmite los resultados pass/fail en vivo al agente de IA.',
    descEn:
      'Executes GUT unit test suites in headless mode and streams live pass/fail assertions directly to your AI coding agent.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#f43f5e" fillOpacity="0.16" />
        <path
          d="M24 10L35 15V24C35 31.5 29.8 36.8 24 39C18.2 36.8 13 31.5 13 24V15L24 10Z"
          stroke="#fb7185"
          strokeWidth="2.6"
        />
        <path d="M19 24.5L22.5 28L29.5 20.5" stroke="#fda4af" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'enet',
    name: 'ENet & Multiplayer',
    categoryEs: 'Redes Autoridad de Servidor & RPC',
    categoryEn: 'Authoritative Netcode & RPC',
    brandColor: '#eab308',
    glowClass: 'from-[#eab308]/30 to-[#eab308]/5 border-[#eab308]/50',
    connectedMcp: 'godot-docs',
    connectedSkill: 'godot-multiplayer-enet',
    cliCommand: 'orbitkit skill install godot-multiplayer-enet',
    descEs:
      'Arquitectura multijugador con ENetMultiplayerPeer, anotaciones @rpc seguras, MultiplayerSpawner y sincronización de estado.',
    descEn:
      'Multiplayer architecture using ENetMultiplayerPeer, secure @rpc annotations, MultiplayerSpawner, and state replication.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#eab308" fillOpacity="0.16" />
        <circle cx="24" cy="14" r="4" fill="#facc15" />
        <circle cx="14" cy="32" r="4" fill="#facc15" />
        <circle cx="34" cy="32" r="4" fill="#facc15" />
        <path d="M24 18L16 29M24 18L32 29M18 32H30" stroke="#fde047" strokeWidth="2.2" />
      </svg>
    )
  },
  {
    id: 'blockbench',
    name: 'Blockbench & glTF 2.0',
    categoryEs: 'Modelos Low-Poly & Animación',
    categoryEn: 'Low-Poly Meshes & Animation',
    brandColor: '#3b82f6',
    glowClass: 'from-[#3b82f6]/30 to-[#3b82f6]/5 border-[#3b82f6]/50',
    connectedMcp: 'godot-scene-inspector',
    connectedSkill: 'godot-responsive-ui',
    cliCommand: 'orbitkit mcp add godot-scene-inspector',
    descEs:
      'Inspección segura de jerarquías de nodos .tscn, mallas glTF 2.0, Skeleton3D y AnimationPlayer sin corromper UIDs.',
    descEn:
      'Safe inspection of .tscn node hierarchies, glTF 2.0 meshes, Skeleton3D, and AnimationPlayer trees without corrupting UIDs.',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
        <rect width="48" height="48" rx="12" fill="#3b82f6" fillOpacity="0.16" />
        <rect x="13" y="16" width="16" height="16" stroke="#60a5fa" strokeWidth="2.5" />
        <rect x="19" y="12" width="16" height="16" stroke="#93c5fd" strokeWidth="2.5" />
      </svg>
    )
  }
];

interface Props {
  lang: Language;
}

export function EcosystemCarousel({ lang }: Props) {
  const [selectedTool, setSelectedTool] = useState<EcosystemTool>(ECOSYSTEM_TOOLS[1]); // Default highlight Blender 3D / Godot
  const [copied, setCopied] = useState(false);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Duplicate array for seamless infinite CSS marquee loop
  const rowOne = [...ECOSYSTEM_TOOLS, ...ECOSYSTEM_TOOLS];
  const rowTwo = [...ECOSYSTEM_TOOLS.slice().reverse(), ...ECOSYSTEM_TOOLS.slice().reverse()];

  return (
    <section className="py-20 relative overflow-hidden border-t border-godot-border/60">
      {/* Subtle 3D radial background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${selectedTool.brandColor}14, transparent 70%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 mb-12 text-center space-y-3">
        <span className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-godot-300 bg-godot-500/10 border border-godot-500/30 px-3.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-godot-400" />
          <span>
            {lang === 'es'
              ? 'Ecosistema 3D Conectado • Skills + MCPs'
              : 'Connected 3D Ecosystem • Skills + MCPs'}
          </span>
        </span>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {lang === 'es'
            ? 'Godot, Blender y tus herramientas en órbita.'
            : 'Godot, Blender & your tools in sync.'}
        </h2>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          {lang === 'es'
            ? 'Haz clic o pasa el cursor sobre cualquier herramienta del carrusel 3D para explorar cómo OrbitKit la conecta mediante AI Skills y servidores MCP.'
            : 'Click or hover any tool in the 3D carousel to inspect how OrbitKit bridges it via curated AI Skills and MCP servers.'}
        </p>
      </div>

      {/* 3D Perspective Infinite Carousel Container */}
      <div className="relative space-y-5 py-4 mask-fade-edges" style={{ perspective: '1200px' }}>
        {/* Track 1: Left-to-Right Marquee */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-5 px-4">
          {rowOne.map((tool, index) => {
            const isSelected = selectedTool.id === tool.id;
            return (
              <button
                key={`row1-${tool.id}-${index}`}
                onClick={() => setSelectedTool(tool)}
                onMouseEnter={() => setSelectedTool(tool)}
                className={`group relative w-72 text-left p-4 rounded-2xl bg-gradient-to-br ${tool.glowClass} bg-godot-card/90 border transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-2xl ${
                  isSelected ? 'ring-2 ring-white/40 scale-[1.02]' : 'opacity-90 hover:opacity-100'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: isSelected ? `0 12px 32px -8px ${tool.brandColor}45` : undefined
                }}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="shrink-0 transform group-hover:rotate-6 group-hover:scale-110 transition duration-300">
                    {tool.renderLogo()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-sm truncate group-hover:text-godot-200 transition">
                      {tool.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {lang === 'es' ? tool.categoryEs : tool.categoryEn}
                    </p>
                  </div>
                </div>

                {/* Connected Badges */}
                <div className="mt-3.5 pt-2.5 border-t border-godot-border/60 flex items-center justify-between gap-2 text-[10px] font-mono">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-godot-950/90 text-godot-300 border border-godot-border truncate">
                    <Layers className="w-2.5 h-2.5 mr-1 shrink-0 text-godot-400" />
                    {tool.connectedMcp}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-godot-950/90 text-purple-300 border border-purple-500/30 truncate">
                    <Bot className="w-2.5 h-2.5 mr-1 shrink-0 text-purple-400" />
                    {tool.connectedSkill}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Track 2: Right-to-Left Marquee */}
        <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused] gap-5 px-4">
          {rowTwo.map((tool, index) => {
            const isSelected = selectedTool.id === tool.id;
            return (
              <button
                key={`row2-${tool.id}-${index}`}
                onClick={() => setSelectedTool(tool)}
                onMouseEnter={() => setSelectedTool(tool)}
                className={`group relative w-72 text-left p-4 rounded-2xl bg-gradient-to-br ${tool.glowClass} bg-godot-card/90 border transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-2xl ${
                  isSelected ? 'ring-2 ring-white/40 scale-[1.02]' : 'opacity-90 hover:opacity-100'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: isSelected ? `0 12px 32px -8px ${tool.brandColor}45` : undefined
                }}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="shrink-0 transform group-hover:-rotate-6 group-hover:scale-110 transition duration-300">
                    {tool.renderLogo()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-sm truncate group-hover:text-godot-200 transition">
                      {tool.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {lang === 'es' ? tool.categoryEs : tool.categoryEn}
                    </p>
                  </div>
                </div>

                {/* Connected Badges */}
                <div className="mt-3.5 pt-2.5 border-t border-godot-border/60 flex items-center justify-between gap-2 text-[10px] font-mono">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-godot-950/90 text-godot-300 border border-godot-border truncate">
                    <Layers className="w-2.5 h-2.5 mr-1 shrink-0 text-godot-400" />
                    {tool.connectedMcp}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-godot-950/90 text-purple-300 border border-purple-500/30 truncate">
                    <Bot className="w-2.5 h-2.5 mr-1 shrink-0 text-purple-400" />
                    {tool.connectedSkill}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive 3D Bridge Spotlight Inspector */}
      <div className="max-w-5xl mx-auto px-4 mt-10">
        <Tilt3DCard
          intensity={6}
          glareColor={`${selectedTool.brandColor}28`}
          className="rounded-3xl bg-godot-card/95 border border-godot-border p-6 sm:p-8 shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Tool Identity */}
            <div className="lg:col-span-5 flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-godot-950 border border-godot-border shrink-0 shadow-inner">
                {selectedTool.renderLogo()}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{ backgroundColor: selectedTool.brandColor }}
                  />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    {lang === 'es' ? selectedTool.categoryEs : selectedTool.categoryEn}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">{selectedTool.name}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'es' ? selectedTool.descEs : selectedTool.descEn}
                </p>
              </div>
            </div>

            {/* 3D Animated Bridge Flow Diagram */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4 bg-godot-950/80 p-4 sm:p-5 rounded-2xl border border-godot-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
                <div className="p-3 rounded-xl bg-godot-card border border-godot-border flex items-center space-x-2.5">
                  <Layers className="w-4 h-4 text-godot-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] text-slate-400 uppercase">MCP Server</div>
                    <div className="font-mono font-semibold text-white truncate">
                      {selectedTool.connectedMcp}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-godot-card border border-godot-border flex items-center space-x-2.5">
                  <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] text-slate-400 uppercase">AI Skill</div>
                    <div className="font-mono font-semibold text-white truncate">
                      {selectedTool.connectedSkill}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-godot-card border border-emerald-500/30 flex items-center space-x-2.5">
                  <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] text-slate-400 uppercase">Status</div>
                    <div className="font-mono font-semibold text-emerald-400 flex items-center">
                      Ready <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Command Bar */}
              <div className="flex items-center justify-between bg-black/60 px-4 py-2.5 rounded-xl border border-godot-border">
                <code className="text-xs sm:text-sm font-mono text-godot-300 truncate mr-3">
                  $ {selectedTool.cliCommand}
                </code>
                <button
                  onClick={() => handleCopy(selectedTool.cliCommand)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-godot-500 hover:bg-godot-400 text-white text-xs font-semibold transition shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      {lang === 'es' ? 'Copiado' : 'Copied'}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      {lang === 'es' ? 'Copiar Comando' : 'Copy Command'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Tilt3DCard>
      </div>
    </section>
  );
}
