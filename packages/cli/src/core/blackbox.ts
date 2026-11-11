import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawn, exec } from 'node:child_process';
import { promisify } from 'node:util';
import pc from 'picocolors';

const execAsync = promisify(exec);

export interface FlightEvent {
  timestamp: string;
  type: 'input' | 'scene_change' | 'error' | 'warning' | 'custom' | 'physics';
  action?: string;
  details?: Record<string, unknown> | string;
}

export interface NodeTelemetry {
  name: string;
  type: string;
  path: string;
  script?: string;
  depth: number;
  properties?: Record<string, unknown>;
}

export interface SceneSnapshot {
  rootName: string;
  rootClass: string;
  sceneFilePath?: string;
  nodeCount: number;
  nodes: NodeTelemetry[];
  orphanNodesCount?: number;
  activeCamera?: {
    name: string;
    type: string;
    position?: { x: number; y: number; z?: number };
    zoomOrFov?: number;
  };
}

export interface CallStackFrame {
  function: string;
  file: string;
  line: number;
}

export interface CrashIncident {
  id: string;
  timestamp: string;
  godotVersion?: string;
  projectName?: string;
  errorType: string;
  errorMessage: string;
  sourceFile?: string;
  sourceLine?: number;
  callStack?: CallStackFrame[];
  recentInputs?: FlightEvent[];
  sceneSnapshot?: SceneSnapshot;
  engineStats?: {
    fps?: number;
    processTimeMs?: number;
    physicsTimeMs?: number;
    memoryStaticMb?: number;
    orphanNodes?: number;
  };
  rawLogExcerpt?: string;
}

export interface FlightRecord {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  status: 'ok' | 'crashed' | 'terminated' | 'interrupted';
  exitCode?: number | null;
  projectName?: string;
  godotVersion?: string;
  incidents: CrashIncident[];
  lastSnapshot?: SceneSnapshot;
  recentEvents: FlightEvent[];
}

export interface RecordOptions {
  godotPath?: string;
  args?: string[];
  captureInputs?: boolean;
  timeoutMs?: number;
  onLogLine?: (line: string, isError: boolean) => void;
}

export const TELEMETRY_DIR = '.devdock/telemetry';
export const LAST_FLIGHT_FILE = 'last_flight.json';
export const FLIGHT_LOG_FILE = 'flight_log.jsonl';

/**
 * Resolves the path to the telemetry directory inside a project
 */
export function getTelemetryDir(projectDir: string): string {
  return path.join(path.resolve(projectDir), TELEMETRY_DIR);
}

/**
 * Resolves the path to the last_flight.json file
 */
export function getLastFlightPath(projectDir: string): string {
  return path.join(getTelemetryDir(projectDir), LAST_FLIGHT_FILE);
}

/**
 * Detects the Godot binary available in the system
 */
export async function detectGodotBinary(customPath?: string): Promise<string | null> {
  if (customPath && existsSync(customPath)) {
    return customPath;
  }

  const candidates = [
    'godot',
    'godot4',
    '/home/francis/.local/bin/godot',
    '/usr/local/bin/godot',
    '/usr/bin/godot',
    '/Applications/Godot.app/Contents/MacOS/Godot'
  ];

  for (const candidate of candidates) {
    try {
      const { stdout } = await execAsync(`${candidate} --version`);
      if (stdout.trim().length > 0) {
        return candidate;
      }
    } catch {
      // Continue searching
    }
  }

  return null;
}

/**
 * Parses Godot log output into structured CrashIncidents
 */
export function parseGodotLog(logText: string, projectName?: string): CrashIncident[] {
  const lines = logText.split(/\r?\n/);
  const incidents: CrashIncident[] = [];
  let currentIncident: Partial<CrashIncident> | null = null;
  let rawBuffer: string[] = [];

  // Patterns
  const scriptErrorRegex = /SCRIPT ERROR:\s*(.*)/i;
  const genericErrorRegex = /ERROR:\s*(.*)/i;
  const crashRegex = /CRASH:\s*(.*)/i;
  const stackAtRegex = /^\s*at:\s*([^(]+)\s*\((res:\/\/[^:]+):(\d+)\)/;
  const coreStackRegex = /^\s*at:\s*([^(]+)\s*\(([^:]+):(\d+)\)/;
  const godotVerRegex = /Godot Engine v([^\s]+)/;

  let godotVersion: string | undefined;
  const verMatch = logText.match(godotVerRegex);
  if (verMatch) {
    godotVersion = verMatch[1];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const scriptMatch = line.match(scriptErrorRegex);
    const genericMatch = line.match(genericErrorRegex);
    const crashMatch = line.match(crashRegex);

    if (scriptMatch || crashMatch || genericMatch) {
      if (currentIncident && currentIncident.errorMessage) {
        currentIncident.rawLogExcerpt = rawBuffer.join('\n');
        incidents.push(currentIncident as CrashIncident);
        rawBuffer = [];
      }

      const isScript = Boolean(scriptMatch);
      const isCrash = Boolean(crashMatch);
      const errorMsg = scriptMatch?.[1] || crashMatch?.[1] || genericMatch?.[1] || 'Unknown error';

      currentIncident = {
        id: `inc_${Date.now()}_${incidents.length + 1}`,
        timestamp: new Date().toISOString(),
        godotVersion,
        projectName,
        errorType: isCrash ? 'CRASH' : isScript ? 'SCRIPT ERROR' : 'ERROR',
        errorMessage: errorMsg.trim(),
        callStack: []
      };
      rawBuffer.push(line);
      continue;
    }

    if (currentIncident) {
      rawBuffer.push(line);
      const stackMatch = line.match(stackAtRegex);
      if (stackMatch) {
        const fnName = stackMatch[1].trim();
        const file = stackMatch[2].trim();
        const lineNum = parseInt(stackMatch[3], 10);

        if (!currentIncident.sourceFile) {
          currentIncident.sourceFile = file;
          currentIncident.sourceLine = lineNum;
        }

        currentIncident.callStack = currentIncident.callStack || [];
        currentIncident.callStack.push({
          function: fnName,
          file,
          line: lineNum
        });
      } else {
        const coreMatch = line.match(coreStackRegex);
        if (coreMatch) {
          const fnName = coreMatch[1].trim();
          const file = coreMatch[2].trim();
          const lineNum = parseInt(coreMatch[3], 10);
          currentIncident.callStack = currentIncident.callStack || [];
          currentIncident.callStack.push({
            function: fnName,
            file,
            line: lineNum
          });
        }
      }
    }
  }

  if (currentIncident && currentIncident.errorMessage) {
    currentIncident.rawLogExcerpt = rawBuffer.join('\n');
    incidents.push(currentIncident as CrashIncident);
  }

  return incidents;
}

/**
 * Reads existing editor_state.json from .devdock to get the current scene snapshot
 */
export async function getEditorSceneSnapshot(projectDir: string): Promise<SceneSnapshot | null> {
  const statePath = path.join(path.resolve(projectDir), '.devdock', 'editor_state.json');
  try {
    const raw = await fs.readFile(statePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.active_scene) {
      const s = parsed.active_scene;
      return {
        rootName: s.root_name || 'Root',
        rootClass: s.root_class || 'Node',
        sceneFilePath: s.scene_file_path || '',
        nodeCount: s.node_count || (s.nodes ? s.nodes.length : 0),
        nodes: (s.nodes || []).map((n: any) => ({
          name: n.name,
          type: n.type,
          path: n.path,
          script: n.script,
          depth: n.depth || 0
        }))
      };
    }
  } catch {
    // File not found or unparseable
  }
  return null;
}

/**
 * Saves a flight record into .devdock/telemetry/last_flight.json
 */
export async function saveFlightRecord(projectDir: string, record: FlightRecord): Promise<string> {
  const dir = getTelemetryDir(projectDir);
  await fs.mkdir(dir, { recursive: true });

  const targetFile = getLastFlightPath(projectDir);
  await fs.writeFile(targetFile, JSON.stringify(record, null, 2), 'utf8');

  // Also append to jsonl history log
  const logFile = path.join(dir, FLIGHT_LOG_FILE);
  const jsonlLine = JSON.stringify({
    sessionId: record.sessionId,
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    status: record.status,
    incidentCount: record.incidents.length,
    incidents: record.incidents.map((i) => ({
      errorType: i.errorType,
      errorMessage: i.errorMessage,
      sourceFile: i.sourceFile,
      sourceLine: i.sourceLine
    }))
  }) + '\n';

  await fs.appendFile(logFile, jsonlLine, 'utf8').catch(() => {});

  return targetFile;
}

/**
 * Reads the last flight record from .devdock/telemetry/last_flight.json
 */
export async function loadLastFlight(projectDir: string): Promise<FlightRecord | null> {
  const targetFile = getLastFlightPath(projectDir);
  try {
    const raw = await fs.readFile(targetFile, 'utf8');
    return JSON.parse(raw) as FlightRecord;
  } catch {
    return null;
  }
}

/**
 * Clears telemetry recordings and crash logs from .devdock/telemetry
 */
export async function clearTelemetry(projectDir: string): Promise<{ deleted: number }> {
  const dir = getTelemetryDir(projectDir);
  let deleted = 0;
  try {
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      await fs.rm(path.join(dir, entry), { recursive: true, force: true });
      deleted++;
    }
  } catch {
    // Directory might not exist
  }
  return { deleted };
}

/**
 * Starts a live Godot execution session while recording logs and telemetry
 */
export async function runFlightRecording(
  projectDir: string,
  options: RecordOptions = {}
): Promise<FlightRecord> {
  const resolvedDir = path.resolve(projectDir);
  const godotBin = await detectGodotBinary(options.godotPath);

  if (!godotBin) {
    throw new Error(
      'Godot binary not found. Please install Godot or pass the path via --godot <path>'
    );
  }

  const sessionId = `flight_${Date.now()}`;
  const startedAt = new Date().toISOString();
  const args = options.args && options.args.length > 0
    ? options.args
    : ['--path', resolvedDir, '--debug', '--verbose'];

  // Retrieve current scene snapshot before running if available
  const initialSnapshot = await getEditorSceneSnapshot(resolvedDir);

  const logs: string[] = [];
  const recentEvents: FlightEvent[] = [];

  const record: FlightRecord = {
    sessionId,
    startedAt,
    status: 'ok',
    incidents: [],
    lastSnapshot: initialSnapshot || undefined,
    recentEvents
  };

  return new Promise<FlightRecord>((resolve, reject) => {
    const child = spawn(godotBin, args, {
      cwd: resolvedDir,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let timeoutTimer: NodeJS.Timeout | null = null;
    if (options.timeoutMs && options.timeoutMs > 0) {
      timeoutTimer = setTimeout(() => {
        child.kill('SIGTERM');
      }, options.timeoutMs);
    }

    const handleOutput = (data: Buffer, isError: boolean) => {
      const text = data.toString('utf8');
      logs.push(text);
      if (options.onLogLine) {
        options.onLogLine(text, isError);
      }
    };

    child.stdout?.on('data', (d) => handleOutput(d, false));
    child.stderr?.on('data', (d) => handleOutput(d, true));

    child.on('error', (err) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      record.status = 'crashed';
      record.endedAt = new Date().toISOString();
      reject(err);
    });

    child.on('close', async (code) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      record.endedAt = new Date().toISOString();
      record.exitCode = code;

      const fullLog = logs.join('');
      const parsedIncidents = parseGodotLog(fullLog);
      record.incidents = parsedIncidents;

      if (code !== 0 || parsedIncidents.length > 0) {
        record.status = 'crashed';
      } else {
        record.status = 'ok';
      }

      try {
        await saveFlightRecord(resolvedDir, record);
      } catch {
        // Ignore write error on shutdown
      }

      resolve(record);
    });
  });
}

/**
 * Extracts a source code snippet around the offending line from a local GDScript file
 */
export async function extractSourceSnippet(
  projectDir: string,
  resFilePath: string,
  targetLine: number,
  contextRadius = 4
): Promise<string | null> {
  try {
    const relativePart = resFilePath.replace(/^res:\/\//, '');
    const fullPath = path.resolve(projectDir, relativePart);

    if (!existsSync(fullPath)) return null;

    const content = await fs.readFile(fullPath, 'utf8');
    const lines = content.split(/\r?\n/);

    const startIdx = Math.max(0, targetLine - 1 - contextRadius);
    const endIdx = Math.min(lines.length - 1, targetLine - 1 + contextRadius);

    const snippetLines: string[] = [];
    for (let i = startIdx; i <= endIdx; i++) {
      const lineNum = i + 1;
      const isTarget = lineNum === targetLine;
      const marker = isTarget ? '>>' : '  ';
      const numStr = String(lineNum).padStart(4, ' ');
      snippetLines.push(`${marker} ${numStr} | ${lines[i]}`);
    }

    return snippetLines.join('\n');
  } catch {
    return null;
  }
}

/**
 * Generates an AI-ready Markdown Prompt specifically structured for LLM coding agents
 * (Claude Code, Cursor, Antigravity, Windsurf) to quickly diagnose and fix the issue.
 */
export async function generateAiDebugPrompt(
  incident: CrashIncident,
  options: { projectDir?: string; copyToClipboard?: boolean } = {}
): Promise<string> {
  const projectDir = options.projectDir || process.cwd();
  let snippet: string | null = null;

  if (incident.sourceFile && incident.sourceLine) {
    snippet = await extractSourceSnippet(
      projectDir,
      incident.sourceFile,
      incident.sourceLine
    );
  }

  const sections: string[] = [];

  // Title
  sections.push(
    `# 🚨 OrbitKit Blackbox Diagnostic: Godot Runtime Crash Report\n`
  );

  // High-level incident details
  sections.push(`### 📋 Incident Overview
- **Incident ID**: \`${incident.id}\`
- **Timestamp**: \`${incident.timestamp}\`
- **Error Type**: \`${incident.errorType}\`
- **Message**: **${incident.errorMessage}**
${incident.sourceFile ? `- **Fault Location**: \`${incident.sourceFile}:${incident.sourceLine || 1}\`` : ''}
${incident.godotVersion ? `- **Godot Version**: \`${incident.godotVersion}\`` : ''}
${incident.projectName ? `- **Project Name**: \`${incident.projectName}\`` : ''}
`);

  // Source code snippet if available
  if (snippet && incident.sourceFile) {
    sections.push(`### 📜 Offending Script Snippet
\`\`\`gdscript
# File: ${incident.sourceFile}
${snippet}
\`\`\`
*(Lines marked with \`>>\` indicate the exact crash line)*
`);
  }

  // Call stack
  if (incident.callStack && incident.callStack.length > 0) {
    const stackItems = incident.callStack
      .map((f) => `- \`${f.file}:${f.line}\` in function \`${f.function}()\``)
      .join('\n');

    sections.push(`### 📍 Call Stack Trace
${stackItems}
`);
  }

  // Recent input / game events
  if (incident.recentInputs && incident.recentInputs.length > 0) {
    const eventItems = incident.recentInputs
      .slice(-10)
      .map((e) => `- [${e.timestamp}] **${e.type.toUpperCase()}**: ${e.action || ''} ${JSON.stringify(e.details || '')}`)
      .join('\n');

    sections.push(`### 🎮 Recent Input & Flight Telemetry
${eventItems}
`);
  }

  // Active scene snapshot
  if (incident.sceneSnapshot) {
    const snap = incident.sceneSnapshot;
    const nodeTree = snap.nodes
      .slice(0, 30)
      .map((n) => {
        const indent = '  '.repeat(n.depth);
        const scriptBadge = n.script ? ` [📜 ${path.basename(n.script)}]` : '';
        return `${indent}- **${n.name}** (\`${n.type}\`)${scriptBadge}`;
      })
      .join('\n');

    sections.push(`### 🌳 Active Scene Tree Context
- **Root Scene**: \`${snap.sceneFilePath || snap.rootName}\`
- **Total Nodes**: ${snap.nodeCount}
- **Hierarchy Excerpt**:
${nodeTree}
${snap.nodes.length > 30 ? `\n*(+ ${snap.nodes.length - 30} more nodes truncated for brevity)*` : ''}
`);
  }

  // Engine Performance Stats
  if (incident.engineStats) {
    const stats = incident.engineStats;
    sections.push(`### 📊 Engine Telemetry at Crash
- **FPS**: ${stats.fps ?? 'N/A'}
- **Memory Static**: ${stats.memoryStaticMb ? `${stats.memoryStaticMb.toFixed(2)} MB` : 'N/A'}
- **Orphan Nodes**: ${stats.orphanNodes ?? 0}
`);
  }

  // Instructions for the AI Coding Agent
  sections.push(`---
### 🤖 AI Agent Triage Instructions
1. **Analyze the root cause**: Inspect why \`${incident.errorMessage}\` occurred at \`${incident.sourceFile || 'unknown file'}\`.
2. **Examine nullability / state**: If the error involves \`Nil\`, check if a child node reference, signal connection, or resource failed to initialize.
3. **Validate Scene Tree**: Check if the node path in the script matches the actual Scene Tree Hierarchy shown above.
4. **Propose the exact fix**: Provide the corrected GDScript code with defensive validation (e.g. \`is_instance_valid()\`, \`has_node()\`, or proper initialization) and explain why it resolves the crash.
`);

  const fullPrompt = sections.join('\n');

  if (options.copyToClipboard) {
    await copyToClipboard(fullPrompt);
  }

  return fullPrompt;
}

/**
 * Copies a string to the system clipboard using native OS commands without external npm dependencies
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      const child = spawn('pbcopy');
      child.stdin?.write(text);
      child.stdin?.end();
      return true;
    } else if (platform === 'win32') {
      const child = spawn('clip.exe');
      child.stdin?.write(text);
      child.stdin?.end();
      return true;
    } else {
      // Linux: Try wl-copy first (Wayland), then xclip, then xsel
      try {
        const child = spawn('wl-copy');
        child.stdin?.write(text);
        child.stdin?.end();
        return true;
      } catch {
        try {
          const child = spawn('xclip', ['-selection', 'clipboard']);
          child.stdin?.write(text);
          child.stdin?.end();
          return true;
        } catch {
          const child = spawn('xsel', ['--clipboard', '--input']);
          child.stdin?.write(text);
          child.stdin?.end();
          return true;
        }
      }
    }
  } catch {
    return false;
  }
}
