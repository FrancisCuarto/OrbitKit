import fs from 'node:fs/promises';
import path from 'node:path';

export interface SkillDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  systemPrompt: string;
}

export const CURATED_SKILLS: SkillDefinition[] = [
  {
    id: 'gdscript-architect',
    name: 'GDScript 4 Architect Skill',
    version: '1.2.0',
    description: 'Guidelines and idioms for writing clean, type-safe, high-performance Godot 4 GDScript.',
    systemPrompt: `# GDScript 4 Architect Skill
You are an expert GDScript and Godot 4.x software architect.

## Core Rules for Godot 4 GDScript:
1. **Strict Static Typing**: Always specify explicit type annotations for variables, parameters, and return types.
   Example:
   \`\`\`gdscript
   @export var max_health: int = 100
   var current_health: int
   signal health_depleted
   signal health_changed(new_health: int, delta: int)

   func take_damage(amount: int) -> void:
       current_health = maxi(0, current_health - amount)
       health_changed.emit(current_health, -amount)
       if current_health == 0:
           health_depleted.emit()
   \`\`\`
2. **Node Composition Over Deep Inheritance**: Prefer component nodes (e.g. HealthComponent, HitboxComponent) over deep class trees.
3. **Use @onready and Unique Names**: Use unique name references (\`%MyNode\`) or \`@onready var sprite: Sprite2D = $Sprite2D\`.
4. **Lifecycle Execution**:
   - Use \`_physics_process(delta: float)\` exclusively for Rigidbody and CharacterBody movement.
   - Use \`_process(delta: float)\` for visual updates, cameras, and UI.
5. **Memory and Safety**: Clean up dynamic instances with \`queue_free()\`.
`
  },
  {
    id: 'godot-shader-expert',
    name: 'Godot Shading Language Expert',
    version: '1.1.0',
    description: 'Expert knowledge of 2D canvas_item and 3D spatial shaders, UV operations and post-processing in Godot 4.',
    systemPrompt: `# Godot Shader Expert Skill
You specialize in Godot Shading Language (GLSL-like dialect for Godot 4).

## Rules:
1. Always start shaders with the correct shader type declaration:
   \`\`\`gdshader
   shader_type canvas_item; // or spatial
   render_mode blend_mix;
   \`\`\`
2. Declare uniform variables with clear ranges:
   \`\`\`gdshader
   uniform float distortion : hint_range(0.0, 1.0) = 0.2;
   uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;
   \`\`\`
3. Keep arithmetic efficient; avoid branching (if/else) inside \`fragment()\` when \`mix()\`, \`step()\` or \`clamp()\` can be used.
`
  },
  {
    id: 'godot-ui-master',
    name: 'Godot 4 Responsive UI Master',
    version: '1.0.0',
    description: 'Best practices for responsive Control layouts, Anchors, Containers and custom Theme variations.',
    systemPrompt: `# Godot 4 UI Master Skill
You are an expert in Godot 4 Control node hierarchies and UI architecture.

## Guidelines:
1. Never position UI elements using manual absolute pixel coordinates.
2. Rely entirely on **Container** nodes:
   - \`VBoxContainer\` and \`HBoxContainer\` for directional stacks
   - \`MarginContainer\` for padding
   - \`GridContainer\` for grids
   - \`ScrollContainer\` for dynamic lists
3. Leverage **size_flags_horizontal** and **size_flags_vertical** (\`Control.SIZE_EXPAND_FILL\`).
4. Set theme overrides cleanly with \`add_theme_color_override\` or custom Theme resources.
`
  }
];

/**
 * Installs or updates a skill in both .agents/skills and .claude/skills directories
 */
export async function installSkill(
  projectDir: string,
  skillId: string
): Promise<{ success: boolean; version: string; message: string }> {
  const skill = CURATED_SKILLS.find((s) => s.id === skillId);
  if (!skill) {
    return {
      success: false,
      version: '0.0.0',
      message: `Skill '${skillId}' not found. Available: ${CURATED_SKILLS.map((s) => s.id).join(', ')}`
    };
  }

  const targets = [
    path.join(projectDir, '.agents', 'skills', skill.id),
    path.join(projectDir, '.claude', 'skills', skill.id)
  ];

  for (const targetPath of targets) {
    await fs.mkdir(targetPath, { recursive: true });

    // Write SKILL.md
    const skillMdContent = `---
name: ${skill.name}
id: ${skill.id}
version: ${skill.version}
description: ${skill.description}
---

${skill.systemPrompt}
`;
    await fs.writeFile(path.join(targetPath, 'SKILL.md'), skillMdContent, 'utf8');

    // Write metadata
    const meta = {
      id: skill.id,
      name: skill.name,
      version: skill.version,
      updated_at: new Date().toISOString()
    };
    await fs.writeFile(path.join(targetPath, 'skill.json'), JSON.stringify(meta, null, 2), 'utf8');
  }

  return {
    success: true,
    version: skill.version,
    message: `Installed ${skill.name} (v${skill.version}) into .agents/skills and .claude/skills`
  };
}

/**
 * Checks for available skill updates in a project
 */
export async function checkSkillUpdates(
  projectDir: string
): Promise<{ skillId: string; currentVersion: string; latestVersion: string }[]> {
  const updates: { skillId: string; currentVersion: string; latestVersion: string }[] = [];
  const baseSkillsDir = path.join(projectDir, '.agents', 'skills');

  try {
    const entries = await fs.readdir(baseSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metaFile = path.join(baseSkillsDir, entry.name, 'skill.json');
        try {
          const raw = await fs.readFile(metaFile, 'utf8');
          const data = JSON.parse(raw);
          const currentVersion = data.version || '1.0.0';

          const catalogSkill = CURATED_SKILLS.find((s) => s.id === entry.name);
          if (catalogSkill && catalogSkill.version !== currentVersion) {
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
