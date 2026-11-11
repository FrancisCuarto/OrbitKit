import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Workflow,
  Terminal,
  CheckCircle2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Zap,
  Boxes,
  Code2,
  Flame,
  Radio,
  ExternalLink
} from 'lucide-react';
import { Language } from '../content/translations';
import { safeCopyToClipboard } from '../utils/clipboard';

export interface GameEngineV1 {
  id: string;
  name: string;
  versionTarget: string;
  badgeEs: string;
  badgeEn: string;
  statusEs: 'Disponible hoy (v0.7.0)' | 'En Desarrollo Activo' | 'Diseñado para v1.0.0';
  statusEn: 'Available Today (v0.7.0)' | 'In Active Development' | 'Designed for v1.0.0';
  statusColor: string;
  color: string;
  languages: string[];
  skillsCount: string;
  descEs: string;
  descEn: string;
  skills: {
    name: string;
    descriptionEs: string;
    descriptionEn: string;
  }[];
  mcpServers: {
    name: string;
    descriptionEs: string;
    descriptionEn: string;
    portOrProto: string;
  }[];
  automations: {
    titleEs: string;
    titleEn: string;
    descEs: string;
    descEn: string;
  }[];
  previewCommand: string;
  renderLogo: () => React.ReactNode;
}

export const GAME_ENGINES_V1: GameEngineV1[] = [
  {
    id: 'godot',
    name: 'Godot Engine',
    versionTarget: 'v4.3 / 4.4+',
    badgeEs: 'Motor Insignia',
    badgeEn: 'Flagship Engine',
    statusEs: 'Disponible hoy (v0.7.0)',
    statusEn: 'Available Today (v0.7.0)',
    statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    color: '#478cbf',
    languages: ['GDScript 4.3+', 'C# (.NET 8)', 'GDExtension C++'],
    skillsCount: '9 Skills',
    descEs:
      'La base probada de VGSkillFrame: eliminación total de alucinaciones de Godot 3, puente GDScript LSP en tiempo real y grabador de vuelo Blackbox.',
    descEn:
      'The battle-tested foundation of VGSkillFrame: complete elimination of Godot 3 hallucinations, real-time GDScript LSP bridge, and Blackbox flight recorder.',
    skills: [
      {
        name: 'godot4-syntax-guardian',
        descriptionEs: 'Prohíbe sintaxis de Godot 3 y fuerza TileMapLayer, FileAccess y tipado estricto.',
        descriptionEn: 'Enforces strict GDScript 4.3+ typing, TileMapLayer, and prevents legacy Godot 3 syntax.'
      },
      {
        name: 'gdscript-fsm-master',
        descriptionEs: 'Máquinas de estado finitas modulares y desacopladas para control de personajes y combat AI.',
        descriptionEn: 'Modular, decoupled Finite State Machine architecture for characters and combat AI.'
      },
      {
        name: 'godot-gdextension-cxx',
        descriptionEs: 'Generación y bindings C++ nativos con GDExtension para tareas de máximo rendimiento.',
        descriptionEn: 'Native C++ bindings generation and memory management via GDExtension for heavy compute.'
      }
    ],
    mcpServers: [
      {
        name: 'godot-lsp',
        descriptionEs: 'Transmite errores del compilador y autocompletado en vivo a Claude y Cursor.',
        descriptionEn: 'Streams real-time compiler diagnostics and auto-completions to AI agents.',
        portOrProto: 'TCP 6005'
      },
      {
        name: 'godot-engine-bridge',
        descriptionEs: 'Control del editor: recarga de scripts en caliente y volcado de jerarquías .tscn.',
        descriptionEn: 'Live editor control: hot script reload and live .tscn scene tree reflection.',
        portOrProto: 'IPC / WebSocket'
      }
    ],
    automations: [
      {
        titleEs: 'Blackbox Flight Recorder',
        titleEn: 'Blackbox Flight Recorder',
        descEs: 'Captura instantáneas del árbol de nodos y genera prompts de diagnóstico automático al crashear el juego.',
        descEn: 'Captures node hierarchy snapshots and outputs AI diagnostic prompts on game crashes.'
      },
      {
        titleEs: 'CI/CD Headless Export & GUT Runner',
        titleEn: 'CI/CD Headless Export & GUT Runner',
        descEs: 'Exportación a PC/Web/Mobile y ejecución headless de pruebas unitarias GUT con reporte JUnit.',
        descEn: 'Automated multiplatform export and headless GUT test execution with JUnit reports.'
      }
    ],
    previewCommand: 'vgskillframe init --engine=godot',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#478cbf" fillOpacity="0.18" />
        <path
          d="M24 10C15.2 10 8 16.5 8 24.6C8 32.8 15.2 39.3 24 39.3C32.8 39.3 40 32.8 40 24.6C40 16.5 32.8 10 24 10ZM18 20C19.3 20 20.4 21 20.4 22.3C20.4 23.6 19.3 24.6 18 24.6C16.7 24.6 15.6 23.6 15.6 22.3C15.6 21 16.7 20 18 20ZM30 20C31.3 20 32.4 21 32.4 22.3C32.4 23.6 31.3 24.6 30 24.6C28.7 24.6 27.6 23.6 27.6 22.3C27.6 21 28.7 20 30 20ZM24 33.8C19.5 33.8 15.8 31 15 27.2H33C32.2 31 28.5 33.8 24 33.8Z"
          fill="#478cbf"
        />
      </svg>
    )
  },
  {
    id: 'unreal',
    name: 'Unreal Engine 5',
    versionTarget: 'UE 5.4 / 5.5',
    badgeEs: 'Triple A & C++',
    badgeEn: 'AAA & C++',
    statusEs: 'En Desarrollo Activo',
    statusEn: 'In Active Development',
    statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    color: '#0e1117',
    languages: ['Modern C++ (C++20)', 'Blueprints Reflection', 'Python Remote'],
    skillsCount: '8 Skills',
    descEs:
      'Asistente de IA para proyectos de alta gama: generación estricta de macros UCLASS/UPROPERTY, Gameplay Ability System (GAS), Enhanced Input y shaders Niagara.',
    descEn:
      'AI assistant for AAA architectures: strict UCLASS/UPROPERTY macro generation, Gameplay Ability System (GAS), Enhanced Input, and Niagara VFX.',
    skills: [
      {
        name: 'ue5-gas-architect',
        descriptionEs: 'Diseño e implementación de Gameplay Ability System, Gameplay Tags, Attributes y Gameplay Effects.',
        descriptionEn: 'Full Gameplay Ability System architecture, Gameplay Tags, AttributeSets, and Gameplay Effects.'
      },
      {
        name: 'ue5-subobject-lifecycle',
        descriptionEs: 'Elimina memory leaks en C++, fuerza CreateDefaultSubobject y gestiona la recolección de basura UObject.',
        descriptionEn: 'Prevents C++ memory leaks, enforces CreateDefaultSubobject, and manages UObject GC lifecycles.'
      },
      {
        name: 'ue5-enhanced-input',
        descriptionEs: 'Mapeo modular de Input Actions, Input Mapping Contexts y disparadores analógicos responsivos.',
        descriptionEn: 'Modular Input Actions, Input Mapping Contexts, and chorded analog triggers.'
      }
    ],
    mcpServers: [
      {
        name: 'unreal-remote-mcp',
        descriptionEs: 'Conexión vía Unreal Remote Python API para inspeccionar actores, compilar y ejecutar comandos en el editor.',
        descriptionEn: 'Connects via Unreal Remote Python API to inspect World Outliner, trigger compiles, and run automation scripts.',
        portOrProto: 'HTTP / REST (2049)'
      },
      {
        name: 'unreal-log-streamer',
        descriptionEs: 'Monitoreo en vivo de Output Log y extracción de stack traces de crash de Unreal Engine.',
        descriptionEn: 'Live Output Log telemetry streaming and automated Unreal Engine crash dump parsing.',
        portOrProto: 'IPC / Named Pipe'
      }
    ],
    automations: [
      {
        titleEs: 'RunUAT Cooking & Packaging',
        titleEn: 'RunUAT Cooking & Packaging',
        descEs: 'Dispara y monitorea empaquetado de builds desatendidas con filtrado inteligente de errores de compilación.',
        descEn: 'Automated unattended cooking, staging, and packaging with smart compiler error filtering.'
      },
      {
        titleEs: 'Gauntlet Automated Testing',
        titleEn: 'Gauntlet Automated Testing',
        descEs: 'Orquesta pruebas funcionales de Gameplay automáticas y genera resúmenes para el asistente de IA.',
        descEn: 'Runs automated Gauntlet gameplay tests and feeds failure logs directly to AI agents.'
      }
    ],
    previewCommand: 'vgskillframe engine add unreal',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#ffffff" fillOpacity="0.1" />
        <circle cx="24" cy="24" r="14" stroke="#ffffff" strokeWidth="2.5" />
        <path
          d="M24 16V26M24 26L20 22M24 26L28 22M20 32H28"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    id: 'unity',
    name: 'Unity',
    versionTarget: 'Unity 6 / 2022 LTS',
    badgeEs: 'C# & DOTS',
    badgeEn: 'C# & DOTS',
    statusEs: 'En Desarrollo Activo',
    statusEn: 'In Active Development',
    statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    color: '#222c37',
    languages: ['C# 12 (.NET 8/9)', 'DOTS / Entities 1.0', 'Shader Graph / URP'],
    skillsCount: '7 Skills',
    descEs:
      'Ecosistema C# para Unity: arquitectura orientada a datos (DOTS/ECS), Job System sin alocaciones de GC, sincronización UPM en package.json y Addressables.',
    descEn:
      'C# ecosystem for Unity: Data-Oriented Technology Stack (DOTS/ECS), zero-GC allocation Job System, UPM manifest sync, and Addressables.',
    skills: [
      {
        name: 'unity-dots-ecs-master',
        descriptionEs: 'Implementación estricta de IComponentData, IJobEntity, SystemAPI y Queries sin recolección de basura.',
        descriptionEn: 'Strict IComponentData, IJobEntity, SystemAPI, and zero-allocation entity query patterns.'
      },
      {
        name: 'unity-gc-optimizer',
        descriptionEs: 'Detección y prevención de boxing, closures en Update() y optimización de cachés de componentes.',
        descriptionEn: 'Prevents boxing, closures inside Update(), and enforces cached component lookups.'
      },
      {
        name: 'unity-urp-shader-graph',
        descriptionEs: 'Sub-grafos reutilizables, passes de renderizado personalizados y optimización de Fillrate para móviles.',
        descriptionEn: 'Custom render passes, reusable sub-graphs, and mobile GPU fillrate optimization.'
      }
    ],
    mcpServers: [
      {
        name: 'unity-roslyn-bridge',
        descriptionEs: 'Puente directo con el servidor de análisis Roslyn de Unity para diagnósticos de código en tiempo real.',
        descriptionEn: 'Direct bridge with Unity Roslyn analyzers for real-time semantic diagnostics.',
        portOrProto: 'WebSocket 55000'
      },
      {
        name: 'unity-scene-hierarchy-mcp',
        descriptionEs: 'Inspecciona GameObjects, componentes y referencias de assets serializados sin abrir la ventana.',
        descriptionEn: 'Inspects live GameObjects, attached MonoBehaviours, and serialized GUID references.',
        portOrProto: 'JSON-RPC'
      }
    ],
    automations: [
      {
        titleEs: 'Unity Headless Test Runner',
        titleEn: 'Unity Headless Test Runner',
        descEs: 'Ejecución de tests en modo -batchmode -runTests con reporte instantáneo a la consola del desarrollador.',
        descEn: 'Runs PlayMode and EditMode test suites in -batchmode with instant terminal telemetry.'
      },
      {
        titleEs: 'UPM Manifest Automator',
        titleEn: 'UPM Manifest Automator',
        descEs: 'Resuelve dependencias de paquetes Git y Scoped Registries sin corromper packages/manifest.json.',
        descEn: 'Resolves Git packages and Scoped Registries safely without corrupting packages/manifest.json.'
      }
    ],
    previewCommand: 'vgskillframe engine add unity',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#ffffff" fillOpacity="0.1" />
        <path
          d="M24 12L34 18V30L24 36L14 30V18L24 12Z"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M24 24L34 18M24 24V36M24 24L14 18" stroke="#ffffff" strokeWidth="2.2" />
      </svg>
    )
  },
  {
    id: 'bevy',
    name: 'Bevy Engine',
    versionTarget: 'Bevy 0.14 / 0.15',
    badgeEs: 'Rust & ECS Puro',
    badgeEn: 'Rust & Pure ECS',
    statusEs: 'Diseñado para v1.0.0',
    statusEn: 'Designed for v1.0.0',
    statusColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    color: '#2c3e50',
    languages: ['Rust 2021 / 2024', 'Bevy ECS', 'WGSL Shaders'],
    skillsCount: '6 Skills',
    descEs:
      'El motor de videojuegos en Rust por excelencia: arquitectura ECS pura sin herencia, validación estricta de lifetimes de Rust y sistemas concurrentes ultra-veloces.',
    descEn:
      'The premier data-driven Rust game engine: pure ECS architecture, strict borrow-checker safety, and parallel system schedules.',
    skills: [
      {
        name: 'bevy-schedule-architect',
        descriptionEs: 'Organización de sistemas en Schedules (Startup, Update, FixedUpdate) evitando System Order Ambiguities.',
        descriptionEn: 'Organizes systems across Schedules (Startup, Update, FixedUpdate) avoiding system order ambiguities.'
      },
      {
        name: 'bevy-query-lifetimes',
        descriptionEs: 'Consultas ECS idiomáticas con Query<&mut Transform, With<Player>> y gestión de recursos Resource.',
        descriptionEn: 'Idiomatic ECS queries with Query<&mut Transform, With<Player>> and Res/ResMut lifecycle patterns.'
      }
    ],
    mcpServers: [
      {
        name: 'bevy-inspector-mcp',
        descriptionEs: 'Lectura en vivo de entidades y componentes de la aplicación Bevy en ejecución vía reflect.',
        descriptionEn: 'Inspects live entities, components, and resources in running Bevy games via bevy_reflect.',
        portOrProto: 'TCP Socket'
      }
    ],
    automations: [
      {
        titleEs: 'Cargo Dynamic Linking Fast-Iterate',
        titleEn: 'Cargo Dynamic Linking Fast-Iterate',
        descEs: 'Configura compilación incremental con LLD y dynamic_linking para iterar en menos de 2 segundos.',
        descEn: 'Configures fast incremental linking with LLD and dynamic_linking for sub-2-second rebuild loops.'
      }
    ],
    previewCommand: 'vgskillframe engine add bevy',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#e67e22" fillOpacity="0.18" />
        <circle cx="24" cy="24" r="10" stroke="#e67e22" strokeWidth="2.5" />
        <circle cx="20" cy="22" r="1.5" fill="#e67e22" />
        <circle cx="28" cy="22" r="1.5" fill="#e67e22" />
        <path d="M21 27C22 28.5 26 28.5 27 27" stroke="#e67e22" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'raylib-cpp',
    name: 'Raylib & Custom C++',
    versionTarget: 'Raylib 5.5 / C++20',
    badgeEs: 'Bajo Nivel & C/C++',
    badgeEn: 'Low-Level & C/C++',
    statusEs: 'Diseñado para v1.0.0',
    statusEn: 'Designed for v1.0.0',
    statusColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    color: '#f1f2f6',
    languages: ['C99 / C11', 'Modern C++20', 'GLSL 330 / ES 3.0'],
    skillsCount: '5 Skills',
    descEs:
      'Para creadores de motores propios e indies minimalistas: gestión de memoria sin fugas, bucle de juego manual, matrices OpenGL y compilación multiplataforma con CMake.',
    descEn:
      'For custom engine builders and minimalist indies: leak-free manual memory layout, game loop control, and CMake/Premake workflows.',
    skills: [
      {
        name: 'raylib-pure-c-idioms',
        descriptionEs: 'Modelos de carga RAII/Unload de texturas, modelos y buffers de sonido sin memory leaks.',
        descriptionEn: 'Proper Load/Unload pairing for textures, 3D meshes, and sound buffers with zero memory leaks.'
      },
      {
        name: 'custom-engine-gameloop',
        descriptionEs: 'Bucle de tiempo delta fijo para físicas separadas del renderizado y renderizado desacoplado.',
        descriptionEn: 'Fixed timestep accumulator game loops decoupling deterministic physics from variable refresh render rates.'
      }
    ],
    mcpServers: [
      {
        name: 'clangd-gdb-bridge',
        descriptionEs: 'Conexión directa con clangd LSP y GDB/LLDB para depuración simbólica de memoria en tiempo real.',
        descriptionEn: 'Direct integration with clangd LSP and GDB/LLDB debug server for real-time symbol inspection.',
        portOrProto: 'LSP / GDB MI'
      }
    ],
    automations: [
      {
        titleEs: 'AddressSanitizer (ASan) Memory Guard',
        titleEn: 'AddressSanitizer (ASan) Memory Guard',
        descEs: 'Compilación y ejecución automática con ASan/UBSan para cazar buffer overflows y use-after-free.',
        descEn: 'Automated test execution with ASan/UBSan to catch buffer overflows and use-after-free bugs on save.'
      }
    ],
    previewCommand: 'vgskillframe engine add raylib',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#ffffff" fillOpacity="0.1" />
        <rect x="14" y="14" width="20" height="20" rx="3" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="3" fill="#ffffff" />
      </svg>
    )
  },
  {
    id: 'defold',
    name: 'Defold',
    versionTarget: 'Defold 1.9+',
    badgeEs: 'Lua & 2D Ultraligero',
    badgeEn: 'Lua & Ultra-light 2D',
    statusEs: 'Diseñado para v1.0.0',
    statusEn: 'Designed for v1.0.0',
    statusColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    color: '#d35400',
    languages: ['Lua 5.1 / LuaJIT', 'GLSL', 'Defold Collection Scripts'],
    skillsCount: '4 Skills',
    descEs:
      'El motor rey en peso y velocidad para web y móvil: arquitectura de paso de mensajes (msg.post), Collection Proxies y layouts de GUI reactivos en Lua.',
    descEn:
      'The lightweight champion for Web & Mobile: message-passing architecture (msg.post), Collection Proxies, and responsive Lua GUI layouts.',
    skills: [
      {
        name: 'defold-msg-passing',
        descriptionEs: 'Patrones de comunicación asíncrona entre scripts con msg.post() sin acoplamiento de estado.',
        descriptionEn: 'Clean asynchronous script messaging with msg.post() eliminating state coupling.'
      }
    ],
    mcpServers: [
      {
        name: 'defold-bob-mcp',
        descriptionEs: 'Control de la herramienta de compilación Bob de Defold para empaquetado desatendido.',
        descriptionEn: 'Automates Defold Bob build tool for headless packaging and asset bundle verification.',
        portOrProto: 'CLI / Pipe'
      }
    ],
    automations: [
      {
        titleEs: 'Atlas Texture Packer & Mobile Bundle',
        titleEn: 'Atlas Texture Packer & Mobile Bundle',
        descEs: 'Generación automática de atlas optimizados y builds HTML5 WebAssembly en un comando.',
        descEn: 'Automated sprite atlas packing and sub-megabyte HTML5/WebAssembly exports.'
      }
    ],
    previewCommand: 'vgskillframe engine add defold',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#e74c3c" fillOpacity="0.18" />
        <path d="M16 16L32 24L16 32V16Z" fill="#e74c3c" />
      </svg>
    )
  },
  {
    id: 'dcc-blender-houdini',
    name: 'Blender & Houdini DCC',
    versionTarget: 'Blender 4.3 / Houdini 20',
    badgeEs: 'Pipeline 3D & Procedural',
    badgeEn: '3D & Procedural Pipeline',
    statusEs: 'Disponible hoy (v0.7.0)',
    statusEn: 'Available Today (v0.7.0)',
    statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    color: '#e67e22',
    languages: ['Python (bpy)', 'VEX / HDA', 'glTF 2.0 / USD'],
    skillsCount: '6 Skills',
    descEs:
      'El puente 3D definitivo hacia cualquier motor: sufijos de colisión automáticos, Geometry Nodes, remapeo de esqueletos y exportación optimizada de mallas.',
    descEn:
      'The universal 3D bridge to any engine: automated collision hulls, Geometry Nodes, Skeleton3D remapping, and optimized mesh baking.',
    skills: [
      {
        name: 'blender-3d-pipeline',
        descriptionEs: 'Sufijos -col, -convcol, -navmesh y Skeleton3D automáticos para Godot, Unreal y Unity.',
        descriptionEn: 'Automated -col, -convcol, -navmesh suffixes and bone retargeting across all engines.'
      },
      {
        name: 'houdini-hda-gamedev',
        descriptionEs: 'Generación procedural de mundos, LODs automáticos y exportación masiva a glTF/FBX.',
        descriptionEn: 'Procedural world generation, automatic LOD synthesis, and bulk glTF/FBX export.'
      }
    ],
    mcpServers: [
      {
        name: 'blender-socket-mcp',
        descriptionEs: 'Ejecuta scripts Python en Blender en segundo plano para exportaciones y bakes sin abrir la interfaz.',
        descriptionEn: 'Executes headless Python scripts inside Blender for batch baking and mesh processing.',
        portOrProto: 'Local Socket'
      }
    ],
    automations: [
      {
        titleEs: '1-Click Multi-Engine Asset Cooker',
        titleEn: '1-Click Multi-Engine Asset Cooker',
        descEs: 'Exporta simultáneamente mallas optimizadas para Godot (.glb), Unity (.fbx) y Unreal (Nanite).',
        descEn: 'Simultaneously bakes and exports models tuned for Godot (.glb), Unity (.fbx), and Unreal (Nanite).'
      }
    ],
    previewCommand: 'vgskillframe skill install blender-3d-pipeline',
    renderLogo: () => (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#f39c12" fillOpacity="0.18" />
        <circle cx="24" cy="24" r="8" stroke="#f39c12" strokeWidth="2.5" />
        <path d="M24 16L32 10M24 32L32 38M16 24L10 24" stroke="#f39c12" strokeWidth="2.5" />
      </svg>
    )
  }
];

export function RoadmapV1Section({ lang }: { lang: Language }) {
  const [selectedEngineId, setSelectedEngineId] = useState<string>('godot');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const selectedEngine =
    GAME_ENGINES_V1.find((e) => e.id === selectedEngineId) || GAME_ENGINES_V1[0];

  const handleCopy = (cmd: string) => {
    void safeCopyToClipboard(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <section id="roadmap" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 scroll-mt-20">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-godot-500/10 via-purple-500/10 to-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-godot-card border border-godot-400/40 text-godot-300 text-xs font-mono font-semibold tracking-wider uppercase shadow-lg shadow-godot-500/5">
          <Sparkles className="w-3.5 h-3.5 text-godot-400 animate-pulse" />
          <span>{lang === 'es' ? 'Próxima Gran Evolución' : 'Next Major Evolution'}</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-bold">VGSkillFrame v1.0.0</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight [text-wrap:balance]">
          {lang === 'es' ? (
            <>
              El Ecosistema Universal para{' '}
              <span className="bg-gradient-to-r from-godot-300 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                Todos los Motores de Videojuegos
              </span>
            </>
          ) : (
            <>
              The Universal AI Ecosystem for{' '}
              <span className="bg-gradient-to-r from-godot-300 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                Every Major Game Engine
              </span>
            </>
          )}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed [text-wrap:pretty]">
          {lang === 'es'
            ? 'En la versión 1.0.0, VGSkillFrame expande su probado modelo de AI Skills, Servidores MCP y Automatizaciones nativas para conectar tus asistentes de IA (Claude Code, Cursor, Windsurf, Antigravity) a cualquier motor de videojuegos con cero alucinaciones.'
            : 'In version 1.0.0, VGSkillFrame expands its proven AI Skills, MCP Servers, and Native Automations model to connect your AI coding assistants (Claude Code, Cursor, Windsurf, Antigravity) to any game engine with zero hallucination.'}
        </p>

        {/* 3 Core Pillars Pill Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
          <div className="p-3.5 rounded-xl bg-godot-card/80 border border-godot-border flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {lang === 'es' ? '1. AI Skills de Motor' : '1. Engine AI Skills'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                {lang === 'es'
                  ? 'Guardián anti-alucinación por motor y versión (C++, C#, Rust, GDScript, Lua).'
                  : 'Version-locked syntax guards per engine and language (C++, C#, Rust, GDScript, Lua).'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-godot-card/80 border border-godot-border flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {lang === 'es' ? '2. Servidores MCP en Vivo' : '2. Live MCP Bridges'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                {lang === 'es'
                  ? 'Conexión con el editor en ejecución: consola de errores, jerarquías y recarga en caliente.'
                  : 'Live editor bridges: runtime error consoles, scene hierarchies, and hot reloading.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-godot-card/80 border border-godot-border flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {lang === 'es' ? '3. Automatizaciones & CI/CD' : '3. Automations & CI/CD'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                {lang === 'es'
                  ? 'Compilación headless, test runners, empaquetado y caja negra de telemetría.'
                  : 'Headless builds, automated test suites, cooking pipelines, and flight blackbox diagnostics.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Engine Explorer */}
      <div className="rounded-2xl bg-godot-card border border-godot-border shadow-2xl overflow-hidden">
        {/* Top Engine Tabs */}
        <div className="border-b border-godot-border bg-godot-950/80 px-4 py-3 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-2 flex items-center">
            <Boxes className="w-3.5 h-3.5 mr-1 text-godot-400" />
            {lang === 'es' ? 'Motores v1.0:' : 'v1.0 Engines:'}
          </span>
          {GAME_ENGINES_V1.map((eng) => {
            const isSelected = eng.id === selectedEngineId;
            return (
              <button
                key={eng.id}
                type="button"
                onClick={() => setSelectedEngineId(eng.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-[#23689b] text-white border-godot-400 shadow-md shadow-[#23689b]/20'
                    : 'bg-godot-card text-slate-300 border-godot-border/80 hover:text-white hover:border-slate-600'
                }`}
              >
                <div className="shrink-0">{eng.renderLogo()}</div>
                <span>{eng.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    isSelected ? 'bg-white/20 border-white/30 text-white' : eng.statusColor
                  }`}
                >
                  {lang === 'es' ? eng.badgeEs : eng.badgeEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Engine Deep-Dive Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Header of the Selected Engine */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-godot-border/80">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-godot-950 border border-godot-border shadow-inner">
                {selectedEngine.renderLogo()}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-2xl font-black text-white">{selectedEngine.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-godot-950 border border-godot-border text-godot-300">
                    {selectedEngine.versionTarget}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {lang === 'es' ? selectedEngine.descEs : selectedEngine.descEn}
                </p>
              </div>
            </div>

            {/* Status & Preview Command */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-2 shrink-0">
              <span
                className={`text-xs font-mono px-3 py-1 rounded-full border flex items-center ${selectedEngine.statusColor}`}
              >
                <Clock className="w-3 h-3 mr-1.5" />
                {lang === 'es' ? selectedEngine.statusEs : selectedEngine.statusEn}
              </span>

              <div className="flex items-center space-x-1.5 bg-godot-950 px-2.5 py-1.5 rounded-lg border border-godot-border text-xs font-mono text-slate-300">
                <span className="text-godot-400">$</span>
                <code className="text-godot-200">{selectedEngine.previewCommand}</code>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedEngine.previewCommand)}
                  className="p-1 rounded hover:bg-white/10 transition text-slate-400 hover:text-white"
                  title="Copiar comando"
                >
                  {copiedCmd === selectedEngine.previewCommand ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Supported Languages & Architecture Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-2">
              {lang === 'es' ? 'Lenguajes y Tecnologías:' : 'Languages & Stacks:'}
            </span>
            {selectedEngine.languages.map((langTag, i) => (
              <span
                key={i}
                className="text-xs font-mono px-2.5 py-1 rounded-md bg-godot-950 border border-godot-border/80 text-sky-300 font-semibold"
              >
                {langTag}
              </span>
            ))}
          </div>

          {/* Three Feature Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. AI Skills Column */}
            <div className="p-5 rounded-xl bg-godot-950/70 border border-purple-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <Cpu className="w-4 h-4" />
                    <span>{lang === 'es' ? 'AI Skills Especializados' : 'Dedicated AI Skills'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {selectedEngine.skills.length} skills
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedEngine.skills.map((skill, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-godot-card border border-godot-border/70 space-y-1">
                      <div className="text-xs font-mono font-bold text-purple-300 flex items-center">
                        <Code2 className="w-3.5 h-3.5 mr-1.5 text-purple-400 shrink-0" />
                        <span className="truncate">{skill.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">
                        {lang === 'es' ? skill.descriptionEs : skill.descriptionEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-purple-500/20 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                <span>{lang === 'es' ? 'Inyección en .agents/skills y .claude/skills' : 'Injected into .agents & .claude'}</span>
              </div>
            </div>

            {/* 2. MCP Servers Column */}
            <div className="p-5 rounded-xl bg-godot-950/70 border border-sky-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
                  <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <Radio className="w-4 h-4" />
                    <span>{lang === 'es' ? 'Servidores MCP en Vivo' : 'Live MCP Servers'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    {selectedEngine.mcpServers.length} MCPs
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedEngine.mcpServers.map((mcp, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-godot-card border border-godot-border/70 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-300">
                        <span className="truncate">{mcp.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal px-1.5 rounded bg-godot-950">
                          {mcp.portOrProto}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">
                        {lang === 'es' ? mcp.descriptionEs : mcp.descriptionEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-sky-500/20 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                <span>{lang === 'es' ? 'Autoconfigurado en .mcp.json' : 'Auto-configured in .mcp.json'}</span>
              </div>
            </div>

            {/* 3. Automations Column */}
            <div className="p-5 rounded-xl bg-godot-950/70 border border-amber-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <Workflow className="w-4 h-4" />
                    <span>{lang === 'es' ? 'Automatizaciones & CI/CD' : 'Automations & CI/CD'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {selectedEngine.automations.length} workflows
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedEngine.automations.map((auto, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-godot-card border border-godot-border/70 space-y-1">
                      <div className="text-xs font-mono font-bold text-amber-300 flex items-center">
                        <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
                        <span className="truncate">{lang === 'es' ? auto.titleEs : auto.titleEn}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">
                        {lang === 'es' ? auto.descEs : auto.descEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-amber-500/20 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                <span>{lang === 'es' ? 'Ejecución headless o con 1 tecla' : 'Headless or 1-key execution'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Universal CLI Command Workflow Preview */}
        <div className="border-t border-godot-border bg-godot-950 p-6 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-godot-300">
                <Terminal className="w-4 h-4" />
                <span>{lang === 'es' ? 'Flujo Universal de Comandos en v1.0.0:' : 'Universal Command Workflow in v1.0.0:'}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {lang === 'es' ? 'Un solo CLI para todos tus juegos' : 'One CLI for all your games'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-godot-card border border-godot-border flex items-center justify-between">
                <div>
                  <span className="text-slate-400 select-none mr-2">1.</span>
                  <code className="text-emerald-300 font-semibold">vgskillframe scan --all-engines</code>
                </div>
                <span className="text-[10px] text-slate-400">{lang === 'es' ? 'Detecta UE, Unity, Godot, Bevy' : 'Detects UE, Unity, Godot'}</span>
              </div>

              <div className="p-3 rounded-lg bg-godot-card border border-godot-border flex items-center justify-between">
                <div>
                  <span className="text-slate-400 select-none mr-2">2.</span>
                  <code className="text-sky-300 font-semibold">vgskillframe engine add unreal</code>
                </div>
                <span className="text-[10px] text-slate-400">{lang === 'es' ? 'Configura C++ Skills y MCP' : 'Sets up C++ Skills & MCP'}</span>
              </div>

              <div className="p-3 rounded-lg bg-godot-card border border-godot-border flex items-center justify-between">
                <div>
                  <span className="text-slate-400 select-none mr-2">3.</span>
                  <code className="text-purple-300 font-semibold">vgskillframe mcp connect --live</code>
                </div>
                <span className="text-[10px] text-slate-400">{lang === 'es' ? 'Conecta con el editor abierto' : 'Bridges running editor'}</span>
              </div>

              <div className="p-3 rounded-lg bg-godot-card border border-godot-border flex items-center justify-between">
                <div>
                  <span className="text-slate-400 select-none mr-2">4.</span>
                  <code className="text-amber-300 font-semibold">vgskillframe automate test --all</code>
                </div>
                <span className="text-[10px] text-slate-400">{lang === 'es' ? 'Ejecuta test suites headless' : 'Runs headless test suites'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community & Feedback Banner */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-godot-card via-godot-card to-godot-950 border border-godot-400/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 text-amber-400 text-xs font-mono font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Participa en el Desarrollo de v1.0.0' : 'Join the v1.0.0 Development'}</span>
          </div>
          <h4 className="text-lg font-bold text-white">
            {lang === 'es'
              ? '¿Trabajas con un motor de juegos específico y quieres su skill o MCP?'
              : 'Developing with a specific game engine and want custom skills or MCPs?'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {lang === 'es'
              ? 'El roadmap de VGSkillFrame es 100% abierto. Puedes proponer nuevos motores, reglas de arquitectura o servidores MCP abriendo un issue o discusión en GitHub.'
              : 'VGSkillFrame roadmap is 100% community-driven. Suggest new engines, architecture skills, or MCP bridges by opening an issue or discussion on GitHub.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href="https://github.com/FrancisCuarto/OrbitKit/issues/new?template=feature_request.yml"
            target="_blank"
            rel="noreferrer"
            className="flex items-center text-xs font-semibold px-4 py-2.5 rounded-lg bg-[#23689b] hover:bg-[#2d7bb6] text-white transition border border-godot-400/40 shadow-lg shadow-[#23689b]/25 whitespace-nowrap"
          >
            <span>{lang === 'es' ? 'Proponer Skill o Motor' : 'Propose Skill or Engine'}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </a>
          <a
            href="https://github.com/FrancisCuarto/OrbitKit"
            target="_blank"
            rel="noreferrer"
            className="flex items-center text-xs font-semibold px-4 py-2.5 rounded-lg bg-godot-card hover:bg-godot-cardHover text-slate-200 transition border border-godot-border whitespace-nowrap"
          >
            <span>{lang === 'es' ? 'Seguir v1.0.0 en GitHub' : 'Follow v1.0.0 on GitHub'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
