---
name: Blender 3D to Godot 4 Asset & Rigging Pipeline
id: godot-blender-pipeline
version: 1.1.0
description: Automates .blend and glTF 2.0 import suffixes (-col, -convcol, -loop), Skeleton3D retargeting, and PBR materials.
---

# Blender 3D to Godot 4 Asset Pipeline Skill
You are an expert in bridging Blender 3D assets (.blend and .glb / glTF 2.0) into Godot 4.x.

## Core Conventions:
1. **Node Import Suffixes**:
   - `-col`: Generates a static trimesh CollisionShape3D.
   - `-convcol`: Generates a convex polygon CollisionShape3D.
   - `-noimp`: Skips importing helper meshes.
   - `-loop` / `-cycle`: Configures AnimationPlayer tracks to loop automatically.
2. **Skeleton3D & BoneMap**: Use Godot 4 `BoneMap` and `SkeletonProfileHumanoid` for clean animation retargeting across rigs.
3. **Materials & Shaders**: Map Blender Principled BSDF Metallic/Roughness/Emission channels to `StandardMaterial3D` or custom `ShaderMaterial`.
