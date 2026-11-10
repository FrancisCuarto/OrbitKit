<div align="center">

# 🚀 OrbitKit (DevDock)

**The AI Skills, MCP Servers & Package Ecosystem for Godot 4 Developers**

[![npm version](https://img.shields.io/npm/v/@francisiv/orbitkit.svg?style=flat-square&color=478cbf)](https://www.npmjs.com/package/@francisiv/orbitkit)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Godot 4.x](https://img.shields.io/badge/Godot-4.x-478cbf?style=flat-square&logo=godotengine&logoColor=white)](https://godotengine.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

Keep all your local Godot 4 projects constantly updated with the latest AI coding skills, Model Context Protocol (MCP) servers, and verified addons.

[Official Documentation](https://github.com/FrancisCuarto/OrbitKit/tree/main/docs) • [NPM Package](https://www.npmjs.com/package/@francisiv/orbitkit) • [Report Issue](https://github.com/FrancisCuarto/OrbitKit/issues)

</div>

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

### 2. Diagnose Your Godot & AI Environment
```bash
orbitkit doctor
```

### 3. Scan All Local Godot Projects
```bash
orbitkit scan .
```

### 4. Keep All Projects Synchronized & Updated
```bash
orbitkit update --all
```

---

## 🛠️ CLI Command Matrix

| Command | Description |
|---|---|
| `orbitkit ui` *(alias `gui`)* | Launches the interactive OrbitKit GUI web dashboard in your browser. |
| `orbitkit doctor` | Diagnoses Godot 4 binary, LSP port 6005, and project context. |
| `orbitkit scan [dir]` | Recursively scans for Godot projects and inspects installed addons and skills. |
| `orbitkit init` | Initializes OrbitKit in current game project and installs default skills/MCPs. |
| `orbitkit update [--all]` | Upgrades AI skills and addons to latest verified versions across projects. |
| `orbitkit skill list` | Lists all verified Godot 4 AI Skills. |
| `orbitkit skill install <id>` | Installs an AI skill into `.agents/skills/` and `.claude/skills/`. |
| `orbitkit mcp list` | Lists all supported Model Context Protocol servers. |
| `orbitkit mcp add <server-id>` | Configures an MCP server directly into `.mcp.json`. |

---

## 🧠 Curated Godot 4 AI Skills

Pre-configured rulesets and guidelines that instruct AI assistants (Antigravity, Claude Code, Cursor, Windsurf) to generate idiomatic, clean GDScript 4 code:

- **`godot4-syntax-guardian` (v1.3.0)**: Anti-hallucination guard. Enforces `TileMapLayer`, `FileAccess`, Callables signals, and prevents Godot 3 syntax.
- **`gdscript-fsm-master` (v1.2.0)**: Decoupled Finite State Machine pattern for player and enemy combat.
- **`godot-multiplayer-enet` (v1.0.0)**: Authoritative multiplayer architecture using `ENetMultiplayerPeer` and RPC decorators.
- **`godot-shader-vfx` (v1.2.0)**: 2D & 3D GDShader pipeline, screen distortions, and mobile GPU optimization.
- **`godot-procedural-generation` (v1.1.0)**: FastNoiseLite algorithms, autotiling, and dynamic AStar2D/3D pathfinding.
- **`godot-responsive-ui` (v1.1.0)**: Responsive UI layouts using Control Containers and Anchors (no hardcoded coordinates).
- **`godot-save-system` (v1.0.0)**: JSON/binary save pipeline with SHA-256 HMAC integrity signatures.
- **`ctx7-docs-fetcher` (v1.0.0)**: Live documentation retrieval protocol via Upstash Context7.

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

## 📄 License

Distributed under the [MIT License](LICENSE).
