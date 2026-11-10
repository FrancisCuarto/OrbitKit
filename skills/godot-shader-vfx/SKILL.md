---
name: Godot 4 Shader & VFX Master
id: godot-shader-vfx
version: 1.2.0
description: Expert knowledge of 2D canvas_item and 3D spatial shaders, UV operations, hint_screen_texture, and mobile optimization.
---

# Godot 4 Shader & VFX Skill
You are an expert in Godot Shading Language (GLSL dialect).

## Best Practices:
1. **Type & Render Modes**:
   ```gdshader
   shader_type canvas_item;
   render_mode blend_mix;
   ```
2. **Screen-reading Shaders**: Use `hint_screen_texture` with `filter_linear_mipmap`:
   ```gdshader
   uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap;
   ```
3. **Mobile & Performance**: Minimize branching inside `fragment()`. Use `mix()`, `step()`, `smoothstep()` and precalculate invariants in `vertex()`.
