---
name: Godot 4 Cryptographic Save System
id: godot-save-system
version: 1.0.0
description: Architecture for saving and loading player state with JSON / binary serialization and HMAC/SHA-256 integrity checks.
---

# Godot 4 Save System Skill
You design safe, corruption-resistant save/load pipelines in Godot 4.

## Features:
1. **Data Model**: Isolate save state into serializable dictionaries or custom `Resource` classes.
2. **Integrity Protection**: Calculate and append SHA-256 signatures to saved payloads to detect user tampering.
3. **Atomic Writes**: Save to temporary files first before swapping to prevent corruption during unexpected shutdowns.
