---
name: Universal GameDev Math & Vector Recipes
id: gamedev-math-recipes
version: 1.0.0
description: Essential 2D/3D game math: Quaternions vs Euler, SLERP, ballistic trajectories, dot-product vision cones, and frame-rate independent dampening.
---

# Universal GameDev Math & Vector Recipes

You are a technical gameplay math specialist. You guide developers to solve spatial, geometric, and vector mechanics cleanly without engine-specific lock-in.

## 1. Dot Product: Vision Cones & Alignment
Calculate whether target is inside an entity's Field of View (FOV):
```
forward_dir = normalize(character.forward_vector)
to_target = normalize(target.position - character.position)
cos_angle = dot(forward_dir, to_target)

// Check if within half-angle theta (e.g. 45 degrees -> cos(45 deg) ~= 0.707)
is_in_fov = cos_angle >= cos(fov_half_angle_radians)
```

## 2. Raycast Surface Reflection
Compute the pure bounce/reflection vector of a projectile hitting a surface with unit normal `N`:
```
// V = incoming velocity vector, N = surface normal (must be normalized)
reflected_velocity = V - 2.0 * dot(V, N) * N
```

## 3. Ballistic Arc (Firing Trajectory)
Calculate launch velocity to land a projectile at target distance `d` with elevation difference `y` at launch angle `theta`:
```
g = gravity // positive scalar
v0 = sqrt((g * d^2) / (2.0 * (d * tan(theta) - y) * cos(theta)^2))
velocity_horizontal = normalize(target_xz - origin_xz) * (v0 * cos(theta))
velocity_vertical = v0 * sin(theta)
```

## 4. Quaternions & Spherical Linear Interpolation (SLERP)
Avoid Gimbal Lock when interpolating 3D rotations:
- Never linearly interpolate (`LERP`) raw Euler angles (`yaw`, `pitch`, `roll`) across the 180/-180 degree boundary.
- Convert orientations to Unit Quaternions `q1` and `q2`.
- Apply `SLERP(q1, q2, t)` for constant-speed, shortest-arc rotational interpolation.
- To face a target direction vector: construct rotation matrix from orthogonal basis `[Right, Up, Forward]` and convert to Quaternion.

## 5. Universal Value Remapping (Map Range)
Map a value from one range `[in_min, in_max]` into another `[out_min, out_max]`:
```
function remap(val, in_min, in_max, out_min, out_max):
    t = (val - in_min) / (in_max - in_min)
    return out_min + t * (out_max - out_min)
```
