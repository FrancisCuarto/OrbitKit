---
name: Procedural Dungeon & Level Generation Architect
id: procgen-dungeon-architect
version: 1.0.0
description: Algorithms for procedural map generation: Binary Space Partitioning (BSP), Cellular Automata, Delaunay Triangulation + MST, and Drunkard Walk.
---

# Procedural Dungeon & Level Generation Skill

You specialize in procedural content generation (PCG) for game levels, dungeons, caves, and world maps.

## 1. Binary Space Partitioning (BSP) Dungeons
Best for classic rooms-and-corridors architectural dungeons:
1. Initialize bounding rectangle `[0, 0, width, height]`.
2. Recursively split space horizontally or vertically with random offset (enforcing minimum room dimension, e.g. >= 8 cells).
3. Stop recursion when tree depth is reached or sub-zones are small enough.
4. Place a randomly-sized room within each leaf boundary with 1-cell margins.
5. Traverse the BSP tree from leaves upward, connecting sibling rooms with L-shaped corridors.

## 2. Delaunay Triangulation + Minimum Spanning Tree (MST)
Best for natural, non-linear dungeon layouts with tactical loops:
1. Scatter non-overlapping room rectangles using 2D physics separation or random placement.
2. Select the top N rooms (by area or significance).
3. Compute **Delaunay Triangulation** using room centers as vertices to form a planar graph of candidate connections.
4. Run **Kruskal's** or **Prim's Algorithm** to compute the Minimum Spanning Tree (ensures 100% reachability with zero isolated islands).
5. Re-add 10% to 15% of the discarded Delaunay edges at random to reintroduce interesting circular loops and flanking routes.
6. Carve corridors along the resulting edge graph using Bresenham's line algorithm or orthogonal L-bends.

## 3. Cellular Automata (Organic Caves & Caverns)
Best for subterranean tunnels, alien hives, and natural caverns:
1. Fill a 2D grid with random noise: each cell has 45% probability of being `Wall` (1) and 55% `Floor` (0). Border cells are always `Wall`.
2. Apply the **B45/S5678** rule for 4 to 5 iterations:
   ```
   wall_count = count_surrounding_8_neighbors(x, y)
   if wall_count >= 5: cell = Wall
   else: cell = Floor
   ```
3. Run Flood-Fill to find the largest contiguous cavern; fill any disconnected micro-pockets with walls.

## 4. Drunkard's Walk / Random Walker
Best for sprawling mining shafts and ruins:
1. Start walker at center `(width/2, height/2)`.
2. At each step, carve current position as `Floor`, then pick random direction `[UP, DOWN, LEFT, RIGHT]`.
3. Repeat until target floor area percentage (e.g. 35% of total grid) is achieved.
