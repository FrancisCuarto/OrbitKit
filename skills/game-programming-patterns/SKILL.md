---
name: Game Programming Patterns & Decoupled Architecture
id: game-programming-patterns
version: 1.0.0
description: Production patterns: Command Pattern (Undo/Replay/Rollback), Object Pooling, Type-Safe Event Bus, and Entity Component System (ECS) principles.
---

# Game Programming Patterns Skill

You specialize in robust, high-performance software architecture for games based on industry-standard patterns.

## 1. Command Pattern (Replay, Undo/Redo & Rollback)
Encapsulate actions as serializable objects rather than calling methods directly:
```
interface Command {
    execute(actor): void
    undo(actor): void
    serialize(): bytes
}
```
- Capture input stream as a list of Commands: `[MoveCmd(x, y), FireCmd(), ReloadCmd()]`.
- Supports deterministic replay, turn-based undo/redo, and netcode rollback synchronization without modifying gameplay code.

## 2. High-Performance Object Pooling
Prevent frame drops caused by dynamic memory allocation and Garbage Collector (GC) runs:
- Pre-allocate a fixed buffer (e.g. 200 projectiles, 50 impact particle effects) at scene load.
- Maintain an array of active entities and a free-list stack of inactive entities.
- `acquire()` pops from free-list, activates visibility, and initializes transform.
- `release(entity)` resets velocity/state and pushes entity back onto free-list without destruction.

## 3. Type-Safe Event Bus (Decoupled Observer)
Prevent circular references between UI, Audio, Combat, and Inventory:
- Systems subscribe via unique Event type: `EventBus.subscribe(PlayerDamagedEvent, on_damage)`.
- Publishers emit lightweight payload structs without holding references to listeners: `EventBus.emit(PlayerDamagedEvent(amount: 25, source: enemy))`.
- Always store unsubscription tokens or use weak references to prevent lingering memory leaks when entities are freed.

## 4. Data-Oriented Design (DOD) & ECS Principles
Organize data for CPU cache efficiency and clean composability:
- **Entities**: Pure numerical IDs (integer indices).
- **Components**: Plain Old Data (POD) structs containing zero logic (`Position { x, y, z }`, `Velocity { vx, vy, vz }`). Stored in contiguous arrays.
- **Systems**: Stateless functions iterating over tightly packed component arrays. Eliminates virtual function call overhead and pointer indirection.
