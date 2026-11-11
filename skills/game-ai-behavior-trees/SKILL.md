---
name: Universal AI Behavior Tree Architecture
id: game-ai-behavior-trees
version: 1.0.0
description: Design decoupled AI Behavior Trees: Composite nodes (Selector, Sequence, Parallel), Decorators, Leaf tasks, and Blackboard pattern.
---

# Universal AI Behavior Tree Skill

You are an expert game AI engineer specializing in Behavior Tree (BT) architecture. You guide developers to build reactive, modular NPC AI systems decoupled from monolithic update loops.

## 1. Node Execution Status
Every node returns one of three discrete statuses on tick:
- `SUCCESS`: Task completed its objective.
- `FAILURE`: Task cannot succeed or condition was false.
- `RUNNING`: Task is ongoing (e.g. pathfinding, playing attack animation) and needs another tick next frame.

## 2. Composite Nodes (Flow Control)
- **Selector (Fallback / Priority)**: Ticks children left-to-right.
  - Returns `SUCCESS` as soon as any child returns `SUCCESS`.
  - Returns `RUNNING` if a child returns `RUNNING`.
  - Returns `FAILURE` only when all children return `FAILURE`.
  - *Usage*: Select between high-priority responses (e.g. [1. Flee If Dying, 2. Attack Target, 3. Patrol]).

- **Sequence (Step-by-step)**: Ticks children left-to-right.
  - Returns `FAILURE` as soon as any child returns `FAILURE`.
  - Returns `RUNNING` if a child returns `RUNNING`.
  - Returns `SUCCESS` only when all children succeed in order.
  - *Usage*: Multi-step actions (e.g. [1. Check Target In Range, 2. Face Target, 3. Execute Attack]).

- **Parallel**: Ticks all children concurrently until specified policy is reached (e.g. `RequireAll` or `RequireOne`).

## 3. Decorator Nodes (Wrappers)
Modify or filter the result of a single child node:
- `Inverter`: Inverts child status (`SUCCESS` -> `FAILURE`, `FAILURE` -> `SUCCESS`, `RUNNING` stays `RUNNING`).
- `Cooldown`: Fails immediately if executed before timer expires.
- `Repeater`: Repeats child execution N times or until `FAILURE`.
- `TimeLimit`: Fails child if it stays `RUNNING` longer than max duration.

## 4. Leaf Nodes (Tasks & Checks)
- **Condition**: Read-only check on the Blackboard or game state. Always returns `SUCCESS` or `FAILURE` immediately (never `RUNNING`).
- **Action**: Mutates world state, triggers animations, commands locomotion. Returns `RUNNING` while in progress.

## 5. The Blackboard Pattern
Decouple nodes from character instances via a shared key-value dictionary or struct:
- Keys: `target_entity`, `alert_level`, `last_known_position`, `health_ratio`.
- Conditions read from Blackboard; sensory systems (sight/hearing) write to Blackboard.
