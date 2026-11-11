---
name: Wave Function Collapse (WFC) Solver
id: procgen-wfc-solver
version: 1.0.0
description: Constraint-satisfaction tile and 3D block generation using Wave Function Collapse (tiled model and overlapping model).
---

# Wave Function Collapse (WFC) Solver Skill

You specialize in procedural generation using the Wave Function Collapse (WFC) algorithm, generating seamlessly connected 2D tilemaps and 3D modular structures.

## 1. Core Principles & Wave State
- The map begins in a **Superposition**: every grid cell holds an array of all possible tile prototypes (e.g. `[Grass, Road_H, Road_V, Road_Cross, Water]`).
- Each prototype defines socket compatibility constraints along its directional faces:
  - 2D: `[North, East, South, West]`
  - 3D: `[Up, Down, North, East, South, West]`
  - Sockets match when `TileA.East == TileB.West` (accounting for symmetric/asymmetric socket keys).

## 2. Shannon Entropy Selection
Always collapse the cell with the lowest non-zero entropy (the most constrained cell):
```
Entropy(cell) = sum(weight * log(weight)) - (sum(weight) * log(sum(weight)))
// Add tiny random noise to break ties randomly:
EntropyWithNoise(cell) = Entropy(cell) - random_float(0.0, 0.0001)
```

## 3. The Collapse Step
Pick a single prototype for the selected cell using weighted random selection based on user-defined frequency weights (e.g. `Grass: 50, Road: 10, Water: 5`). Set cell's wave array to contain only that single chosen prototype.

## 4. Constraint Propagation (AC-3 Queue)
1. Push the collapsed cell coordinates to a FIFO stack/queue.
2. While queue is not empty, pop `current_cell`.
3. For each cardinal neighbor `neighbor_cell` of `current_cell`:
   - Inspect all remaining prototypes in `neighbor_cell`.
   - Remove any prototype that has NO compatible socket matching ANY remaining prototype in `current_cell`.
   - If one or more prototypes were eliminated from `neighbor_cell`:
     - If remaining prototypes == 0: **Contradiction Detected**. Trigger backtrack or restart with fresh seed.
     - Else: push `neighbor_cell` to propagation queue to cascade constraints outward.
4. Repeat from Step 2 until all cells contain exactly 1 prototype.
