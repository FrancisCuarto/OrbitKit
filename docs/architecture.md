# OrbitKit System Architecture

OrbitKit is an end-to-end tooling and catalog ecosystem tailored for Godot 4 game developers and AI coding agents.

```
       ┌────────────────────────────────────────────────────────┐
       │                NPM / Public Registry                   │
       │              @francisiv/orbitkit (CLI)                 │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       ┌───────────────────────┐       ┌───────────────────────┐
       │   Developer Machine   │       │   Web Documentation   │
       │   `orbitkit / devdock`│       │   (Vite + React)      │
       └──────────┬────────────┘       └───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌────────────────────────────────┐
│ Godot Editor  │   │ AI Coding Assistant            │
│  LSP (6005)   │◄──┤ (Antigravity, Claude, Cursor)  │
│  Plugin UI    │   │  - Curated AI Skills           │
│  Scene Trees  │   │  - Godot MCP Servers           │
└───────────────┘   │  - Context7 (ctx7) Live Docs   │
                    └────────────────────────────────┘
```

---

## Workspace Layout

| Path | Name | Description |
|---|---|---|
| `packages/cli` | `@francisiv/orbitkit` | Standalone CLI tool. Scans Godot projects, manages AI skills and MCP servers. |
| `packages/manifest-schema` | `@devdock/manifest-schema` | Zod schema validator, SHA-256 checksum verifier, Zip Slip attack defender. |
| `packages/shared-types` | `@devdock/shared-types` | TypeScript interfaces for resources, manifests, versions, and API contracts. |
| `apps/web` | `@devdock/web` | Documentation portal, Engram-inspired aesthetics with Godot palette. |
| `apps/api` | `@devdock/api` | Central registry REST API with Argon2id auth and rate limiting. |
| `godot-plugin/addons/devdock` | `devdock` Godot Addon | Native Godot 4 editor plugin for package management inside the engine. |

---

## Git Branching Strategy

To maintain high release stability and prevent accidental deployments to production:

```
feature/*  ───►  develop  ───►  stage  ───►  main (Production)
```

1. **`main`**: Production-ready branch. Deploys to live Vercel web portal and mirrors the active NPM releases.
2. **`stage`**: Pre-production staging environment for integration verification and release candidates.
3. **`develop`**: Primary integration branch for active development.
4. **`feature/<name>`**: Feature branches branched off from `develop`. PRs merge back into `develop`.
