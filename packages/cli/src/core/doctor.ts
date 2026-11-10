import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import net from 'node:net';
import { inspectProject } from './scanner.js';

const execAsync = promisify(exec);

export interface DiagnosticItem {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

export async function runSystemDiagnostics(
  currentDir: string
): Promise<DiagnosticItem[]> {
  const items: DiagnosticItem[] = [];

  // 1. Node.js Version
  items.push({
    name: 'Node.js Runtime',
    status: 'ok',
    message: `Running on Node.js ${process.version}`
  });

  // 2. Godot Engine Binary
  try {
    const { stdout } = await execAsync('godot --version');
    items.push({
      name: 'Godot Engine Binary',
      status: 'ok',
      message: `Detected: ${stdout.trim()}`
    });
  } catch {
    items.push({
      name: 'Godot Engine Binary',
      status: 'warning',
      message: 'godot command not found in PATH (ensure Godot 4.x is installed or symlinked to ~/.local/bin/godot).'
    });
  }

  // 3. GDScript Language Server (Port 6005)
  const isLspOpen = await testTcpPort('127.0.0.1', 6005);
  if (isLspOpen) {
    items.push({
      name: 'GDScript LSP Bridge',
      status: 'ok',
      message: 'Godot Editor Language Server reachable on 127.0.0.1:6005 (live agent telemetry active).'
    });
  } else {
    items.push({
      name: 'GDScript LSP Bridge',
      status: 'warning',
      message: 'Port 6005 not responding. Start the Godot Editor to enable live GDScript agent diagnostics.'
    });
  }

  // 4. Project context
  try {
    const proj = await inspectProject(currentDir);
    items.push({
      name: 'Project Context',
      status: 'ok',
      message: `Project: "${proj.name}" (${proj.installedAddons.length} addons, ${proj.installedSkills.length} AI skills, MCP: ${proj.hasMcpConfig ? 'configured' : 'none'}).`
    });
    items.push({
      name: 'OrbitKit Godot Plugin',
      status: proj.hasOrbitKitPlugin ? 'ok' : 'warning',
      message: proj.hasOrbitKitPlugin
        ? 'Active in addons/orbitkit and enabled in project.godot'
        : 'Not enabled in project.godot (select project in OrbitKit or run "orbitkit init" to install)'
    });
  } catch {
    items.push({
      name: 'Project Context',
      status: 'warning',
      message: 'Current directory is not a Godot project (no project.godot found).'
    });
  }

  return items;
}

function testTcpPort(host: string, port: number, timeout = 500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let hasResponded = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      hasResponded = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      if (!hasResponded) {
        hasResponded = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once('error', () => {
      if (!hasResponded) {
        hasResponded = true;
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}
