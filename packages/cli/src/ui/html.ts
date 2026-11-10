/**
 * Renders the standalone OrbitKit GUI Dashboard Single Page App
 */
export function renderGuiHtml(): string {
  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OrbitKit — GUI Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0a0e17;
      --bg-card: #111827;
      --bg-card-hover: #172236;
      --bg-input: #1a2333;
      --border: #223048;
      --border-accent: #33496c;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --godot-blue: #478cbf;
      --godot-blue-light: #5ba3d9;
      --godot-blue-glow: rgba(71, 140, 191, 0.25);
      --accent-green: #10b981;
      --accent-green-bg: rgba(16, 185, 129, 0.15);
      --accent-yellow: #f59e0b;
      --accent-yellow-bg: rgba(245, 158, 11, 0.15);
      --accent-red: #ef4444;
      --accent-red-bg: rgba(239, 68, 68, 0.15);
      --accent-purple: #8b5cf6;
      --accent-purple-bg: rgba(139, 92, 246, 0.15);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      line-height: 1.5;
    }

    code, pre, .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    /* Scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg-dark);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--border-accent);
    }

    /* Layout */
    .app-header {
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--text-main);
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #478cbf 0%, #2f6993 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px var(--godot-blue-glow);
    }

    .brand-title {
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
      background: linear-gradient(to right, #fff, #93c5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .badge-version {
      font-size: 0.7rem;
      font-family: 'JetBrains Mono', monospace;
      padding: 2px 8px;
      background: var(--godot-blue-glow);
      color: var(--godot-blue-light);
      border: 1px solid rgba(71, 140, 191, 0.4);
      border-radius: 9999px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .project-selector-wrapper {
      display: flex;
      align-items: center;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 4px 10px;
      gap: 6px;
      font-size: 0.85rem;
    }

    .project-selector {
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 0.85rem;
      font-weight: 500;
      outline: none;
      max-width: 260px;
      cursor: pointer;
    }

    .project-selector option {
      background: var(--bg-card);
      color: var(--text-main);
    }

    .main-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Sidebar Navigation */
    .sidebar {
      width: 250px;
      background: #0d121c;
      border-right: 1px solid var(--border);
      padding: 1.25rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex-shrink: 0;
    }

    .nav-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      padding: 0.75rem 0.75rem 0.25rem 0.75rem;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-muted);
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
      width: 100%;
    }

    .nav-btn:hover {
      background: var(--bg-card);
      color: var(--text-main);
    }

    .nav-btn.active {
      background: rgba(71, 140, 191, 0.15);
      color: var(--godot-blue-light);
      border-color: rgba(71, 140, 191, 0.3);
    }

    .nav-badge {
      margin-left: auto;
      font-size: 0.7rem;
      padding: 1px 6px;
      border-radius: 9999px;
      background: var(--bg-input);
      color: var(--text-muted);
    }

    /* Content Area */
    .content-area {
      flex: 1;
      padding: 1.75rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      max-width: 1400px;
    }

    .view-section {
      display: none;
    }

    .view-section.active {
      display: block;
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .section-header {
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-desc {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.25rem;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .card:hover {
      border-color: var(--border-accent);
      background: var(--bg-card-hover);
    }

    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .card-desc {
      font-size: 0.86rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
      flex: 1;
    }

    /* Stat Cards */
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }

    .stat-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: #fff;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
      text-decoration: none;
    }

    .btn-sm {
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
    }

    .btn-primary {
      background: var(--godot-blue);
      color: #fff;
    }

    .btn-primary:hover {
      background: var(--godot-blue-light);
      box-shadow: 0 4px 12px var(--godot-blue-glow);
    }

    .btn-secondary {
      background: var(--bg-input);
      color: var(--text-main);
      border-color: var(--border);
    }

    .btn-secondary:hover {
      background: var(--border);
      color: #fff;
    }

    .btn-success {
      background: var(--accent-green);
      color: #fff;
    }

    .btn-success:hover {
      filter: brightness(1.1);
    }

    .btn-outline {
      background: transparent;
      border-color: var(--border);
      color: var(--text-muted);
    }

    .btn-outline:hover {
      border-color: var(--border-accent);
      color: var(--text-main);
    }

    /* Status Badges */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
    }

    .status-ok {
      background: var(--accent-green-bg);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .status-warning {
      background: var(--accent-yellow-bg);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .status-error {
      background: var(--accent-red-bg);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .status-neutral {
      background: var(--bg-input);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }

    /* Diagnostics Table / Cards */
    .diagnostic-row {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 0.75rem;
    }

    .diagnostic-icon {
      font-size: 1.25rem;
      margin-top: 2px;
    }

    .diagnostic-content {
      flex: 1;
    }

    .diagnostic-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #fff;
    }

    .diagnostic-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      word-break: break-word;
    }

    /* Command Table */
    .cmd-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }

    .cmd-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      background: var(--bg-input);
      color: var(--text-muted);
      font-weight: 700;
      border-bottom: 1px solid var(--border);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cmd-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    .cmd-table tr:hover td {
      background: var(--bg-card-hover);
    }

    .cmd-badge {
      background: #0f172a;
      border: 1px solid #1e293b;
      color: #38bdf8;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Action Console Drawer */
    .console-drawer {
      background: #080c14;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 180px;
      transition: height 0.2s ease;
      position: relative;
    }

    .console-drawer.collapsed {
      height: 38px;
    }

    .console-header {
      padding: 0.45rem 1rem;
      background: #0d131f;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    .console-logs {
      flex: 1;
      padding: 0.75rem 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      overflow-y: auto;
      color: #94a3b8;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .log-line {
      display: flex;
      gap: 0.5rem;
      word-break: break-all;
    }

    .log-time {
      color: #475569;
      flex-shrink: 0;
    }

    .log-info { color: #38bdf8; }
    .log-success { color: #34d399; }
    .log-warning { color: #fbbf24; }
    .log-error { color: #f87171; }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-backdrop.active {
      display: flex;
    }

    .modal-box {
      background: var(--bg-card);
      border: 1px solid var(--border-accent);
      border-radius: 14px;
      max-width: 720px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    /* Toast Notification */
    #toast-container {
      position: fixed;
      bottom: 200px;
      right: 24px;
      z-index: 200;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: #fff;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      animation: slideIn 0.25s ease-out;
    }

    .toast.success { border-color: var(--accent-green); }
    .toast.error { border-color: var(--accent-red); }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="app-header">
    <a href="#" class="brand">
      <div class="brand-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="text-white">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9 8C9.55 8 10 8.45 10 9C10 9.55 9.55 10 9 10C8.45 10 8 9.55 8 9C8 8.45 8.45 8 9 8ZM15 8C15.55 8 16 8.45 16 9C16 9.55 15.55 10 15 10C14.45 10 14 9.55 14 9C14 8.45 14.45 8 15 8ZM12 18C9.33 18 7.18 16.11 6.64 14H17.36C16.82 16.11 14.67 18 12 18Z" fill="#ffffff"/>
        </svg>
      </div>
      <div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="brand-title">OrbitKit GUI</span>
          <span class="badge-version">v0.1.0</span>
        </div>
      </div>
    </a>

    <!-- Target Project / Path Selector -->
    <div class="header-actions">
      <div class="project-selector-wrapper" title="Proyecto Godot activo">
        <span style="font-size:0.9rem;">📁</span>
        <select id="active-project-select" class="project-selector" onchange="changeActiveProject(this.value)">
          <option value=".">Cargando proyectos...</option>
        </select>
      </div>

      <button class="btn btn-secondary btn-sm" onclick="triggerDoctor()" title="Diagnosticar entorno">
        🩺 Ejecutar Doctor
      </button>

      <button class="btn btn-primary btn-sm" onclick="triggerUpdate()" title="Sincronizar y actualizar AI skills y MCPs">
        🔄 Actualizar Todo
      </button>
    </div>
  </header>

  <!-- Main Container -->
  <div class="main-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <span class="nav-label">Navegación</span>
      <button class="nav-btn active" onclick="switchTab('dashboard')">
        <span>📊</span> Dashboard
      </button>
      <button class="nav-btn" onclick="switchTab('projects')">
        <span>📁</span> Proyectos Godot
        <span class="nav-badge" id="nav-count-projects">0</span>
      </button>
      <button class="nav-btn" onclick="switchTab('skills')">
        <span>🧠</span> AI Skills Hub
        <span class="nav-badge" id="nav-count-skills">0</span>
      </button>
      <button class="nav-btn" onclick="switchTab('mcps')">
        <span>🔌</span> Servidores MCP
        <span class="nav-badge" id="nav-count-mcps">0</span>
      </button>
      <button class="nav-btn" onclick="switchTab('doctor')">
        <span>🩺</span> Diagnóstico Doctor
      </button>

      <span class="nav-label" style="margin-top: 1rem;">Herramientas</span>
      <button class="nav-btn" onclick="switchTab('commands')">
        <span>⌨️</span> Comandos CLI
      </button>
    </aside>

    <!-- Main Content -->
    <main class="content-area">

      <!-- 1. TAB: DASHBOARD -->
      <section id="tab-dashboard" class="view-section active">
        <div class="section-header">
          <div>
            <h1 class="section-title">Panel de Control OrbitKit</h1>
            <p class="section-desc">Monitorea y gestiona tus proyectos Godot 4, AI Skills y servidores MCP en tiempo real.</p>
          </div>
          <div>
            <button class="btn btn-primary" onclick="initProject()">
              🚀 Inicializar OrbitKit en este proyecto
            </button>
          </div>
        </div>

        <!-- Stat Cards -->
        <div class="grid-3">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(71, 140, 191, 0.15); color: #5ba3d9;">📁</div>
            <div>
              <div class="stat-value" id="stat-projects">0</div>
              <div class="stat-label">Proyectos Godot Detectados</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa;">🧠</div>
            <div>
              <div class="stat-value" id="stat-skills">0</div>
              <div class="stat-label">AI Skills Curados Disponibles</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">🔌</div>
            <div>
              <div class="stat-value" id="stat-mcps">0</div>
              <div class="stat-label">Servidores MCP Oficiales</div>
            </div>
          </div>
        </div>

        <!-- Quick Environment Overview -->
        <div class="card" style="margin-top: 1.5rem;">
          <div class="card-title">
            <span>🩺 Estado Rápido del Entorno</span>
            <button class="btn btn-outline btn-sm" onclick="switchTab('doctor')">Ver Diagnóstico Completo →</button>
          </div>
          <div id="quick-doctor-status" style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
            <div style="color:var(--text-muted); font-size:0.85rem;">Cargando estado del sistema...</div>
          </div>
        </div>

        <!-- Active Project Details Card -->
        <div class="card" style="margin-top: 1.5rem;">
          <div class="card-title">
            <span>📁 Proyecto Activo Seleccionado</span>
            <span id="active-project-badge" class="status-badge status-neutral">Inspeccionando...</span>
          </div>
          <div id="active-project-card-content" style="font-size: 0.9rem; color: var(--text-muted);">
            Selecciona un proyecto arriba o inicializa uno para ver sus addons, skills y MCPs.
          </div>
        </div>
      </section>

      <!-- 2. TAB: PROJECTS -->
      <section id="tab-projects" class="view-section">
        <div class="section-header">
          <div>
            <h1 class="section-title">📁 Proyectos Godot 4</h1>
            <p class="section-desc">Detecta proyectos locales y todos los proyectos registrados en el editor Godot Engine.</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <input type="text" id="scan-path-input" placeholder="Ruta para escanear (ej: . o ~)" value="." style="background:var(--bg-input); border:1px solid var(--border); border-radius:8px; padding:0.4rem 0.8rem; color:#fff; font-size:0.85rem; outline:none; width:220px;" />
            <button class="btn btn-secondary btn-sm" onclick="scanCustomDir()">Escanear Carpeta</button>
            <button class="btn btn-primary btn-sm" onclick="loadAllData()">🔄 Refrescar Todo</button>
          </div>
        </div>

        <div id="projects-list-container" class="grid-2">
          <!-- Filled by JS -->
        </div>
      </section>

      <!-- 3. TAB: SKILLS -->
      <section id="tab-skills" class="view-section">
        <div class="section-header">
          <div>
            <h1 class="section-title">🧠 Catálogo de AI Skills para Godot 4</h1>
            <p class="section-desc">Reglas especializadas para Claude Code, Antigravity, Cursor y Windsurf para evitar alucinaciones y código deprecado.</p>
          </div>
          <div>
            <input type="text" id="skills-search-input" placeholder="Buscar skills (ej: FSM, TileMap, shader)..." onkeyup="filterSkills()" style="background:var(--bg-input); border:1px solid var(--border); border-radius:8px; padding:0.45rem 1rem; color:#fff; font-size:0.85rem; outline:none; width:280px;" />
          </div>
        </div>

        <div id="skills-list-container" class="grid-2">
          <!-- Filled by JS -->
        </div>
      </section>

      <!-- 4. TAB: MCPS -->
      <section id="tab-mcps" class="view-section">
        <div class="section-header">
          <div>
            <h1 class="section-title">🔌 Servidores Model Context Protocol (MCP)</h1>
            <p class="section-desc">Conecta a tus asistentes de IA directamente con el editor Godot 4, el lenguaje GDScript y la documentación oficial.</p>
          </div>
        </div>

        <div id="mcps-list-container" class="grid-2">
          <!-- Filled by JS -->
        </div>
      </section>

      <!-- 5. TAB: DOCTOR -->
      <section id="tab-doctor" class="view-section">
        <div class="section-header">
          <div>
            <h1 class="section-title">🩺 Diagnóstico del Entorno (OrbitKit Doctor)</h1>
            <p class="section-desc">Verifica Node.js, el binario de Godot 4 en PATH, y el puerto LSP 6005 para telemetría con agentes de IA.</p>
          </div>
          <button class="btn btn-primary" onclick="triggerDoctor()">
            Re-ejecutar Diagnóstico
          </button>
        </div>

        <div id="doctor-results-container">
          <!-- Filled by JS -->
        </div>
      </section>

      <!-- 6. TAB: COMMANDS -->
      <section id="tab-commands" class="view-section">
        <div class="section-header">
          <div>
            <h1 class="section-title">⌨️ Referencia de Comandos CLI</h1>
            <p class="section-desc">Todos los comandos disponibles al instalar <code>@francisiv/orbitkit</code> (alias <code>devdock</code>).</p>
          </div>
        </div>

        <div class="card" style="padding:0; overflow:hidden;">
          <table class="cmd-table">
            <thead>
              <tr>
                <th style="width:240px;">Comando</th>
                <th>Descripción</th>
                <th style="width:120px; text-align:right;">Acción</th>
              </tr>
            </thead>
            <tbody id="commands-table-body">
              <!-- Filled by JS -->
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>

  <!-- Action Console Drawer -->
  <div id="console-drawer" class="console-drawer">
    <div class="console-header">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span>📟 Registro de Actividad & Terminal</span>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <button class="btn btn-outline btn-sm" style="padding:2px 8px; font-size:0.75rem;" onclick="clearLogs()">Limpiar</button>
        <button class="btn btn-outline btn-sm" style="padding:2px 8px; font-size:0.75rem;" onclick="toggleConsole()">Minimizar / Expandir</button>
      </div>
    </div>
    <div id="console-logs" class="console-logs">
      <div class="log-line">
        <span class="log-time">[OrbitKit GUI]</span>
        <span class="log-info">Dashboard conectado exitosamente. Listo para gestionar proyectos Godot.</span>
      </div>
    </div>
  </div>

  <!-- Modal for Skill System Prompt / Details -->
  <div id="prompt-modal" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-header">
        <h3 id="modal-skill-title" style="font-weight:700; color:#fff;">Detalles del AI Skill</h3>
        <button class="btn btn-outline btn-sm" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <pre id="modal-skill-prompt" style="background:#0b0f17; padding:1rem; border-radius:8px; border:1px solid var(--border); overflow-x:auto; font-size:0.8rem; color:#cbd5e1; white-space:pre-wrap;"></pre>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
        <button id="modal-install-btn" class="btn btn-primary" onclick="">Instalar este Skill</button>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div id="toast-container"></div>

  <!-- Main JavaScript App Logic -->
  <script>
    let appState = {
      activeProjectDir: '.',
      projects: [],
      skills: [],
      mcps: [],
      diagnostics: [],
      commands: []
    };

    function log(message, type = 'info') {
      const logs = document.getElementById('console-logs');
      const time = new Date().toLocaleTimeString();
      const div = document.createElement('div');
      div.className = 'log-line';
      div.innerHTML = \`<span class="log-time">[\${time}]</span> <span class="log-\${type}">\${escapeHtml(message)}</span>\`;
      logs.appendChild(div);
      logs.scrollTop = logs.scrollHeight;
    }

    function clearLogs() {
      document.getElementById('console-logs').innerHTML = '';
      log('Registro limpiado.');
    }

    function toggleConsole() {
      const drawer = document.getElementById('console-drawer');
      drawer.classList.toggle('collapsed');
    }

    function showToast(text, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;
      toast.innerHTML = (type === 'success' ? '✓ ' : '✗ ') + escapeHtml(text);
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function switchTab(tabId) {
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.getAttribute('onclick')?.includes(tabId));
      if (activeBtn) activeBtn.classList.add('active');

      document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
      const targetSec = document.getElementById('tab-' + tabId);
      if (targetSec) targetSec.classList.add('active');
    }

    async function loadAllData() {
      try {
        log('Cargando estado inicial del ecosistema...');
        const res = await fetch('/api/status');
        const data = await res.json();

        appState.projects = data.projects || [];
        appState.diagnostics = data.diagnostics || [];
        appState.activeProjectDir = data.currentDir || '.';

        updateProjectSelector();
        updateDashboardView(data);
        await Promise.all([
          loadSkills(),
          loadMcps(),
          loadCommands()
        ]);
        renderDoctorResults(appState.diagnostics);
        log('Estado cargado correctamente. Entorno listo.', 'success');
      } catch (err) {
        log('Error cargando datos: ' + err.message, 'error');
        showToast('Error cargando datos del servidor', 'error');
      }
    }

    function updateProjectSelector() {
      const select = document.getElementById('active-project-select');
      select.innerHTML = '';

      if (appState.projects.length === 0) {
        const opt = document.createElement('option');
        opt.value = '.';
        opt.textContent = 'Directorio actual (.)';
        select.appendChild(opt);
      } else {
        appState.projects.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.projectPath;
          const tag = p.source === 'godot-registry' ? ' [Godot Engine]' : '';
          opt.textContent = \`\${p.name}\${tag} (\${p.projectPath})\`;
          select.appendChild(opt);
        });
      }

      if (appState.projects.some(p => p.projectPath === appState.activeProjectDir)) {
        select.value = appState.activeProjectDir;
      }
    }

    function changeActiveProject(path) {
      appState.activeProjectDir = path;
      log(\`Cambiado proyecto activo a: \${path}\`, 'info');
      updateDashboardProjectCard();
      loadSkills();
      loadMcps();
    }

    function updateDashboardView(data) {
      document.getElementById('stat-projects').textContent = (data.projects || []).length;
      document.getElementById('stat-skills').textContent = (data.stats?.skills || 0);
      document.getElementById('stat-mcps').textContent = (data.stats?.mcps || 0);
      document.getElementById('nav-count-projects').textContent = (data.projects || []).length;
      document.getElementById('nav-count-skills').textContent = (data.stats?.skills || 0);
      document.getElementById('nav-count-mcps').textContent = (data.stats?.mcps || 0);

      // Quick doctor
      const quickDoctor = document.getElementById('quick-doctor-status');
      quickDoctor.innerHTML = '';
      (data.diagnostics || []).forEach(d => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.justifyContent = 'space-between';
        item.style.fontSize = '0.85rem';
        item.style.padding = '0.35rem 0.5rem';
        item.style.borderRadius = '6px';
        item.style.background = 'var(--bg-input)';

        const badgeClass = d.status === 'ok' ? 'status-ok' : d.status === 'warning' ? 'status-warning' : 'status-error';
        const icon = d.status === 'ok' ? '✓' : d.status === 'warning' ? '⚠' : '✗';

        item.innerHTML = \`
          <span style="font-weight:600; color:#fff;">\${escapeHtml(d.name)}</span>
          <span class="status-badge \${badgeClass}">\${icon} \${escapeHtml(d.message)}</span>
        \`;
        quickDoctor.appendChild(item);
      });

      renderProjectsList(data.projects || []);
      updateDashboardProjectCard();
    }

    function updateDashboardProjectCard() {
      const activeProj = appState.projects.find(p => p.projectPath === appState.activeProjectDir);
      const cardContent = document.getElementById('active-project-card-content');
      const badge = document.getElementById('active-project-badge');

      if (!activeProj) {
        badge.className = 'status-badge status-warning';
        badge.textContent = 'Sin project.godot detectado';
        cardContent.innerHTML = \`
          <p>La carpeta actual (<code>\${escapeHtml(appState.activeProjectDir)}</code>) no contiene un archivo <code>project.godot</code>.</p>
          <p style="margin-top:0.5rem;">Haz clic en <strong>"Inicializar OrbitKit"</strong> para configurar este directorio para Godot y asistentes de IA.</p>
        \`;
        return;
      }

      badge.className = 'status-badge status-ok';
      badge.textContent = 'Proyecto Godot Detectado';

      cardContent.innerHTML = \`
        <div style="display:flex; flex-direction:column; gap:0.6rem;">
          <div><strong>Nombre del Juego:</strong> \${escapeHtml(activeProj.name)}</div>
          <div><strong>Ruta:</strong> <code style="color:#38bdf8;">\${escapeHtml(activeProj.projectPath)}</code></div>
          <div><strong>Addons instalados:</strong> \${activeProj.installedAddons.length ? activeProj.installedAddons.map(a => \`<span class="status-badge status-neutral" style="margin-right:4px;">\${escapeHtml(a)}</span>\`).join('') : '<span style="color:var(--text-muted)">Ninguno</span>'}</div>
          <div><strong>AI Skills activos:</strong> \${activeProj.installedSkills.length ? activeProj.installedSkills.map(s => \`<span class="status-badge status-ok" style="margin-right:4px;">\${escapeHtml(s)}</span>\`).join('') : '<span style="color:var(--text-muted)">Ninguno</span>'}</div>
          <div><strong>Configuración MCP:</strong> \${activeProj.hasMcpConfig ? '<span class="status-badge status-ok">Activo (.mcp.json)</span>' : '<span class="status-badge status-warning">No configurado</span>'}</div>
        </div>
      \`;
    }

    function renderProjectsList(projects) {
      const container = document.getElementById('projects-list-container');
      container.innerHTML = '';

      if (projects.length === 0) {
        container.innerHTML = \`
          <div class="card" style="grid-column: 1 / -1; text-align:center; padding: 2.5rem;">
            <p style="font-size:1.1rem; font-weight:700; color:#fff;">No se encontraron proyectos Godot</p>
            <p style="color:var(--text-muted); margin-top:0.5rem;">Introduce otra ruta arriba o ejecuta <code>orbitkit init</code> en tu proyecto actual.</p>
          </div>
        \`;
        return;
      }

      projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        const sourceBadge = p.source === 'godot-registry'
          ? '<span class="status-badge status-warning" title="Registrado en Godot Engine">Godot Engine</span>'
          : '<span class="status-badge status-neutral" title="Detectado en sistema de archivos">Local</span>';

        card.innerHTML = \`
          <div class="card-title">
            <span>🎮 \${escapeHtml(p.name)}</span>
            <div style="display:flex; gap:0.35rem; align-items:center;">
              \${sourceBadge}
              <span class="status-badge status-ok">Godot 4</span>
            </div>
          </div>
          <div class="card-desc">
            <div style="font-size:0.75rem; color:#38bdf8; font-family:'JetBrains Mono',monospace; margin-bottom:0.75rem;">\${escapeHtml(p.projectPath)}</div>
            <div style="margin-bottom:0.4rem;"><strong>Addons:</strong> \${p.installedAddons.length ? p.installedAddons.join(', ') : 'Ninguno'}</div>
            <div style="margin-bottom:0.4rem;"><strong>AI Skills:</strong> \${p.installedSkills.length ? p.installedSkills.join(', ') : 'Ninguno'}</div>
            <div><strong>MCP:</strong> \${p.hasMcpConfig ? '✓ Configurado (.mcp.json)' : '✗ Sin configurar'}</div>
          </div>
          <div style="display:flex; gap:0.5rem; margin-top:auto;">
            <button class="btn btn-primary btn-sm" onclick="changeActiveProject('\${escapeHtml(p.projectPath)}'); switchTab('skills');">
              Instalar Skills
            </button>
            <button class="btn btn-secondary btn-sm" onclick="changeActiveProject('\${escapeHtml(p.projectPath)}'); switchTab('mcps');">
              Configurar MCPs
            </button>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    async function loadSkills() {
      try {
        const res = await fetch('/api/skills?dir=' + encodeURIComponent(appState.activeProjectDir));
        const data = await res.json();
        appState.skills = data.skills || [];
        renderSkillsList(appState.skills);
      } catch (err) {
        log('Error cargando skills: ' + err.message, 'error');
      }
    }

    function renderSkillsList(skills) {
      const container = document.getElementById('skills-list-container');
      container.innerHTML = '';

      skills.forEach(s => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-skill-id', s.id);
        card.setAttribute('data-skill-name', s.name.toLowerCase());
        card.setAttribute('data-skill-desc', s.description.toLowerCase());

        const isInstalled = s.isInstalled;

        card.innerHTML = \`
          <div class="card-title">
            <span style="display:flex; align-items:center; gap:0.4rem;">
              🧠 \${escapeHtml(s.name)}
            </span>
            <span class="badge-version">v\${escapeHtml(s.version)}</span>
          </div>
          <div class="card-desc">
            <p>\${escapeHtml(s.description)}</p>
            <div style="margin-top:0.75rem; font-size:0.75rem; color:#94a3b8; font-family:'JetBrains Mono',monospace;">ID: \${escapeHtml(s.id)}</div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto; pt-2;">
            <button class="btn btn-outline btn-sm" onclick="openSkillModal('\${escapeHtml(s.id)}')">
              Ver Reglas / Prompt
            </button>
            <button class="btn \${isInstalled ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="installSkill('\${escapeHtml(s.id)}')">
              \${isInstalled ? '✓ Instalado (Reinstalar)' : 'Instalar Skill'}
            </button>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    function filterSkills() {
      const q = document.getElementById('skills-search-input').value.toLowerCase();
      document.querySelectorAll('#skills-list-container .card').forEach(card => {
        const name = card.getAttribute('data-skill-name') || '';
        const desc = card.getAttribute('data-skill-desc') || '';
        const id = card.getAttribute('data-skill-id') || '';
        if (name.includes(q) || desc.includes(q) || id.includes(q)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function openSkillModal(skillId) {
      const skill = appState.skills.find(s => s.id === skillId);
      if (!skill) return;

      document.getElementById('modal-skill-title').textContent = skill.name + ' (v' + skill.version + ')';
      document.getElementById('modal-skill-prompt').textContent = skill.systemPrompt;
      const installBtn = document.getElementById('modal-install-btn');
      installBtn.onclick = () => {
        closeModal();
        installSkill(skill.id);
      };
      document.getElementById('prompt-modal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('prompt-modal').classList.remove('active');
    }

    async function installSkill(skillId) {
      log(\`Instalando skill '\${skillId}' en \${appState.activeProjectDir}...\`, 'info');
      try {
        const res = await fetch('/api/skills/install', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectDir: appState.activeProjectDir,
            skillId: skillId
          })
        });
        const data = await res.json();
        if (data.success) {
          log(\`✓ \${data.message}\`, 'success');
          showToast(data.message, 'success');
          loadSkills();
          loadAllData();
        } else {
          log(\`✗ Error: \${data.message}\`, 'error');
          showToast(data.message, 'error');
        }
      } catch (err) {
        log(\`✗ Fallo al instalar skill: \${err.message}\`, 'error');
        showToast('Fallo al instalar skill', 'error');
      }
    }

    async function loadMcps() {
      try {
        const res = await fetch('/api/mcps?dir=' + encodeURIComponent(appState.activeProjectDir));
        const data = await res.json();
        appState.mcps = data.mcps || [];
        renderMcpsList(appState.mcps);
      } catch (err) {
        log('Error cargando servidores MCP: ' + err.message, 'error');
      }
    }

    function renderMcpsList(mcps) {
      const container = document.getElementById('mcps-list-container');
      container.innerHTML = '';

      mcps.forEach(m => {
        const card = document.createElement('div');
        card.className = 'card';
        const isConfigured = m.isConfigured;

        card.innerHTML = \`
          <div class="card-title">
            <span style="display:flex; align-items:center; gap:0.4rem;">
              🔌 \${escapeHtml(m.name)}
            </span>
            <span class="status-badge \${isConfigured ? 'status-ok' : 'status-neutral'}">
              \${isConfigured ? '✓ Configurado' : 'No configurado'}
            </span>
          </div>
          <div class="card-desc">
            <p>\${escapeHtml(m.description)}</p>
            <div style="margin-top:0.75rem; font-family:'JetBrains Mono',monospace; font-size:0.78rem; background:var(--bg-input); padding:0.4rem 0.6rem; border-radius:6px; color:#38bdf8;">
              \${escapeHtml(m.command)} \${escapeHtml(m.args.join(' '))}
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:auto;">
            <button class="btn \${isConfigured ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="installMcp('\${escapeHtml(m.id)}')">
              \${isConfigured ? 'Reconfigurar en .mcp.json' : 'Configurar en .mcp.json'}
            </button>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    async function installMcp(serverId) {
      log(\`Configurando servidor MCP '\${serverId}' en \${appState.activeProjectDir}...\`, 'info');
      try {
        const res = await fetch('/api/mcps/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectDir: appState.activeProjectDir,
            serverId: serverId
          })
        });
        const data = await res.json();
        if (data.success) {
          log(\`✓ \${data.message}\`, 'success');
          showToast(data.message, 'success');
          loadMcps();
          loadAllData();
        } else {
          log(\`✗ Error: \${data.message}\`, 'error');
          showToast(data.message, 'error');
        }
      } catch (err) {
        log(\`✗ Fallo al configurar MCP: \${err.message}\`, 'error');
        showToast('Fallo al configurar MCP', 'error');
      }
    }

    async function triggerDoctor() {
      log('Ejecutando diagnóstico del sistema (Doctor)...', 'info');
      try {
        const res = await fetch('/api/doctor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectDir: appState.activeProjectDir })
        });
        const data = await res.json();
        appState.diagnostics = data.items || [];
        renderDoctorResults(appState.diagnostics);
        log('Diagnóstico finalizado con éxito.', 'success');
        showToast('Diagnóstico finalizado');
      } catch (err) {
        log('Fallo ejecutando diagnóstico: ' + err.message, 'error');
      }
    }

    function renderDoctorResults(items) {
      const container = document.getElementById('doctor-results-container');
      container.innerHTML = '';

      items.forEach(d => {
        const row = document.createElement('div');
        row.className = 'diagnostic-row';

        const icon = d.status === 'ok' ? '✓' : d.status === 'warning' ? '⚠' : '✗';
        const color = d.status === 'ok' ? '#34d399' : d.status === 'warning' ? '#fbbf24' : '#f87171';

        row.innerHTML = \`
          <div class="diagnostic-icon" style="color: \${color}">\${icon}</div>
          <div class="diagnostic-content">
            <div class="diagnostic-title">\${escapeHtml(d.name)}</div>
            <div class="diagnostic-desc">\${escapeHtml(d.message)}</div>
          </div>
          <div>
            <span class="status-badge \${d.status === 'ok' ? 'status-ok' : d.status === 'warning' ? 'status-warning' : 'status-error'}">
              \${d.status.toUpperCase()}
            </span>
          </div>
        \`;
        container.appendChild(row);
      });
    }

    async function triggerUpdate() {
      log('Comprobando actualizaciones de AI Skills y MCPs...', 'info');
      try {
        const res = await fetch('/api/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectDir: appState.activeProjectDir, all: false })
        });
        const data = await res.json();
        log(\`✓ Actualización finalizada: \${JSON.stringify(data.summary || data)}\`, 'success');
        showToast('Proyecto sincronizado y actualizado');
        loadAllData();
      } catch (err) {
        log('Fallo al actualizar: ' + err.message, 'error');
        showToast('Fallo al actualizar', 'error');
      }
    }

    async function initProject() {
      log(\`Inicializando OrbitKit en \${appState.activeProjectDir}...\`, 'info');
      try {
        const res = await fetch('/api/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectDir: appState.activeProjectDir })
        });
        const data = await res.json();
        if (data.success) {
          log(\`✓ \${data.message}\`, 'success');
          showToast(data.message, 'success');
          loadAllData();
        } else {
          log(\`✗ \${data.message}\`, 'error');
          showToast(data.message, 'error');
        }
      } catch (err) {
        log('Fallo inicializando: ' + err.message, 'error');
        showToast('Fallo inicializando', 'error');
      }
    }

    async function scanCustomDir() {
      const inputPath = document.getElementById('scan-path-input').value.trim() || '.';
      log(\`Escaneando ruta: \${inputPath}...\`, 'info');
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dir: inputPath })
        });
        const data = await res.json();
        appState.projects = data.projects || [];
        updateProjectSelector();
        renderProjectsList(appState.projects);
        log(\`Escaneo completado. Encontrados \${appState.projects.length} proyecto(s).\`, 'success');
        showToast(\`\${appState.projects.length} proyecto(s) detectado(s)\`);
      } catch (err) {
        log('Error escaneando: ' + err.message, 'error');
      }
    }

    async function loadCommands() {
      try {
        const res = await fetch('/api/commands');
        const data = await res.json();
        appState.commands = data.commands || [];
        renderCommandsTable(appState.commands);
      } catch (err) {
        log('Error cargando comandos CLI: ' + err.message, 'error');
      }
    }

    function renderCommandsTable(commands) {
      const tbody = document.getElementById('commands-table-body');
      tbody.innerHTML = '';

      commands.forEach(cmd => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td>
            <div class="cmd-badge">
              <span>$</span> \${escapeHtml(cmd.command)}
            </div>
          </td>
          <td>
            <div style="color:#fff; font-weight:600; font-size:0.88rem;">\${escapeHtml(cmd.description)}</div>
            <div style="color:var(--text-muted); font-size:0.78rem; margin-top:2px;">Uso: <code>\${escapeHtml(cmd.usage || cmd.command)}</code></div>
          </td>
          <td style="text-align:right;">
            <button class="btn btn-outline btn-sm" onclick="copyCommand('\${escapeHtml(cmd.command)}')">
              Copiar
            </button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function copyCommand(cmd) {
      navigator.clipboard.writeText(cmd).then(() => {
        showToast(\`Copiado: \${cmd}\`);
      }).catch(() => {
        showToast(\`Comando: \${cmd}\`);
      });
    }

    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {
      loadAllData();
    });
  </script>
</body>
</html>`;
}
