# OrbitKit / DevDock CLI Reference

The official command-line interface for Godot 4 developers and AI coding agents.

Package on NPM: [`@francisiv/orbitkit`](https://www.npmjs.com/package/@francisiv/orbitkit)

---

## Installation

### Global Installation via NPM
```bash
npm install -g @francisiv/orbitkit
```

### Zero-Install (On-Demand with NPX)
```bash
npx @francisiv/orbitkit doctor
npx @francisiv/orbitkit scan .
```

> **Note**: Both `orbitkit` and `devdock` binary aliases are registered in your system PATH upon installation. You can use either interchangeably.

---

## Commands

### `orbitkit doctor`
Performs comprehensive diagnostic checks of your local development environment:
- Verifies Node.js runtime version.
- Locates Godot 4 binary in system `PATH`.
- Tests local GDScript Language Server (LSP) connectivity on port `6005`.
- Validates the current project structure and context.

```bash
orbitkit doctor
```

### `orbitkit scan [directory]`
Recursively searches your system or a specified folder for Godot projects (`project.godot`).
- Identifies Godot version and settings.
- Lists installed addons under `res://addons/`.
- Inspects configured AI Skills under `.agents/skills/`.
- Verifies `.mcp.json` configuration.
- Flags available version updates.

```bash
orbitkit scan .
orbitkit scan ~/Games/
```

### `orbitkit init`
Initializes OrbitKit inside a new or existing Godot project.
- Creates local `.devdock/` configuration directory.
- Installs the core `godot4-syntax-guardian` AI skill into `.agents/skills/`.
- Configures default MCP servers (`godot-lsp`, `godot-docs`) in `.mcp.json`.

```bash
cd my-godot-project
orbitkit init
```

### `orbitkit update [--all]`
Checks installed skills and addons against latest catalog versions.
- Running without flags updates the current project.
- Running with `--all` recursively updates every Godot project found on your system.

```bash
orbitkit update           # Current project
orbitkit update --all     # Batch update across all local projects
```

### `orbitkit skill list`
Displays all verified, curated AI Skills designed specifically for Godot 4 and GDScript.

```bash
orbitkit skill list
```

### `orbitkit skill install <skill-id>`
Installs or updates a curated AI skill into `.agents/skills/<skill-id>/` and `.claude/skills/<skill-id>/`. Compatible with AI assistants such as Antigravity, Claude Code, Cursor, and Windsurf.

```bash
orbitkit skill install godot4-syntax-guardian
orbitkit skill install gdscript-fsm-master
orbitkit skill install ctx7-docs-fetcher
```

### `orbitkit mcp list`
Lists all verified Model Context Protocol (MCP) servers tailored for Godot 4.

```bash
orbitkit mcp list
```

### `orbitkit mcp add <server-id>`
Configures an MCP server into `.mcp.json` in the current project root so coding assistants gain live access to editor internals.

```bash
orbitkit mcp add ctx7
orbitkit mcp add godot-lsp
orbitkit mcp add godot-engine-bridge
```
