<div align="center">

# 🚀 OrbitKit — Godot 4 & Blender 3D AI Skills, MCP Servers & Package Manager CLI

**The Interactive Web GUI, TUI, Model Context Protocol (MCP) Bridge & Curated AI Coding Skills Ecosystem for Godot Engine 4.x and Blender 3D Game Developers**

[![Website](https://img.shields.io/badge/Website-orbit--kit--nine.vercel.app-10b981?style=flat-square&logo=vercel&logoColor=white)](https://orbit-kit-nine.vercel.app)
[![npm version](https://img.shields.io/npm/v/@francisiv/orbitkit.svg?style=flat-square&color=478cbf&logo=npm)](https://www.npmjs.com/package/@francisiv/orbitkit)
[![Godot 4.x](https://img.shields.io/badge/Godot_Engine-4.x-478cbf?style=flat-square&logo=godotengine&logoColor=white)](https://godotengine.org)
[![Blender 4.x](https://img.shields.io/badge/Blender_3D-4.x-e87d0d?style=flat-square&logo=blender&logoColor=white)](https://www.blender.org)
[![MCP Ready](https://img.shields.io/badge/MCP-Model_Context_Protocol-8b5cf6?style=flat-square)](https://modelcontextprotocol.io)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

**OrbitKit (`@francisiv/orbitkit` / `devdock`)** keeps all your local **Godot 4** and **Blender 3D** game projects continuously synchronized with anti-hallucination **GDScript 4 AI Skills**, **Model Context Protocol (MCP) servers** (`Context7`, `Godot LSP`, `Scene Inspector`, `GUT Runner`), and verified **Godot Editor Addons** — compatible out of the box with **Claude Code**, **Cursor**, **Windsurf**, **Antigravity**, and **GitHub Copilot**.

[🌐 Live Website & Docs](https://orbit-kit-nine.vercel.app) • [📦 NPM Package](https://www.npmjs.com/package/@francisiv/orbitkit) • [📚 Architecture Docs](https://github.com/FrancisCuarto/OrbitKit/tree/main/docs) • [🐛 Report Issue](https://github.com/FrancisCuarto/OrbitKit/issues)

</div>

---

<div align="center">

## 🎬 Overview & Workflow Demo

https://github.com/FrancisCuarto/OrbitKit/raw/main/docs/assets/orbitkit-preview.mp4

<p align="center">
  <video src="https://github.com/FrancisCuarto/OrbitKit/raw/main/docs/assets/orbitkit-preview.mp4" controls="controls" muted="muted" playsinline="playsinline" poster="docs/assets/orbitkit-preview-poster.png" width="100%" style="border-radius: 12px; border: 1px solid #30363d; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    <a href="https://github.com/FrancisCuarto/OrbitKit/raw/main/docs/assets/orbitkit-preview.mp4">
      <img src="docs/assets/orbitkit-preview-poster.png" alt="OrbitKit Overview Video" width="100%" style="border-radius: 12px;" />
    </a>
  </video>
</p>

</div>

---

## ✨ Why OrbitKit for Godot 4 & Blender?

Most AI coding assistants hallucinate legacy **Godot 3.x GDScript** (`KinematicBody2D`, `yield()`, old `TileMap`, invalid `.tscn` UIDs) because their training cutoffs mix Godot 3 and Godot 4 APIs.

**OrbitKit** solves this with a single command:
- 🧠 **9 Curated Godot 4 & Blender 3D AI Skills**: Enforces strict GDScript 4.3+ static typing, `CharacterBody2D/3D`, `TileMapLayer`, `FileAccess`, decoupled Finite State Machines, shaders, multiplayer ENet, and Blender-to-Godot `.glb` pipelines in `.agents/skills/` and `.claude/skills/`.
- 🔌 **6 Zero-Config Godot MCP Servers**: Connects your AI agent directly to the Godot 4 GDScript Language Server (`localhost:6005`), Upstash `Context7` live docs, `.tscn`/`.tres` scene hierarchy inspector, and GUT unit test runner via `.mcp.json`.
- 🖥️ **Interactive Web GUI Dashboard & TUI**: Run `orbitkit` (or `orbitkit ui`) to open the local Web GUI Dashboard or interactive terminal menu to browse skills, toggle MCP servers, scan projects, and manage updates visually.
- 🔔 **Continuous Background Auto-Updater**: Uses HTTP `ETag` caching and OS-native schedulers (`systemd`, `launchd`, `schtasks`) to detect and apply verified skill updates with atomic rollback.
- 🔒 **Security-First Installer**: Cryptographic SHA-256/512 checksum verification, strict Zip-Slip defense, and path-traversal protection.

---

## ⚡ Quick Start

### 1. Install Globally via NPM
```bash
npm install -g @francisiv/orbitkit
```

*Or run on-demand with zero installation:*
```bash
npx @francisiv/orbitkit doctor
```

> **Aliases:** Both `orbitkit` and `devdock` binaries are installed globally. Use whichever you prefer!

### 2. Launch the Interactive Web GUI or TUI
```bash
orbitkit
# or explicitly open the browser dashboard:
orbitkit ui
```

### 3. Diagnose Your Godot & AI Environment
```bash
orbitkit doctor
```

### 4. Scan & Keep All Local Godot Projects Updated
```bash
orbitkit scan .
orbitkit update --all
```

---

## 🛠️ CLI Command Matrix

| Command | Description |
|---|---|
| `orbitkit` | Launches the interactive OrbitKit dashboard / minimalist TUI menu. |
| `orbitkit ui` *(alias `gui`)* | Launches the interactive OrbitKit GUI web dashboard in your browser. |
| `orbitkit doctor` | Diagnoses Godot 4 binary, LSP port 6005, and project context. |
| `orbitkit scan [dir]` | Recursively scans for Godot projects and inspects installed addons and skills. |
| `orbitkit init` | Initializes OrbitKit in current game project and installs default skills/MCPs. |
| `orbitkit check [--json] [--force]` | Checks remote catalog for new/outdated AI skills and CLI updates (works offline via cache). |
| `orbitkit watch` | Foreground watcher that periodically checks and applies safe skill updates. |
| `orbitkit autoupdate enable\|disable` | Configures OS-native scheduled checks (`systemd`, `launchd`, `schtasks`). |
| `orbitkit update [--all]` | Upgrades AI skills and addons to latest verified versions across projects. |
| `orbitkit upgrade [--check]` | Checks NPM & GitHub releases and self-updates the global `@francisiv/orbitkit` CLI. |
| `orbitkit uninstall [--project]` | Uninstalls the global OrbitKit CLI or cleans injected skills/MCPs from a project. |
| `orbitkit skill list` | Lists all 9 verified Godot 4 & Blender 3D AI Skills. |
| `orbitkit skill install <id>` | Installs an AI skill into `.agents/skills/` and `.claude/skills/`. |
| `orbitkit mcp list` | Lists all 6 supported Model Context Protocol servers. |
| `orbitkit mcp add <server-id>` | Configures an MCP server directly into `.mcp.json`. |

---

## 🧠 Curated Godot 4 & Blender 3D AI Skills

Pre-configured instruction rulesets (`SKILL.md`) that guide **Antigravity**, **Claude Code**, **Cursor**, and **Windsurf** to generate idiomatic, clean **GDScript 4** and **Blender Python (`bpy`)** code:

| Skill ID | Version | Description |
|---|---|---|
| **`godot4-syntax-guardian`** | `v1.3.0` | Anti-hallucination guard. Enforces `TileMapLayer`, `FileAccess`, `Callable` signals, and prevents Godot 3 syntax. |
| **`gdscript-fsm-master`** | `v1.2.0` | Decoupled Finite State Machine pattern for player controllers and enemy combat AI. |
| **`godot-multiplayer-enet`** | `v1.0.0` | Authoritative multiplayer architecture using `ENetMultiplayerPeer` and `@rpc` decorators. |
| **`godot-shader-vfx`** | `v1.2.0` | 2D & 3D `.gdshader` pipeline, screen distortions, and mobile GPU optimization. |
| **`godot-procedural-generation`** | `v1.1.0` | `FastNoiseLite` algorithms, autotiling, and dynamic `AStar2D`/`AStar3D` pathfinding. |
| **`godot-responsive-ui`** | `v1.1.0` | Responsive UI layouts using `Control` Containers and Anchors (no hardcoded coordinates). |
| **`godot-save-system`** | `v1.0.0` | JSON/binary save pipeline with SHA-256 HMAC integrity signatures. |
| **`ctx7-docs-fetcher`** | `v1.0.0` | Live documentation retrieval protocol via Upstash Context7. |
| **`blender-3d-pipeline`** | `v1.2.0` | Automated Blender 4.x to Godot 4 `.glb`/`.gltf` export pipeline, `-col`/`-navmesh` suffixes, and `bpy` scripts. |

👉 [Read the detailed AI Skills Documentation](docs/skills.md)

---

## 🔌 Godot 4 Model Context Protocol (MCP) Suite

Bridge your AI assistants directly into the Godot editor:

- **`ctx7` (Context7 by Upstash)**: Live documentation MCP for version-locked API docs.
- **`godot-engine-bridge`**: Live editor control: run game, capture console/error logs, hot-reload scripts.
- **`godot-lsp`**: Bridges AI assistants to Godot GDScript LSP (`localhost:6005`) for real-time diagnostics.
- **`godot-docs`**: Zero-latency offline documentation lookup for Godot 4 class references.
- **`godot-scene-inspector`**: Parses `.tscn` and `.tres` node hierarchies safely without breaking UIDs.
- **`godot-gut-runner`**: Runs GUT (Godot Unit Testing) test suites and streams results to your AI agent.

```bash
# Example: Add Context7 and Godot LSP to your project
orbitkit mcp add ctx7
orbitkit mcp add godot-lsp
```

👉 [Read the detailed MCP Documentation](docs/mcp.md)

---

## 🔔 Auto-Updates & Notifications

OrbitKit continuously detects newly published AI skills and updates to installed skills without blocking your terminal commands:

- **Passive Background Checks**: Uses HTTP `ETag` caching (`~/.local/state/orbitkit/state.json`) and a detached worker so CLI commands never wait on network requests.
- **On-Demand Check**: Run `orbitkit check` (or `orbitkit check --json` for CI/tooling) to inspect new skills, outdated skills, and CLI version status.
- **OS Scheduler Integration**: Run `orbitkit autoupdate enable --every 6h` to register a native `systemd` user timer (Linux), `LaunchAgent` (macOS), or `schtasks` job (Windows).
- **Safe Atomic Updates & Rollback**: `orbitkit update --all` verifies SHA-256 checksums, creates backups in `.devdock/backups/`, extracts atomically, and rolls back automatically if verification fails.

---

## 🎮 Godot Engine Editor Plugin

Manage packages, updates, and diagnostics directly from Godot:
1. Copy or symlink `godot-plugin/addons/devdock/` into your project's `res://addons/devdock/`.
2. Enable in Godot: **Project -> Project Settings -> Plugins -> DevDock**.
3. A dedicated **DevDock** dock will appear in your editor right panel.

---

## 🔒 Security Architecture

- **Path Traversal Protection**: Rejects file paths containing `..`, absolute paths (`/etc/`), or escaping prefixes.
- **Zip Slip Defense**: Validates every extracted archive member against the target project directory.
- **Cryptographic Checksums**: Verifies packages with SHA-256 / SHA-512 hashes before writing to disk.
- **Restricted Directories**: Installs strictly to `res://addons/` and `.agents/skills/`.

👉 [Read the Security Policy](docs/security.md)

---

## 🌳 Git Branching & Workflow

```text
feature/<name>  ───►  develop  ───►  stage  ───►  main (Production)
```

- **`main`**: Production branch deployed to Vercel and NPM.
- **`stage`**: Release candidates and pre-production staging.
- **`develop`**: Active development and integration branch.
- **`feature/*`**: Create your branch off `develop` when contributing new features.

---

## 📦 Monorepo Structure

```text
OrbitKit/
├── packages/
│   ├── cli/               # @francisiv/orbitkit (published to NPM)
│   ├── manifest-schema/   # Zod manifest schema & security verifications
│   └── shared-types/      # Shared TypeScript types & API contracts
├── apps/
│   ├── web/               # Official Documentation & Web portal (Vite + React)
│   └── api/               # Central REST API (Express + Argon2id)
├── godot-plugin/
│   └── addons/devdock/    # Native Godot 4 Editor Addon
└── docs/                  # In-depth architectural & API guides
```

---

## 🌐 Español — Resumen Rápido

**OrbitKit (`@francisiv/orbitkit`)** es el ecosistema de **AI Skills**, servidores **Model Context Protocol (MCP)** y gestor de paquetes para desarrolladores de **Godot Engine 4** y **Blender 3D**. Evita que asistentes de IA (**Claude Code, Cursor, Windsurf, Antigravity**) alucinen sintaxis obsoleta de Godot 3 e integra documentación en tiempo real, panel web local (`orbitkit ui`) y actualizaciones automáticas seguras.

- **Web oficial y documentación interactiva:** [https://orbit-kit-nine.vercel.app](https://orbit-kit-nine.vercel.app)
- **Instalación global:** `npm install -g @francisiv/orbitkit`

---

## 📄 License

Distributed under the [MIT License](LICENSE).
