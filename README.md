# DevDock (OrbitKit)

> **Everything your game development environment needs, in one place.**

DevDock is an open-source tool and ecosystem designed to centralize discovery, installation, configuration, health diagnostics, and updates of game development resources, Godot addons, and AI skills.

---

## Monorepo Architecture

```text
devdock/
├── packages/
│   ├── cli/               # Global DevDock CLI (scanner, skills updater, MCP manager)
│   ├── manifest-schema/   # Zod manifest schema & cryptographic verification
│   └── shared-types/      # Shared TypeScript types & API contracts
├── apps/
│   ├── web/               # Web catalog (React + Vite + TypeScript + Tailwind)
│   └── api/               # Central REST API (Express + MongoDB + Argon2id)
├── godot-plugin/
│   └── addons/devdock/    # Godot 4.x Editor Plugin (GDScript)
├── docs/                  # Architecture, security, API and contribution guides
├── .env.example           # Environment template
└── package.json           # Root pnpm workspaces configuration
```

---

## DevDock CLI Usage

The DevDock CLI automatically manages your Godot projects, keeps AI agent skills updated, and connects MCP servers.

### Global Commands:
```bash
# 1. Scan your PC or folder for all Godot projects and inspect installed assets
devdock scan .

# 2. Update AI skills, MCPs, and Addons to the latest versions
devdock update              # Current project
devdock update --all        # Batch update all projects found in directory tree

# 3. Explore & Install Curated AI Skills (for Antigravity, Claude Code, Cursor)
devdock skill list
devdock skill install gdscript-architect
devdock skill install godot-shader-expert

# 4. Manage Model Context Protocol (MCP) Servers
devdock mcp list
devdock mcp add godot-lsp
devdock mcp add godot-docs

# 5. Environment & Godot Engine Health Diagnostics
devdock doctor

# 6. Initialize DevDock in a Godot project
devdock init
```

---

## Quickstart

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x
- Godot 4.x (for editor plugin)

### Installation
```bash
# Install all dependencies across the monorepo
pnpm install

# Build all packages and applications
pnpm build

# Run unit & integration test suites
pnpm test
```

### Development
```bash
# Start API in watch mode
pnpm dev:api

# Start Web portal
pnpm dev:web
```

---

## Key Principles & Security
- **Privacy by Design**: No telemetry, no sensitive data requested, no user account required for public browsing.
- **Local Control**: Packages install strictly inside permitted paths (`res://addons/`, `.agents/skills/`) with automated protection against Path Traversal and Zip Slip attacks.
- **Cryptographic Verification**: Integrities are validated via SHA-256 before disk writes.

---

## License
MIT
