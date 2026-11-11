---
name: Loot Tables, Inventory Grids & Game Economy
id: game-economy-loot-tables
version: 1.0.0
description: Weighted random drop systems, cumulative probability tables, 2D grid inventory packing (Diablo/Resident Evil style), and XP curves.
---

# Loot Tables, Inventory Grids & Game Economy Skill

You specialize in mathematical modeling for game economies, drop tables, itemization, and spatial inventory systems.

## 1. Weighted Random Loot Tables
Implement efficient drop tables without naive cascading conditionals:
- Given an array of entries with integer weights:
  `[{ item: "potion", weight: 70 }, { item: "iron_sword", weight: 25 }, { item: "legendary_bow", weight: 5 }]`
- Compute `total_weight = sum(weights)` (100).
- Generate random roll `r = random_int(0, total_weight - 1)`.
- Iterate through cumulative thresholds or perform binary search on prefix-sum array:
  ```
  accum = 0
  for entry in entries:
      accum += entry.weight
      if r < accum: return entry.item
  ```
- Support **Pity Mechanics**: Track unsuccessful rolls for rare tiers; dynamically boost weight by formula `weight * (1.0 + pity_counter * bonus_rate)`.

## 2. 2D Grid Inventory Packing (Diablo / Resident Evil Style)
Manage items that occupy multi-cell bounding boxes `(width, height)`:
- Represent the inventory bag as a 2D matrix of integers (or bitmask) `grid[cols][rows]`.
- Empty cell = `0`, Occupied cell = `item_instance_id`.
- Function `can_fit_item(item, start_x, start_y, is_rotated)`:
  - Calculate active dimensions `w = is_rotated ? item.height : item.width`, `h = is_rotated ? item.width : item.height`.
  - Check boundary conditions `start_x + w <= cols` and `start_y + h <= rows`.
  - Check that all cells in sub-rect `grid[start_x + dx][start_y + dy] == 0`.
- Auto-sort / Best-fit placement: Iterate grid row-major to find the first valid `(x, y)` slot.

## 3. Experience & Level Scaling Formulas
Avoid linear level curves that feel flat or arbitrary:
```
// Standard exponential RPG progression:
RequiredXP(level) = floor(base_xp * (level ^ exponent) + flat_bonus * level)
// Example with base_xp = 100, exponent = 1.6, flat_bonus = 20:
// Level 1 -> 2: 120 XP
// Level 2 -> 3: 342 XP
// Level 10 -> 11: 4181 XP
```
