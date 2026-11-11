# VGskillframe (Videogame Skill Frame) System Architecture

VGskillframe is an end-to-end tooling and catalog ecosystem tailored for Godot 4 game developers and AI coding agents.

```
       ┌────────────────────────────────────────────────────────┐
       │                NPM / Public Registry                   │
       │            @francisiv/vgskillframe (CLI)               │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       ┌───────────────────────┐       ┌───────────────────────┐
       │   Developer Machine   │       │   Web Documentation   │
       │  `vgskillframe / ui`  │       │   (Vite + React)      │
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
| `packages/cli` | `@francisiv/vgskillframe` | Standalone CLI tool. Scans Godot projects, manages AI skills and MCP servers. Binary: `vgskillframe` (aliases: `vgskill`, `orbitkit`, `devdock`). |
| `packages/manifest-schema` | `@devdock/manifest-schema` | Zod schema validator, SHA-256 checksum verifier, Zip Slip attack defender. |
| `packages/shared-types` | `@devdock/shared-types` | TypeScript interfaces for resources, manifests, versions, and API contracts. |
| `apps/web` | `@devdock/web` | Documentation portal, Engram-inspired aesthetics with Godot palette. |
| `apps/api` | `@devdock/api` | Central registry REST API with Argon2id auth and rate limiting. |
| `godot-plugin/addons/vgskillframe` | `vgskillframe` Godot Addon | Native Godot 4 editor plugin for package management inside the engine. |
| `catalog.json` | Versioned Catalog | Root catalog with SHA-256 checksums for deterministic skill archives (`skills/*.zip`). |

---

## Continuous Update & Notification Flow

```
┌──────────────────┐   HTTPS + ETag   ┌───────────────────┐
│  catalog.json    │◄────────────────│  updateChecker.ts │
│  (repo or API)   │                  └─────────┬─────────┘
└──────────────────┘                            │ diff
                                     ┌──────────▼──────────┐
                                     │  state.json (cache) │
                                     │  + config.json      │
                                     └──────┬───────┬──────┘
                                            │       │
                              ┌─────────────▼─┐   ┌─▼──────────────┐
                              │ notifier.ts   │   │ applier.ts     │
                              │ terminal/     │   │ safe apply     │
                              │ desktop/marker│   │ backup+rollback│
                              └───────────────┘   └────────────────┘
```

- **Non-blocking passive checks**: Every CLI invocation spawns a detached background worker (`checkWorker.ts`) when `now >= nextCheckAt` and renders a cached one-line banner in `postAction` with zero network latency on the main process.
- **Safe application (`applier.ts`)**: Verifies `sha256` checksums, backs up existing skills into `.devdock/backups/<timestamp>/`, extracts atomically with Zip Slip protection, rolls back automatically on failure, and skips major versions unless `allowMajor` is enabled.

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
