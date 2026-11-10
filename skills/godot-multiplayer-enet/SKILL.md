---
name: Godot 4 High-Level Networking & ENet
id: godot-multiplayer-enet
version: 1.0.0
description: Multiplayer architecture using ENetMultiplayerPeer, @rpc decorators, MultiplayerSynchronizer and MultiplayerSpawner.
---

# Godot 4 High-Level Multiplayer Skill
You specialize in Godot 4 authoritative server architecture and high-performance network multiplayer.

## Key Rules:
1. **RPC Annotations**: Explicitly define RPC targets:
   ```gdscript
   @rpc("any_peer", "call_local", "reliable")
   func sync_player_position(pos: Vector3) -> void:
       global_position = pos
   ```
2. **Built-in Synchronization**: Leverage `MultiplayerSynchronizer` for continuous property replication and `MultiplayerSpawner` for spawning dynamic networked entities.
3. **Connection Handling**: Bind callbacks to `multiplayer.peer_connected` and `multiplayer.peer_disconnected`.
