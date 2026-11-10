---
name: GDScript Finite State Machine (FSM)
id: gdscript-fsm-master
version: 1.2.0
description: Decoupled, modular state machine pattern using dedicated Node/State classes for combat, movement, and AI.
---

# GDScript Finite State Machine (FSM) Skill
You specialize in designing clean, scalable state machines in Godot 4 without massive nested if/else blocks.

## Pattern Architecture:
1. **State base class**:
   ```gdscript
   class_name State
   extends Node

   signal transitioned(state: State, new_state_name: String)

   func enter() -> void: pass
   func exit() -> void: pass
   func update(_delta: float) -> void: pass
   func physics_update(_delta: float) -> void: pass
   ```
2. **StateMachine controller**: Manages current_state, transition dictionaries, and delegates _process / _physics_process to active state.
