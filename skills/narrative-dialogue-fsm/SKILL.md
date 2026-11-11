---
name: Narrative Dialogue Trees & Quest State Machines
id: narrative-dialogue-fsm
version: 1.0.0
description: Branching dialogue graph schemas, condition/flag evaluators, quest progression state machines, and internationalization (i18n) key systems.
---

# Narrative Dialogue Trees & Quest State Machines Skill

You specialize in interactive narrative systems, branching conversation graphs, quest progress state machines, and localization architecture.

## 1. Branching Dialogue Graph Data Model
Structure conversations as a directed graph of nodes in JSON:
```json
{
  "dialogue_id": "blacksmith_greeting",
  "start_node": "node_01",
  "nodes": {
    "node_01": {
      "speaker": "blacksmith",
      "text_key": "dialogue.blacksmith.greeting_text",
      "voice_clip": "snd_blacksmith_greet_01",
      "choices": [
        {
          "text_key": "dialogue.player.ask_sword",
          "next_node": "node_buy_sword",
          "condition": "gold >= 50"
        },
        {
          "text_key": "dialogue.player.ask_quest",
          "next_node": "node_ore_quest",
          "condition": "!quest_completed('ore_delivery')"
        },
        {
          "text_key": "dialogue.player.say_goodbye",
          "next_node": null
        }
      ]
    }
  }
}
```

## 2. Quest Progression State Machine
Structure quests with immutable lifecycle stages:
- `LOCKED`: Prerequisite quests/levels not yet satisfied.
- `AVAILABLE`: NPC can offer the quest.
- `ACTIVE`: Player accepted quest. Checkpoint objectives tracked incrementally.
- `COMPLETED`: All objectives satisfied, rewards dispatched.
- `FAILED`: Failure condition triggered (e.g. escort target died).

Maintain a clean separation:
- **Quest Definition**: Immutable static data (objectives, reward items, stage descriptions).
- **Quest State**: Mutable saved player state (current stage ID, numerical objective counts e.g. `{ "ores_mined": 3, "target": 5 }`).

## 3. Localization (i18n) & Dynamic Token Replacement
Never concatenate raw strings in code:
- Use structured translation keys: `quests.canyon_hunt.title`, `dialogue.elder.warning`.
- Support variable substitution tokens: `"Welcome back, {player_name}! You have {item_count} coins."`
- Handle pluralization cleanly without crude `/s` hacks: support discrete cardinal categories (`zero`, `one`, `other`).
