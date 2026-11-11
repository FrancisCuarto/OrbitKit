# Curated Godot 4 AI Skills

AI Skills provide domain-specific instructions, constraints, and pattern architectures directly to AI coding assistants (such as Google Antigravity, Claude Code, Cursor, Codex, and Windsurf).

Each skill is installed directly into `.agents/skills/<skill-id>/SKILL.md` (and `.claude/skills/<skill-id>/SKILL.md`).

---

## 1. `godot4-syntax-guardian` (v1.3.0)
- **ID**: `godot4-syntax-guardian`
- **Purpose**: Strict Anti-Hallucination Guard for Godot 4.3+.
- **What it enforces**:
  - Enforces `TileMapLayer` over deprecated `TileMap`.
  - Replaces obsolete `File` and `Directory` with `FileAccess` and `DirAccess`.
  - Enforces typed Callable signal connections (`button.pressed.connect(_on_pressed)` instead of string signals).
  - Strictly prevents manual velocity arguments inside `move_and_slide()` on `CharacterBody2D`/`3D`.
  - Enforces static typing across variables and function return signatures.

```bash
vgskillframe skill install godot4-syntax-guardian
```

---

## 2. `gdscript-fsm-master` (v1.2.0)
- **ID**: `gdscript-fsm-master`
- **Purpose**: Modular Finite State Machine (FSM) Architecture.
- **What it enforces**:
  - Encapsulates player, combat, and enemy states into dedicated `Node` subclasses (`State`).
  - Implements clean lifecycle methods: `enter()`, `exit()`, `physics_update(delta)`, `handle_input(event)`.
  - Decouples state switching using typed transition signals instead of deeply nested if-else ladders.

```bash
vgskillframe skill install gdscript-fsm-master
```

---

## 3. `godot-multiplayer-enet` (v1.0.0)
- **ID**: `godot-multiplayer-enet`
- **Purpose**: Authoritative Multiplayer & Networking with ENet.
- **What it enforces**:
  - Configures `ENetMultiplayerPeer` for high-performance UDP networking.
  - Correctly annotates Remote Procedure Calls: `@rpc("any_peer", "call_local", "reliable")`.
  - Enforces server authority validation before applying damage or position changes.
  - Integrates `MultiplayerSpawner` and `MultiplayerSynchronizer` nodes.

```bash
vgskillframe skill install godot-multiplayer-enet
```

---

## 4. `godot-shader-vfx` (v1.2.0)
- **ID**: `godot-shader-vfx`
- **Purpose**: Godot Shading Language (GDShader) VFX & Post-Processing.
- **What it enforces**:
  - GLSL pipelines for `canvas_item` (2D) and `spatial` (3D).
  - UV distortion math, chromatic aberration, dissolve thresholds, and dissolve borders.
  - Proper use of `hint_screen_texture, filter_linear_mipmap` (Godot 4 replacement for `SCREEN_TEXTURE`).
  - Mobile GPU performance optimizations (minimizing branching inside `fragment()`).

```bash
vgskillframe skill install godot-shader-vfx
```

---

## 5. `godot-procedural-generation` (v1.1.0)
- **ID**: `godot-procedural-generation`
- **Purpose**: Deterministic Proc-Gen & Graph Pathfinding.
- **What it enforces**:
  - `FastNoiseLite` setup with seeded cellular/simplex noise for terrain generation.
  - `TileMapLayer` autotiling terrain bitmasks (`set_cell(coords, source_id, atlas_coords)`).
  - `AStar2D` and `AStar3D` navigation graphs for dynamic obstacle recalculation.

```bash
vgskillframe skill install godot-procedural-generation
```

---

## 6. `godot-responsive-ui` (v1.1.0)
- **ID**: `godot-responsive-ui`
- **Purpose**: Multi-Resolution Responsive UI & Layouts.
- **What it enforces**:
  - Strictly prohibits manual absolute pixel coordinates (`position = Vector2(300, 200)`).
  - Builds robust layouts using Container trees: `VBoxContainer`, `HBoxContainer`, `MarginContainer`, `GridContainer`.
  - Proper `SIZE_EXPAND_FILL` sizing flags and anchors.
  - Dynamic UI styling with `add_theme_color_override` or centralized `.tres` Theme resources.

```bash
vgskillframe skill install godot-responsive-ui
```

---

## 7. `godot-save-system` (v1.0.0)
- **ID**: `godot-save-system`
- **Purpose**: Anti-Corruption Cryptographic Save System.
- **What it enforces**:
  - Serializes game state into structured JSON or binary dictionaries.
  - Appends SHA-256 HMAC integrity signatures to detect save tampering.
  - Implements atomic writes (`save.tmp` -> rename) to prevent file corruption during unexpected power cuts or game crashes.

```bash
vgskillframe skill install godot-save-system
```

---

## 8. `ctx7-docs-fetcher` (v1.0.0)
- **ID**: `ctx7-docs-fetcher`
- **Purpose**: Upstash Context7 Live Documentation Protocol.
- **What it enforces**:
  - Instructs AI assistants to query Context7 MCP or CLI tools (`npx -y ctx7 query <lib>`) before writing code for external libraries or uncommon APIs.
  - Guarantees fresh, version-locked reference code to completely eliminate API hallucinations.

```bash
vgskillframe skill install ctx7-docs-fetcher
```
