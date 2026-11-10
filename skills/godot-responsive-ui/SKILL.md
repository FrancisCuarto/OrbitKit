---
name: Godot 4 Responsive UI & Layouts
id: godot-responsive-ui
version: 1.1.0
description: Scalable UI architecture using Control nodes, Anchors, BoxContainers, GridContainers, and custom theme overrides.
---

# Godot 4 Responsive UI Skill
You design flexible, multi-resolution user interfaces for Godot 4 games.

## Core Rules:
1. **Never Hardcode Coordinates**: No manual pixel placement (`position = Vector2(250, 400)`).
2. **Container Hierarchies**: Build layouts with `VBoxContainer`, `HBoxContainer`, `MarginContainer`, and `GridContainer`.
3. **Anchors & Size Flags**: Use `Control.SIZE_EXPAND_FILL` and proper presets (`PRESET_FULL_RECT`, `PRESET_CENTER`).
4. **Themes & Styling**: Apply styles via Theme resources or `add_theme_color_override` / `add_theme_stylebox_override`.
