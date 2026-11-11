# VGskillframe (Videogame Skill Frame) CLI Reference

The official command-line interface for Godot 4 & Blender developers and AI coding agents.

Package on NPM: [`@francisiv/vgskillframe`](https://www.npmjs.com/package/@francisiv/vgskillframe)

---

## Installation

### Global Installation via NPM
```bash
npm install -g @francisiv/vgskillframe
```

### Zero-Install (On-Demand with NPX)
```bash
npx @francisiv/vgskillframe doctor
npx @francisiv/vgskillframe scan .
```

> **Note**: `vgskillframe`, `vgskill`, `orbitkit`, and `devdock` binary aliases are registered in your system PATH upon installation. You can use whichever you prefer.

---

## Commands

### `vgskillframe ui` / `vgskillframe gui`
Launches the interactive VGskillframe GUI web dashboard in your default browser.
- Visual dashboard for Godot 4 projects, AI Skills, MCP servers, and diagnostics.
- 1-click install for curated AI skills (`godot4-syntax-guardian`, `gdscript-fsm-master`, etc.).
- 1-click configuration for Godot MCP servers in `.mcp.json`.
- Live system diagnostics and real-time execution log drawer.

```bash
vgskillframe ui
vgskillframe gui --port 5000
vgskillframe ui --no-open
```

### `vgskillframe doctor`
Performs comprehensive diagnostic checks of your local development environment:
- Verifies Node.js runtime version.
- Locates Godot 4 binary in system `PATH`.
- Tests local GDScript Language Server (LSP) connectivity on port `6005`.
- Validates the current project structure and context.

```bash
vgskillframe doctor
```

### `vgskillframe scan [directory]`
Recursively searches your system or a specified folder for Godot projects (`project.godot`).
- Identifies Godot version and settings.
- Lists installed addons under `res://addons/`.
- Inspects configured AI Skills under `.agents/skills/`.
- Verifies `.mcp.json` configuration.
- Flags available version updates.

```bash
vgskillframe scan .
vgskillframe scan ~/Games/
```

### `vgskillframe init`
Initializes VGskillframe inside a new or existing Godot project.
- Creates local `.devdock/` configuration directory.
- Installs the core `godot4-syntax-guardian` AI skill into `.agents/skills/`.
- Configures default MCP servers (`godot-lsp`, `godot-docs`) in `.mcp.json`.
- Installs and enables the `addons/vgskillframe` Godot Editor plugin.

```bash
cd my-godot-project
vgskillframe init
```

### `vgskillframe check [--json] [--force]`
Checks the remote `catalog.json` (with ETag + local cache in `~/.local/state/vgskillframe/state.json`) for new AI Skills, outdated project skills, and newer CLI versions without modifying project files.
- `--json`: Outputs a machine-readable `UpdateReport` JSON object without colors or spinners.
- `--force`: Bypasses the cached `nextCheckAt` interval and queries the remote catalog immediately.
- `--notify`: Emits deduplicated desktop notifications and updates `.devdock/update-available.json`.

```bash
vgskillframe check
vgskillframe check --force
vgskillframe check --json
```

### `vgskillframe watch [--interval <minutes>] [--auto-update] [--notify]`
Runs a foreground daemon that periodically checks for catalog updates (with jitter and exponential backoff when offline) and optionally applies patch/minor skill updates.

```bash
vgskillframe watch --interval 60 --auto-update --notify
```

### `vgskillframe autoupdate <enable|disable>`
Configures OS-native background update checks (systemd user timer on Linux, LaunchAgent on macOS, or `schtasks` on Windows) with zero resident daemon overhead.

```bash
vgskillframe autoupdate enable --every 6h
vgskillframe autoupdate disable
```

### `vgskillframe update [--all]`
Checks installed skills and addons against latest catalog versions.
- Running without flags updates the current project.
- Running with `--all` recursively updates every Godot project found on your system.

```bash
vgskillframe update           # Current project
vgskillframe update --all     # Batch update across all local projects
```

### `vgskillframe skill list`
Displays all verified, curated AI Skills designed specifically for Godot 4 and GDScript.

```bash
vgskillframe skill list
```

### `vgskillframe skill install <skill-id>`
Installs or updates a curated AI skill into `.agents/skills/<skill-id>/` and `.claude/skills/<skill-id>/`. Compatible with AI assistants such as Antigravity, Claude Code, Cursor, and Windsurf.

```bash
vgskillframe skill install godot4-syntax-guardian
vgskillframe skill install gdscript-fsm-master
vgskillframe skill install ctx7-docs-fetcher
```

### `vgskillframe mcp list`
Lists all verified Model Context Protocol (MCP) servers tailored for Godot 4.

```bash
vgskillframe mcp list
```

### `vgskillframe mcp add <server-id>`
Configures an MCP server into `.mcp.json` in the current project root so coding assistants gain live access to editor internals.

```bash
vgskillframe mcp add ctx7
vgskillframe mcp add godot-lsp
vgskillframe mcp add godot-engine-bridge
```

---

## Environment Variables

| Variable | Effect |
|---|---|
| `VGSKILLFRAME_NO_UPDATE_CHECK=1` / `ORBITKIT_NO_UPDATE_CHECK=1` | Disables all passive background update checks and banners. |
| `VGSKILLFRAME_CATALOG_URL` / `ORBITKIT_CATALOG_URL` | Overrides the remote `catalog.json` URL (HTTPS required, or `http://localhost` in tests). |
| `VGSKILLFRAME_CONFIG` / `ORBITKIT_CONFIG` | Overrides the path to `config.json`. |
| `CI=true` | Automatically disables passive background checks and terminal banners. |
| `NO_COLOR=1` | Disables ANSI colors in terminal output. |
