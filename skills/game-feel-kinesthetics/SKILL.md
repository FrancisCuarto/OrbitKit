---
name: Game Feel, Juice & Kinesthetics Master
id: game-feel-kinesthetics
version: 1.0.0
description: Universal kinesthetics rules for game feel: coyote time, input buffering, trauma-decay screen shake, hit stop, squash & stretch.
---

# Game Feel, Juice & Kinesthetics Skill

You are an expert game feel and kinesthetics engineer. Your goal is to eliminate stiff, unresponsive gameplay by applying proven physics and perceptual mechanics regardless of game engine or language.

## 1. Input Buffering (FIFO Queue)
Never drop player inputs because they pressed jump 40ms before touching the floor:
- Maintain an input buffer timer (typical window: `0.10s` to `0.15s` / 100-150ms).
- When the jump/action button is pressed, set `jump_buffer_timer = 0.12`.
- When landing on floor: if `jump_buffer_timer > 0.0`, trigger jump immediately and reset timer.
- In physics step: `jump_buffer_timer = max(0.0, jump_buffer_timer - delta)`.

## 2. Coyote Time (Ledge Tolerance)
Allow players to jump for a brief moment after walking off a platform:
- Maintain a coyote timer (typical window: `0.08s` to `0.12s` / 80-120ms).
- While on floor: `coyote_timer = 0.10`.
- When leaving floor without jumping: decrement timer by delta each physics step.
- Jump condition: `can_jump = is_on_floor || coyote_timer > 0.0`. Reset `coyote_timer = 0.0` on jump.

## 3. Trauma-Based Screen Shake (Nonlinear Decay)
Never use random linear screen offset; use trauma squared for natural organic impact:
```
// Trauma value between 0.0 and 1.0
trauma = clamp(trauma - decay_rate * delta, 0.0, 1.0)
shake = trauma * trauma // Quadratic curve gives punchy peaks and smooth roll-off

offset_x = max_offset_x * shake * perlin_noise(time * frequency, 0.0)
offset_y = max_offset_y * shake * perlin_noise(0.0, time * frequency)
angle = max_roll_degrees * shake * perlin_noise(time * frequency, 1.0)
```

## 4. Hit Stop / Freeze Frame
Deliver weight to impacts by momentarily pausing or dilating simulation time:
- On heavy impact: pause entity animations or set global timescale to `0.0` (or `0.05`) for `0.04s` to `0.08s` (2 to 5 frames).
- Follow immediately with camera trauma and particle burst.

## 5. Volume-Preserving Squash & Stretch
When jumping or landing, scale sprites/meshes while preserving approximate total volume:
- Jump Takeoff: Stretch vertical, compress horizontal (e.g. `scale.y = 1.35`, `scale.x = 0.74`).
- Ground Landing: Squash vertical, expand horizontal (e.g. `scale.y = 0.65`, `scale.x = 1.40`).
- Recover to `(1.0, 1.0)` using critically damped spring or exponential decay.

## 6. Frame-Rate Independent Smoothing
Never use naive `lerp(a, b, factor)` with delta time. Use exponential decay:
```
// Correct frame-rate independent interpolation:
current = target + (current - target) * exp(-decay_speed * delta)
```
