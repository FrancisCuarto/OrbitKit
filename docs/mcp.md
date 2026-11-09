# Godot 4 Model Context Protocol (MCP) Suite

The Model Context Protocol (MCP) provides an open standard for AI coding agents to connect directly with external development tools and editor runtime internals.

When you run `orbitkit mcp add <server-id>`, OrbitKit configures `.mcp.json` in your Godot project root so compatible AI assistants (such as Google Antigravity, Claude Code, Cursor, Windsurf) connect seamlessly.

---

## Supported MCP Servers

### 1. `ctx7` (Context7 by Upstash)
- **ID**: `ctx7`
- **Command**: `npx -y ctx7 mcp`
- **What it does**: Provides version-locked, real-time documentation retrieval for external libraries and engines directly into the agent context, eliminating hallucinations.
```bash
orbitkit mcp add ctx7
```

### 2. `godot-engine-bridge`
- **ID**: `godot-engine-bridge`
- **Command**: `npx -y @devdock/mcp-godot-bridge`
- **What it does**: Live Godot 4 editor control bridge. Allows AI agents to run the game, capture live console/debugger errors in real time, hot-reload scripts, and inspect active scene trees.
```bash
orbitkit mcp add godot-engine-bridge
```

### 3. `godot-lsp`
- **ID**: `godot-lsp`
- **Command**: `npx -y @devdock/mcp-godot-lsp`
- **Environment**: `{ "GODOT_LSP_PORT": "6005" }`
- **What it does**: Connects AI agents directly to Godot's built-in GDScript Language Server. Provides real-time compiler diagnostics, typed autocompletions, and method signature assistance while writing code.
```bash
orbitkit mcp add godot-lsp
```

### 4. `godot-docs`
- **ID**: `godot-docs`
- **Command**: `npx -y @devdock/mcp-godot-docs`
- **What it does**: Zero-latency offline documentation lookup covering all Godot 4 classes, methods, signals, properties, and inheritance trees.
```bash
orbitkit mcp add godot-docs
```

### 5. `godot-scene-inspector`
- **ID**: `godot-scene-inspector`
- **Command**: `npx -y @devdock/mcp-godot-project`
- **What it does**: Safely parses `.tscn` and `.tres` files so AI assistants can navigate node hierarchies without corrupting internal resource UIDs.
```bash
orbitkit mcp add godot-scene-inspector
```

### 6. `godot-gut-runner`
- **ID**: `godot-gut-runner`
- **Command**: `npx -y @devdock/mcp-godot-gut`
- **What it does**: Automates unit testing using the popular GUT (Godot Unit Testing) framework. AI agents can execute test suites and stream pass/fail feedback directly into the prompt conversation.
```bash
orbitkit mcp add godot-gut-runner
```

---

## Generated `.mcp.json` Example

```json
{
  "mcpServers": {
    "godot-engine-bridge": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-bridge"]
    },
    "godot-lsp": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-lsp"],
      "env": {
        "GODOT_LSP_PORT": "6005"
      }
    },
    "godot-docs": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-docs"]
    },
    "godot-scene-inspector": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-project"]
    },
    "godot-gut-runner": {
      "command": "npx",
      "args": ["-y", "@devdock/mcp-godot-gut"]
    },
    "ctx7": {
      "command": "npx",
      "args": ["-y", "ctx7", "mcp"]
    }
  }
}
```
