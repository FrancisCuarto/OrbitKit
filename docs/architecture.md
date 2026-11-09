# DevDock Architecture & System Overview

## 1. High-Level Architecture

DevDock is organized as a modular monorepo containing:
- **`apps/web`**: Public discovery catalog, documentation, and web portal built with React, Vite, TypeScript, and Tailwind CSS.
- **`apps/api`**: Centralized metadata REST API built with Node.js, Express, TypeScript, and MongoDB.
- **`godot-plugin/addons/devdock`**: Native Godot 4.x Editor Plugin in GDScript.
- **`packages/manifest-schema`**: Strict Zod-based manifest validation and cryptographic verification engine.
- **`packages/shared-types`**: Single source of truth for TypeScript interfaces, enums, and API contracts.

```
                    DEVDOCK ECOSYSTEM
                    
                 ┌───────────────────────┐
                 │      DEVDOCK WEB      │
                 │   (React + Vite + TS) │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │      REST API         │
                 │  (Express + Security) │
                 └───────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   ┌─────────────────┐               ┌─────────────────┐
   │ MongoDB Storage │               │    Artifacts    │
   │  (Metadata DB)  │               │ (Release Hosts) │
   └─────────────────┘               └─────────────────┘
                                              ▲
                                              │
                                     ┌────────┴────────┐
                                     │                 │
                             ┌───────┴──────┐   ┌──────┴──────┐
                             │ Godot Plugin │   │ Other Tools │
                             │   (Editor)   │   │  (Blender)  │
                             └──────────────┘   └─────────────┘
```

## 2. Core Separation of Responsibilities

1. **Central API**: Manages manifests, version indexes, metadata, and compatibility matrices. Does **never** store user projects or private development code.
2. **Local Processing**: Installation, ZIP extraction, file placements, and diagnostic health checks run purely on the user's local workstation under their supervision.
3. **No Silent Operations**: Every download and installation requires explicit confirmation, displays checksum verification, and logs records locally into `res://.devdock/installed.json`.
