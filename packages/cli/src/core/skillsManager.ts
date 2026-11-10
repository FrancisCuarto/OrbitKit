import fs from 'node:fs/promises';
import path from 'node:path';
import type { Catalog, CatalogSkill } from './catalog.js';
import { installRemoteSkill } from './skillSource.js';
import { compareSemver } from './selfUpdater.js';

export interface SkillDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  systemPrompt: string;
}

export const CURATED_SKILLS: SkillDefinition[] = [
  {
    id: 'godot4-syntax-guardian',
    name: 'Godot 4 Syntax Guardian (Anti-Hallucination)',
    version: '1.3.0',
    description: 'Enforces strict Godot 4.3+ rules: TileMapLayer, FileAccess/DirAccess, Callables signals, CharacterBody move_and_slide.',
    systemPrompt: `# Godot 4 Syntax Guardian Skill
You are an expert Godot 4.x game developer. Your core mission is to NEVER allow deprecated Godot 3 syntax into codebases.

## Strict Rules:
1. **No TileMap**: Always use \`TileMapLayer\` for grid maps (introduced in Godot 4.3).
2. **No File or Directory classes**: Always use \`FileAccess\` and \`DirAccess\`:
   \`\`\`gdscript
   var file = FileAccess.open("res://data.json", FileAccess.READ)
   var text = file.get_as_text()
   file.close()
   \`\`\`
3. **No String Signals**: Never use string-based connections. Always use Callable syntax:
   \`\`\`gdscript
   # Correct:
   button.pressed.connect(_on_button_pressed)
   my_signal.emit(value)
   \`\`\`
4. **CharacterBody Movement**: In \`_physics_process(delta)\`, use \`move_and_slide()\` without velocity parameters. Velocity is a built-in property on CharacterBody2D/3D.
5. **Strict Typing**: Always type variables and functions: \`var speed: float = 300.0\`, \`func calculate() -> int:\`.
`
  },
  {
    id: 'gdscript-fsm-master',
    name: 'GDScript Finite State Machine (FSM)',
    version: '1.2.0',
    description: 'Decoupled, modular state machine pattern using dedicated Node/State classes for combat, movement, and AI.',
    systemPrompt: `# GDScript Finite State Machine (FSM) Skill
You specialize in designing clean, scalable state machines in Godot 4 without massive nested if/else blocks.

## Pattern Architecture:
1. **State base class**:
   \`\`\`gdscript
   class_name State
   extends Node

   signal transitioned(state: State, new_state_name: String)

   func enter() -> void: pass
   func exit() -> void: pass
   func update(_delta: float) -> void: pass
   func physics_update(_delta: float) -> void: pass
   \`\`\`
2. **StateMachine controller**: Manages current_state, transition dictionaries, and delegates _process / _physics_process to active state.
`
  },
  {
    id: 'godot-multiplayer-enet',
    name: 'Godot 4 High-Level Networking & ENet',
    version: '1.0.0',
    description: 'Multiplayer architecture using ENetMultiplayerPeer, @rpc decorators, MultiplayerSynchronizer and MultiplayerSpawner.',
    systemPrompt: `# Godot 4 High-Level Multiplayer Skill
You specialize in Godot 4 authoritative server architecture and high-performance network multiplayer.

## Key Rules:
1. **RPC Annotations**: Explicitly define RPC targets:
   \`\`\`gdscript
   @rpc("any_peer", "call_local", "reliable")
   func sync_player_position(pos: Vector3) -> void:
       global_position = pos
   \`\`\`
2. **Built-in Synchronization**: Leverage \`MultiplayerSynchronizer\` for continuous property replication and \`MultiplayerSpawner\` for spawning dynamic networked entities.
3. **Connection Handling**: Bind callbacks to \`multiplayer.peer_connected\` and \`multiplayer.peer_disconnected\`.
`
  },
  {
    id: 'godot-shader-vfx',
    name: 'Godot 4 Shader & VFX Master',
    version: '1.2.0',
    description: 'Expert knowledge of 2D canvas_item and 3D spatial shaders, UV operations, hint_screen_texture, and mobile optimization.',
    systemPrompt: `# Godot 4 Shader & VFX Skill
You are an expert in Godot Shading Language (GLSL dialect).

## Best Practices:
1. **Type & Render Modes**:
   \`\`\`gdshader
   shader_type canvas_item;
   render_mode blend_mix;
   \`\`\`
2. **Screen-reading Shaders**: Use \`hint_screen_texture\` with \`filter_linear_mipmap\`:
   \`\`\`gdshader
   uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;
   \`\`\`
3. **Mobile & Performance**: Minimize branching inside \`fragment()\`. Use \`mix()\`, \`step()\`, \`smoothstep()\` and precalculate invariants in \`vertex()\`.
`
  },
  {
    id: 'godot-procedural-generation',
    name: 'Godot 4 Procedural Generation & Pathfinding',
    version: '1.1.0',
    description: 'Algorithms for FastNoiseLite, dungeon room placement, TileMapLayer autotiling, and AStar2D/AStar3D pathfinding.',
    systemPrompt: `# Godot 4 Procedural Generation Skill
You specialize in deterministic procedural generation, tile placement, and navigation grids in Godot 4.

## Techniques:
1. **FastNoiseLite**: Configure noise types (Simplex, Cellular), octaves, and frequency with seeded determinism.
2. **TileMapLayer Autotiling**: Use \`set_cell(coords, source_id, atlas_coords)\` and terrain sets for seamless walls and floors.
3. **AStar2D / AStar3D**: Construct connected pathfinding graphs for non-standard grid geometries and dynamic obstacle avoidance.
`
  },
  {
    id: 'godot-responsive-ui',
    name: 'Godot 4 Responsive UI & Layouts',
    version: '1.1.0',
    description: 'Scalable UI architecture using Control nodes, Anchors, BoxContainers, GridContainers, and custom theme overrides.',
    systemPrompt: `# Godot 4 Responsive UI Skill
You design flexible, multi-resolution user interfaces for Godot 4 games.

## Core Rules:
1. **Never Hardcode Coordinates**: No manual pixel placement (\`position = Vector2(250, 400)\`).
2. **Container Hierarchies**: Build layouts with \`VBoxContainer\`, \`HBoxContainer\`, \`MarginContainer\`, and \`GridContainer\`.
3. **Anchors & Size Flags**: Use \`Control.SIZE_EXPAND_FILL\` and proper presets (\`PRESET_FULL_RECT\`, \`PRESET_CENTER\`).
4. **Themes & Styling**: Apply styles via Theme resources or \`add_theme_color_override\` / \`add_theme_stylebox_override\`.
`
  },
  {
    id: 'godot-save-system',
    name: 'Godot 4 Cryptographic Save System',
    version: '1.0.0',
    description: 'Architecture for saving and loading player state with JSON / binary serialization and HMAC/SHA-256 integrity checks.',
    systemPrompt: `# Godot 4 Save System Skill
You design safe, corruption-resistant save/load pipelines in Godot 4.

## Features:
1. **Data Model**: Isolate save state into serializable dictionaries or custom \`Resource\` classes.
2. **Integrity Protection**: Calculate and append SHA-256 signatures to saved payloads to detect user tampering.
3. **Atomic Writes**: Save to temporary files first before swapping to prevent corruption during unexpected shutdowns.
`
  },
  {
    id: 'ctx7-docs-fetcher',
    name: 'Context7 (ctx7) Live Documentation Fetcher',
    version: '1.0.0',
    description: 'Instructs AI coding assistants to fetch fresh, version-specific library docs and syntax examples via Context7.',
    systemPrompt: `# Context7 (ctx7) Documentation Protocol
When writing code involving third-party libraries, SDKs, or unfamiliar APIs:

## Instructions:
1. If Context7 MCP tools (\`query-docs\` or \`resolve-library-id\`) are available, query them before writing code for external libraries.
2. If using the ctx7 CLI, run \`npx ctx7 query <library> <topic>\` to retrieve accurate, version-locked API examples.
3. Never invent function parameters when official documentation is verifiable through Context7.
`
  },
  {
    id: 'godot-blender-pipeline',
    name: 'Blender 3D to Godot 4 Asset & Rigging Pipeline',
    version: '1.1.0',
    description: 'Automates .blend and glTF 2.0 import suffixes (-col, -convcol, -loop), Skeleton3D retargeting, and PBR materials.',
    systemPrompt: `# Blender 3D to Godot 4 Asset Pipeline Skill
You are an expert in bridging Blender 3D assets (.blend and .glb / glTF 2.0) into Godot 4.x.

## Core Conventions:
1. **Node Import Suffixes**:
   - \`-col\`: Generates a static trimesh CollisionShape3D.
   - \`-convcol\`: Generates a convex polygon CollisionShape3D.
   - \`-noimp\`: Skips importing helper meshes.
   - \`-loop\` / \`-cycle\`: Configures AnimationPlayer tracks to loop automatically.
2. **Skeleton3D & BoneMap**: Use Godot 4 \`BoneMap\` and \`SkeletonProfileHumanoid\` for clean animation retargeting across rigs.
3. **Materials & Shaders**: Map Blender Principled BSDF Metallic/Roughness/Emission channels to \`StandardMaterial3D\` or custom \`ShaderMaterial\`.
`
  },
  {
    id: 'gdscript-architect',
    name: 'GDScript 4 Architect Skill (Legacy Alias)',
    version: '1.2.0',
    description: 'Legacy alias for Godot 4 architectural conventions.',
    systemPrompt: `# GDScript 4 Architect Skill
Follow strict static typing, signal-based decoupling, and node composition over deep inheritance in Godot 4.
`
  },
  {
    id: 'game-feel-kinesthetics',
    name: 'Game Feel, Juice & Kinesthetics Master',
    version: '1.0.0',
    description: 'Universal kinesthetics rules for game feel: coyote time, input buffering, trauma-decay screen shake, hit stop, squash & stretch.',
    systemPrompt: `# Game Feel, Juice & Kinesthetics Skill
Apply input buffering (100-150ms FIFO), coyote time (80-120ms ledge grace), trauma-squared screen shake, freeze frame / hit stop (30-80ms), volume-preserving squash & stretch, and frame-rate independent dampening (exp(-decay * dt)).
`
  },
  {
    id: 'gamedev-math-recipes',
    name: 'Universal GameDev Math & Vector Recipes',
    version: '1.0.0',
    description: 'Essential 2D/3D game math: Quaternions vs Euler, SLERP, ballistic trajectories, dot-product vision cones, and frame-rate independent dampening.',
    systemPrompt: `# Universal GameDev Math & Vector Recipes
Specialized in 2D/3D vector mathematics: unit dot-product vision cones, surface reflection vectors, ballistic trajectory velocity formulas, quaternion SLERP interpolation without gimbal lock, and universal range remapping.
`
  },
  {
    id: 'game-ai-behavior-trees',
    name: 'Universal AI Behavior Tree Architecture',
    version: '1.0.0',
    description: 'Design decoupled AI Behavior Trees: Composite nodes (Selector, Sequence, Parallel), Decorators, Leaf tasks, and Blackboard pattern.',
    systemPrompt: `# Universal AI Behavior Tree Skill
Construct decoupled Behavior Trees with Selector (fallback), Sequence, and Parallel composites; Inverter and Cooldown decorators; Condition and Action leaf nodes; and shared Blackboard memory.
`
  },
  {
    id: 'game-ai-utility-goap',
    name: 'GOAP & Utility AI Architecture',
    version: '1.0.0',
    description: 'Goal-Oriented Action Planning (GOAP) and Utility Curves for emergent, organic non-player character decision-making.',
    systemPrompt: `# Goal-Oriented Action Planning (GOAP) & Utility AI Skill
Formulate dynamic multi-step plans using backward A* state-space search with Preconditions and Effects, and evaluate emergent motivations using polynomial and logistic utility curves combined via geometric mean.
`
  },
  {
    id: 'procgen-dungeon-architect',
    name: 'Procedural Dungeon & Level Generation Architect',
    version: '1.0.0',
    description: 'Algorithms for procedural map generation: Binary Space Partitioning (BSP), Cellular Automata, Delaunay Triangulation + MST, and Drunkard Walk.',
    systemPrompt: `# Procedural Dungeon & Level Generation Skill
Generate game maps using Binary Space Partitioning (BSP) for rectangular rooms, Cellular Automata for natural caverns, Delaunay Triangulation + Minimum Spanning Tree with loop reintroduction for dungeons, and Drunkard Walk for mining tunnels.
`
  },
  {
    id: 'procgen-wfc-solver',
    name: 'Wave Function Collapse (WFC) Solver',
    version: '1.0.0',
    description: 'Constraint-satisfaction tile and 3D block generation using Wave Function Collapse (tiled model and overlapping model).',
    systemPrompt: `# Wave Function Collapse (WFC) Solver Skill
Implement Wave Function Collapse: maintain superposition wave states, select minimum Shannon Entropy cells with noise, collapse via weighted probabilities, and propagate socket constraints along directional faces using AC-3 queues.
`
  },
  {
    id: 'game-programming-patterns',
    name: 'Game Programming Patterns & Decoupled Architecture',
    version: '1.0.0',
    description: 'Production patterns: Command Pattern (Undo/Replay/Rollback), Object Pooling, Type-Safe Event Bus, and Entity Component System (ECS) principles.',
    systemPrompt: `# Game Programming Patterns Skill
Apply production patterns: Command Pattern for serializable replay/rollback and undo/redo, high-performance Object Pooling to eliminate Garbage Collection hitches, Type-Safe Event Bus for decoupling, and Data-Oriented Design / ECS for cache locality.
`
  },
  {
    id: 'game-economy-loot-tables',
    name: 'Loot Tables, Inventory Grids & Game Economy',
    version: '1.0.0',
    description: 'Weighted random drop systems, cumulative probability tables, 2D grid inventory packing (Diablo/Resident Evil style), and XP curves.',
    systemPrompt: `# Loot Tables, Inventory Grids & Game Economy Skill
Design robust game economies: weighted random drop tables with pity counters, 2D spatial grid inventory packing with multi-cell items and rotation, and exponential RPG level progression curves.
`
  },
  {
    id: 'narrative-dialogue-fsm',
    name: 'Narrative Dialogue Trees & Quest State Machines',
    version: '1.0.0',
    description: 'Branching dialogue graph schemas, condition/flag evaluators, quest progression state machines, and internationalization (i18n) key systems.',
    systemPrompt: `# Narrative Dialogue Trees & Quest State Machines Skill
Model branching dialogue as JSON directed graphs with conditional choices, structure quest lifecycles (Locked, Available, Active, Completed, Failed) separated from static definitions, and apply i18n token substitution.
`
  },
  {
    id: 'shader-math-artistry',
    name: 'Universal Shader Math & Procedural VFX',
    version: '1.0.0',
    description: 'Engine-agnostic shader mathematics: Signed Distance Functions (SDF 2D/3D), procedural noise (Perlin/Voronoi/FBM), PBR lighting, and Bayer dithering.',
    systemPrompt: `# Universal Shader Math & Procedural VFX Skill
Author cross-engine shader math: 2D and 3D Signed Distance Functions (SDF), procedural Fractal Brownian Motion (FBM) noise, Bayer matrix ordered dithering, and Cook-Torrance GGX Physically Based Rendering (PBR) equations.
`
  }
];

/**
 * Installs or updates a skill in both .agents/skills and .claude/skills directories.
 * If source?.url is provided, downloads, verifies checksum, and extracts remotely;
 * otherwise uses bundled CURATED_SKILLS as fallback.
 */
export async function installSkill(
  projectDir: string,
  skillId: string,
  source?: CatalogSkill
): Promise<{ success: boolean; version: string; message: string }> {
  if (source?.url) {
    return installRemoteSkill(projectDir, skillId, source);
  }

  const skill = CURATED_SKILLS.find((s) => s.id === skillId);
  if (!skill) {
    return {
      success: false,
      version: '0.0.0',
      message: `Skill '${skillId}' not found. Available: ${CURATED_SKILLS.map((s) => s.id).join(', ')}`
    };
  }

  const targetVersion = source?.version || skill.version;
  const targetName = source?.name || skill.name;
  const targetDescription = source?.description || skill.description;

  const targets = [
    path.join(projectDir, '.agents', 'skills', skill.id),
    path.join(projectDir, '.claude', 'skills', skill.id)
  ];

  for (const targetPath of targets) {
    await fs.mkdir(targetPath, { recursive: true });

    // Write SKILL.md
    const skillMdContent = `---
name: ${targetName}
id: ${skill.id}
version: ${targetVersion}
description: ${targetDescription}
---

${skill.systemPrompt}
`;
    await fs.writeFile(path.join(targetPath, 'SKILL.md'), skillMdContent, 'utf8');

    // Write metadata
    const meta = {
      id: skill.id,
      name: targetName,
      version: targetVersion,
      updated_at: new Date().toISOString()
    };
    await fs.writeFile(path.join(targetPath, 'skill.json'), JSON.stringify(meta, null, 2), 'utf8');
  }

  return {
    success: true,
    version: targetVersion,
    message: `Installed ${targetName} (v${targetVersion}) into .agents/skills and .claude/skills`
  };
}

/**
 * Checks for available skill updates in a project against a remote catalog or bundled CURATED_SKILLS.
 */
export async function checkSkillUpdates(
  projectDir: string,
  catalog?: Catalog
): Promise<{ skillId: string; currentVersion: string; latestVersion: string }[]> {
  const updates: { skillId: string; currentVersion: string; latestVersion: string }[] = [];
  const baseSkillsDir = path.join(projectDir, '.agents', 'skills');
  const referenceList: { id: string; version: string }[] = catalog ? catalog.skills : CURATED_SKILLS;

  try {
    const entries = await fs.readdir(baseSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metaFile = path.join(baseSkillsDir, entry.name, 'skill.json');
        try {
          const raw = await fs.readFile(metaFile, 'utf8');
          const data = JSON.parse(raw);
          const currentVersion = data.version || '1.0.0';

          const catalogSkill = referenceList.find((s) => s.id === entry.name);
          if (catalogSkill && compareSemver(catalogSkill.version, currentVersion) > 0) {
            updates.push({
              skillId: entry.name,
              currentVersion,
              latestVersion: catalogSkill.version
            });
          }
        } catch {
          // No meta file
        }
      }
    }
  } catch {
    // No skills directory
  }

  return updates;
}
