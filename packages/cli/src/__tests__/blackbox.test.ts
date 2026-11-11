import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  parseGodotLog,
  extractSourceSnippet,
  generateAiDebugPrompt,
  saveFlightRecord,
  loadLastFlight,
  clearTelemetry,
  FlightRecord,
  CrashIncident
} from '../core/blackbox.js';

describe('Blackbox Flight Recorder & Crash Diagnostics', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'orbitkit-blackbox-test-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  describe('parseGodotLog', () => {
    it('parses GDScript errors and extracts stack traces', () => {
      const mockLog = `
Godot Engine v4.3.stable.official.77dcf97d8 - https://godotengine.org
OpenGL API 3.3.0 - Compatibility - Using Device: Mesa Intel UHD Graphics

SCRIPT ERROR: Invalid get index 'health' (on base: 'Nil').
   at: _on_hit (res://scenes/player/player.gd:42)
   at: _process_combat (res://scenes/combat/battle.gd:105)
      `;

      const incidents = parseGodotLog(mockLog, 'HeroAdventure');
      expect(incidents.length).toBe(1);

      const inc = incidents[0];
      expect(inc.errorType).toBe('SCRIPT ERROR');
      expect(inc.errorMessage).toBe("Invalid get index 'health' (on base: 'Nil').");
      expect(inc.sourceFile).toBe('res://scenes/player/player.gd');
      expect(inc.sourceLine).toBe(42);
      expect(inc.callStack).toBeDefined();
      expect(inc.callStack?.length).toBe(2);
      expect(inc.callStack?.[0]).toEqual({
        function: '_on_hit',
        file: 'res://scenes/player/player.gd',
        line: 42
      });
      expect(inc.godotVersion).toBe('4.3.stable.official.77dcf97d8');
    });

    it('parses generic engine ERROR and CRASH outputs', () => {
      const mockLog = `
ERROR: Node not found: "AnimatedSprite2D" (relative to "/root/Level/Monster").
   at: get_node (scene/main/node.cpp:1664)

CRASH: Encountered segmentation fault (SIGSEGV)
      `;

      const incidents = parseGodotLog(mockLog);
      expect(incidents.length).toBe(2);

      expect(incidents[0].errorType).toBe('ERROR');
      expect(incidents[0].errorMessage).toContain('Node not found: "AnimatedSprite2D"');

      expect(incidents[1].errorType).toBe('CRASH');
      expect(incidents[1].errorMessage).toContain('segmentation fault');
    });
  });

  describe('extractSourceSnippet', () => {
    it('extracts surrounding code with pointer to target line', async () => {
      const scriptContent = `extends CharacterBody2D

var speed = 300.0
@onready var stats = null

func _ready():
\tpass

func _on_hit(damage: int):
\tvar current_hp = stats.health
\tstats.health -= damage
`;

      const scriptPath = path.join(tmpDir, 'player.gd');
      await fs.writeFile(scriptPath, scriptContent, 'utf8');

      const snippet = await extractSourceSnippet(tmpDir, 'res://player.gd', 10, 2);
      expect(snippet).not.toBeNull();
      expect(snippet).toContain('>>   10 | \tvar current_hp = stats.health');
      expect(snippet).toContain('   9 | func _on_hit(damage: int):');
      expect(snippet).toContain('  11 | \tstats.health -= damage');
    });

    it('returns null if file does not exist', async () => {
      const snippet = await extractSourceSnippet(tmpDir, 'res://non_existent.gd', 10);
      expect(snippet).toBeNull();
    });
  });

  describe('generateAiDebugPrompt', () => {
    it('generates a rich markdown diagnostic prompt for AI coding agents', async () => {
      // Create a script file in the temp project
      const scriptDir = path.join(tmpDir, 'scenes');
      await fs.mkdir(scriptDir, { recursive: true });
      await fs.writeFile(
        path.join(scriptDir, 'hero.gd'),
        `extends Node2D\n\nfunc take_damage():\n\tstats.apply()\n`,
        'utf8'
      );

      const incident: CrashIncident = {
        id: 'inc_test_123',
        timestamp: '2026-11-10T21:30:00Z',
        errorType: 'SCRIPT ERROR',
        errorMessage: "Invalid call. Nonexistent function 'apply' in base 'Nil'.",
        sourceFile: 'res://scenes/hero.gd',
        sourceLine: 4,
        callStack: [
          { function: 'take_damage', file: 'res://scenes/hero.gd', line: 4 }
        ],
        recentInputs: [
          { timestamp: '21:29:59', type: 'input', action: 'ui_accept' }
        ],
        sceneSnapshot: {
          rootName: 'Main',
          rootClass: 'Node2D',
          nodeCount: 3,
          nodes: [
            { name: 'Main', type: 'Node2D', path: '.', depth: 0 },
            { name: 'Hero', type: 'Node2D', path: 'Hero', script: 'res://scenes/hero.gd', depth: 1 }
          ]
        }
      };

      const prompt = await generateAiDebugPrompt(incident, { projectDir: tmpDir });

      expect(prompt).toContain('VGSkillFrame Blackbox Diagnostic');
      expect(prompt).toContain("Invalid call. Nonexistent function 'apply' in base 'Nil'.");
      expect(prompt).toContain('res://scenes/hero.gd:4');
      expect(prompt).toContain('>>    4 | \tstats.apply()');
      expect(prompt).toContain('AI Agent Triage Instructions');
      expect(prompt).toContain('Recent Input & Flight Telemetry');
      expect(prompt).toContain('Active Scene Tree Context');
    });
  });

  describe('saveFlightRecord, loadLastFlight, and clearTelemetry', () => {
    it('persists and retrieves flight records and clears telemetry folder', async () => {
      const record: FlightRecord = {
        sessionId: 'flight_test_999',
        startedAt: new Date().toISOString(),
        status: 'crashed',
        exitCode: 1,
        incidents: [
          {
            id: 'inc_1',
            timestamp: new Date().toISOString(),
            errorType: 'CRASH',
            errorMessage: 'Fatal signal 11'
          }
        ],
        recentEvents: []
      };

      await saveFlightRecord(tmpDir, record);

      const loaded = await loadLastFlight(tmpDir);
      expect(loaded).not.toBeNull();
      expect(loaded?.sessionId).toBe('flight_test_999');
      expect(loaded?.status).toBe('crashed');
      expect(loaded?.incidents.length).toBe(1);
      expect(loaded?.incidents[0].errorMessage).toBe('Fatal signal 11');

      // Check flight_log.jsonl was created
      const jsonlPath = path.join(tmpDir, '.devdock/telemetry/flight_log.jsonl');
      const jsonlRaw = await fs.readFile(jsonlPath, 'utf8');
      expect(jsonlRaw).toContain('flight_test_999');

      // Clear telemetry
      const { deleted } = await clearTelemetry(tmpDir);
      expect(deleted).toBeGreaterThanOrEqual(2);

      const afterClear = await loadLastFlight(tmpDir);
      expect(afterClear).toBeNull();
    });
  });
});
