export type Language = 'es' | 'en';

export const TRANSLATIONS = {
  es: {
    nav: {
      docs: 'Documentación',
      features: 'Características',
      howItWorks: 'Cómo funciona',
      mcp: 'Servidores MCP',
      skills: 'AI Skills',
      github: 'GitHub',
      install: 'Instalar CLI'
    },
    hero: {
      badge: 'Ecosistema Godot 4.x + Asistentes de IA',
      headline1: 'Mantén todos tus proyectos de Godot',
      headline2: 'al día con lo último en Skills y MCPs.',
      sub: 'Una herramienta CLI global. Escanea tu disco, conecta el Language Server de Godot en vivo a tus agentes de IA (Antigravity, Claude, Cursor) y actualiza todas tus herramientas con un solo comando.',
      btnDocs: 'Ver Documentación',
      btnGithub: 'Ver en GitHub',
      tabInstall: 'Instalar Global',
      tabScan: 'Escanear Proyectos',
      tabUpdate: 'Actualizar Todo',
      tabMcp: 'Conectar MCP'
    },
    problem: {
      eyebrow: 'El Problema vs La Solución',
      title: 'El desarrollo de videojuegos con IA necesitaba un puente real.',
      beforeTitle: 'Antes de DevDock',
      before1: 'Descargar archivos zip de repositorios a mano y arriesgarte a romper tu proyecto.',
      before2: 'Los agentes de IA confunden sintaxis de Godot 3 en proyectos de Godot 4.',
      before3: 'Tu asistente de código programa a ciegas, sin conexión con el editor Godot.',
      before4: 'Imposible saber qué addons están rotos o tienen actualizaciones pendientes.',
      afterTitle: 'Con DevDock CLI',
      after1: 'Instalación limpia, verificada con firma digital SHA-256 y protección anti-ZipSlip.',
      after2: 'Skills oficiales de Godot 4 en .agents/skills y .claude/skills para evitar alucinaciones.',
      after3: 'Puente MCP en vivo: tu IA lee errores de compilación y autocompletado desde Godot (puerto 6005).',
      after4: 'Un solo comando ("devdock update --all") actualiza todos tus proyectos en lote.'
    },
    features: {
      eyebrow: 'Funcionalidades',
      headline: 'Todo lo que necesitas para tu entorno Godot.',
      sub: 'Diseñado para desarrolladores que valoran su tiempo. Sin configuraciones complejas.',
      card1: {
        title: 'Escáner Automático de Proyectos',
        desc: 'Encuentra automáticamente todos tus proyectos de Godot en disco con "devdock scan". Detecta addons, skills y salud.'
      },
      card2: {
        title: 'Puente MCP para Agentes de IA',
        desc: 'Conecta Antigravity, Claude Code, Cursor y Codex al Language Server de GDScript y a la documentación offline de Godot 4.'
      },
      card3: {
        title: 'AI Skills Optimizados para Godot 4',
        desc: 'Instrucciones especializadas sobre tipado estricto, composición de nodos, shaders y UI responsiva para que tu IA programe como un experto.'
      },
      card4: {
        title: 'Actualizador Global en Lote',
        desc: 'Ejecuta "devdock update --all" y actualiza automáticamente los skills y plugins de todos tus videojuegos a la vez.'
      },
      card5: {
        title: 'Seguridad y Verificación Criptográfica',
        desc: 'Cada recurso se valida con hash SHA-256 antes de tocar tu disco. Sin código arbitrario ni fugas de rutas.'
      },
      card6: {
        title: 'Médico del Sistema ("orbitkit doctor")',
        desc: 'Diagnostica tu binario de Godot, versión del motor, conectividad del puerto LSP 6005 y estado del entorno.'
      }
    },
    how: {
      eyebrow: 'Paso a Paso',
      headline: 'Tres pasos para potenciar tu desarrollo con IA.',
      step1Title: '1. Instala el CLI globalmente',
      step1Desc: 'Un simple comando con npm o npx: "npm i -g @francisiv/orbitkit". Funciona en Linux, Windows y macOS.',
      step2Title: '2. Inicializa o escanea tu espacio',
      step2Desc: 'Ejecuta "orbitkit init" en tu juego o "orbitkit scan" para descubrir todos tus proyectos existentes.',
      step3Title: '3. Tu agente de IA ahora domina Godot',
      step3Desc: 'Tus asistentes de código leen los skills de arquitectura, ctx7 y el servidor MCP de Godot en tiempo real.'
    },
    docs: {
      eyebrow: 'Guía Completa',
      title: 'Documentación Oficial',
      sub: 'Aprende a instalar, configurar y sacarle el máximo provecho a OrbitKit y DevDock.',
      tabCli: 'Comandos CLI',
      tabMcp: 'Configurar MCP',
      tabSkills: 'Catálogo de Skills',
      tabPlugin: 'Plugin de Godot'
    }
  },
  en: {
    nav: {
      docs: 'Documentation',
      features: 'Features',
      howItWorks: 'How it Works',
      mcp: 'MCP Servers',
      skills: 'AI Skills',
      github: 'GitHub',
      install: 'Install CLI'
    },
    hero: {
      badge: 'Godot 4.x + AI Agent Ecosystem',
      headline1: 'Keep all your Godot projects',
      headline2: 'updated with the latest Skills & MCPs.',
      sub: 'A global CLI tool. Scan your workspace, bridge live GDScript LSP telemetry to your AI coding agents (Antigravity, Claude, Cursor), and auto-update skills across every project with one command.',
      btnDocs: 'View Documentation',
      btnGithub: 'View on GitHub',
      tabInstall: 'Install Global',
      tabScan: 'Scan Projects',
      tabUpdate: 'Update All',
      tabMcp: 'Connect MCP'
    },
    problem: {
      eyebrow: 'The Problem vs The Solution',
      title: 'Game development with AI needed a real architectural bridge.',
      beforeTitle: 'Before DevDock',
      before1: 'Downloading raw zip files from repositories manually and risking project integrity.',
      before2: 'AI agents hallucinating outdated Godot 3 syntax inside Godot 4 codebases.',
      before3: 'Coding assistants programming blindly with no access to editor diagnostics.',
      before4: 'Impossible to know which addons are broken or have pending bugfixes.',
      afterTitle: 'With DevDock CLI',
      after1: 'Clean extraction verified by SHA-256 checksums and strict Anti-ZipSlip protection.',
      after2: 'Curated Godot 4 Skills in .agents/skills and .claude/skills preventing syntax drift.',
      after3: 'Live MCP bridge: your AI inspects GDScript compiler errors directly from Godot (port 6005).',
      after4: 'A single command ("devdock update --all") syncs and updates every game project on your PC.'
    },
    features: {
      eyebrow: 'Features',
      headline: 'Everything you need for your Godot workflow.',
      sub: 'Engineered for developers who value time and craftsmanship. Zero bloat.',
      card1: {
        title: 'Automated Project Scanner',
        desc: 'Instantly locate all Godot projects across your drives with "devdock scan". Reports addons, skills and health.'
      },
      card2: {
        title: 'MCP Bridge for AI Agents',
        desc: 'Connect Antigravity, Claude Code, Cursor, and Codex directly to the GDScript Language Server and offline Godot 4 docs.'
      },
      card3: {
        title: 'Curated Godot 4 AI Skills',
        desc: 'Battle-tested prompt protocols for static typing, node composition, shaders, and responsive UI architecture.'
      },
      card4: {
        title: 'Batch Project Updater',
        desc: 'Run "devdock update --all" to synchronize and upgrade AI skills and addons across all your local games simultaneously.'
      },
      card5: {
        title: 'Cryptographic SHA-256 Verification',
        desc: 'All packages and skills are verified with cryptographic hashes prior to extraction. No arbitrary path escapes.'
      },
      card6: {
        title: 'System Health Doctor ("orbitkit doctor")',
        desc: 'Diagnoses Godot binary presence, engine version, LSP port 6005 accessibility, and project context.'
      }
    },
    how: {
      eyebrow: 'Step by Step',
      headline: 'Three steps to empower your Godot AI workflow.',
      step1Title: '1. Install CLI globally',
      step1Desc: 'One simple command: "npm i -g @francisiv/orbitkit". Runs on Linux, Windows, and macOS.',
      step2Title: '2. Initialize or scan your workspace',
      step2Desc: 'Run "orbitkit init" in your game or "orbitkit scan" to detect all existing Godot projects on your computer.',
      step3Title: '3. Your AI agent now masters Godot',
      step3Desc: 'AI coding assistants read architecture guidelines, ctx7 docs, and the live Godot LSP server in real time.'
    },
    docs: {
      eyebrow: 'Complete Guide',
      title: 'Official Documentation',
      sub: 'Learn how to install, configure, and leverage the full power of OrbitKit and DevDock.',
      tabCli: 'CLI Commands',
      tabMcp: 'Configure MCP',
      tabSkills: 'Skills Catalog',
      tabPlugin: 'Godot Plugin'
    }
  }
};
