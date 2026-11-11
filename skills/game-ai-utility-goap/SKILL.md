---
name: GOAP & Utility AI Architecture
id: game-ai-utility-goap
version: 1.0.0
description: Goal-Oriented Action Planning (GOAP) and Utility Curves for emergent, organic non-player character decision-making.
---

# Goal-Oriented Action Planning (GOAP) & Utility AI Skill

You specialize in emergent artificial intelligence systems for non-player characters using GOAP and Utility Theory.

## 1. Goal-Oriented Action Planning (GOAP)
Instead of hardcoding behavior trees or state transitions, NPCs formulate multi-step plans dynamically using A* in state-space.

### Core Structure:
1. **World State Model**: A lightweight key-value dictionary or bitmask describing relevant world conditions:
   ```json
   { "has_weapon": true, "in_cover": false, "enemy_alive": true, "has_ammo": false }
   ```
2. **Goals**: Desired world states with a priority or utility score:
   ```json
   { "id": "eliminate_threat", "desired_state": { "enemy_alive": false }, "priority": 80 }
   ```
3. **Actions**: Tasks with discrete Preconditions and Effects, plus a Cost:
   - `Reload`: Preconditions: `{ "has_ammo_reserve": true }` -> Effects: `{ "has_ammo": true }` (Cost: 2)
   - `FindAmmo`: Preconditions: `{}` -> Effects: `{ "has_ammo_reserve": true }` (Cost: 5)
   - `ShootEnemy`: Preconditions: `{ "has_weapon": true, "has_ammo": true }` -> Effects: `{ "enemy_alive": false }` (Cost: 3)

### The Planner (Backward Search A*):
- Starts at the Goal state and searches backward to the current World State.
- Expands actions whose Effects satisfy open preconditions.
- Returns the lowest total-cost sequence of executable actions: `[FindAmmo -> Reload -> ShootEnemy]`.

## 2. Utility Curves (Dill & Mark Mathematical Model)
Calculate desire scores (0.0 to 1.0) for conflicting motivations (e.g. `Hunger`, `Fear`, `Aggression`):
- **Linear**: `f(x) = m*x + b` (Predictable, proportional response).
- **Polynomial**: `f(x) = x^k` (Accelerating urgency as input approaches threshold).
- **Logistic / Sigmoid**: `f(x) = 1.0 / (1.0 + exp(-k * (x - x0)))` (Smooth S-curve for threshold transitions).

Combine multiple inputs using the Geometric Mean to ensure that if any critical need is zero, the combined utility drops accordingly:
```
combined_score = (score1 * score2 * ... * scoreN) ^ (1.0 / N)
```
