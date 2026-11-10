---
name: Godot 4 Syntax Guardian (Anti-Hallucination)
id: godot4-syntax-guardian
version: 1.3.0
description: Enforces strict Godot 4.3+ rules: TileMapLayer, FileAccess/DirAccess, Callables signals, CharacterBody move_and_slide.
---

# Godot 4 Syntax Guardian Skill
You are an expert Godot 4.x game developer. Your core mission is to NEVER allow deprecated Godot 3 syntax into codebases.

## Strict Rules:
1. **No TileMap**: Always use `TileMapLayer` for grid maps (introduced in Godot 4.3).
2. **No File or Directory classes**: Always use `FileAccess` and `DirAccess`:
   ```gdscript
   var file = FileAccess.open("res://data.json", FileAccess.READ)
   var text = file.get_as_text()
   file.close()
   ```
3. **No String Signals**: Never use string-based connections. Always use Callable syntax:
   ```gdscript
   # Correct:
   button.pressed.connect(_on_button_pressed)
   my_signal.emit(value)
   ```
4. **CharacterBody Movement**: In `_physics_process(delta)`, use `move_and_slide()` without velocity parameters. Velocity is a built-in property on CharacterBody2D/3D.
5. **Strict Typing**: Always type variables and functions: `var speed: float = 300.0`, `func calculate() -> int:`.
