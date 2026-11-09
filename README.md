# DevDock (OrbitKit)

> **Everything your game development environment needs, in one place.**

DevDock is an open-source tool and ecosystem designed to centralize discovery, installation, configuration, health diagnostics, and updates of game development resources, Godot addons, and AI skills.

---

## Monorepo Architecture

```text
devdock/
├── apps/
│   ├── web/               # Web catalog (React + Vite + TypeScript + Tailwind)
│   └── api/               # Central REST API (Express + MongoDB + Argon2id)
├── godot-plugin/
│   └── addons/devdock/    # Godot 4.x Editor Plugin (GDScript)
├── packages/
│   ├── manifest-schema/   # Zod manifest schema & cryptographic verification
│   └── shared-types/      # Shared TypeScript types & API contracts
├── docs/                  # Architecture, security, API and contribution guides
├── .env.example           # Environment template
└── package.json           # Root pnpm workspaces configuration
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
