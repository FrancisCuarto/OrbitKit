import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import { scanForGodotProjects, inspectProject, DiscoveredProject } from '../core/scanner.js';
import { CURATED_SKILLS, installSkill } from '../core/skillsManager.js';
import { OFFICIAL_GODOT_MCP_SERVERS, installMcpServer, listConfiguredMcpServers } from '../core/mcpManager.js';
import { updateProject, updateAllProjects } from '../core/updater.js';
import { runSystemDiagnostics } from '../core/doctor.js';
import { renderGuiHtml } from './html.js';

export interface GuiServerOptions {
  port?: number;
  dir?: string;
  openBrowser?: boolean;
}

export interface GuiServerInstance {
  server: http.Server;
  port: number;
  url: string;
  close: () => Promise<void>;
}

export const CLI_COMMANDS_CATALOG = [
  {
    command: 'orbitkit ui',
    alias: 'orbitkit gui',
    usage: 'orbitkit ui [-p <port>] [-d <dir>] [--no-open]',
    description: 'Abre la interfaz gráfica interactiva (GUI Dashboard) en tu navegador web'
  },
  {
    command: 'orbitkit doctor',
    usage: 'orbitkit doctor',
    description: 'Diagnostica Godot 4, GDScript LSP (puerto 6005) y Node.js'
  },
  {
    command: 'orbitkit scan [dir]',
    usage: 'orbitkit scan [ruta-del-directorio]',
    description: 'Escanea proyectos Godot y detecta addons, skills y MCPs instalados'
  },
  {
    command: 'orbitkit init',
    usage: 'orbitkit init',
    description: 'Inicializa OrbitKit en el proyecto Godot actual con configuración base'
  },
  {
    command: 'orbitkit update',
    usage: 'orbitkit update [--all]',
    description: 'Actualiza AI skills y MCPs a las últimas versiones verificadas'
  },
  {
    command: 'orbitkit skill list',
    usage: 'orbitkit skill list',
    description: 'Lista los AI Skills curados para Godot 4 (reglas anti-alucinación, FSM, etc.)'
  },
  {
    command: 'orbitkit skill install <id>',
    usage: 'orbitkit skill install <skill-id>',
    description: 'Instala un AI skill en .agents/skills y .claude/skills'
  },
  {
    command: 'orbitkit mcp list',
    usage: 'orbitkit mcp list',
    description: 'Lista los servidores MCP oficiales para Godot 4'
  },
  {
    command: 'orbitkit mcp add <id>',
    usage: 'orbitkit mcp add <server-id>',
    description: 'Configura un servidor MCP en .mcp.json para asistentes de IA'
  },
  {
    command: 'orbitkit --help',
    usage: 'orbitkit [command] --help',
    description: 'Muestra la ayuda completa con todas las opciones disponibles'
  }
];

export function openBrowser(targetUrl: string): void {
  const platform = process.platform;
  let cmd = '';

  if (platform === 'darwin') {
    cmd = `open "${targetUrl}"`;
  } else if (platform === 'win32') {
    cmd = `start "" "${targetUrl}"`;
  } else {
    cmd = `xdg-open "${targetUrl}"`;
  }

  try {
    exec(cmd, () => {
      // Ignored silently for headless environments
    });
  } catch {
    // Ignored silently
  }
}

async function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Protect against overly large payloads
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, data: any): void {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache'
  });
  res.end(body);
}

export async function startGuiServer(options: GuiServerOptions = {}): Promise<GuiServerInstance> {
  const baseDir = path.resolve(options.dir || process.cwd());
  const preferredPort = options.port || 4567;

  const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    const reqUrl = new URL(req.url || '/', 'http://localhost');
    const pathname = reqUrl.pathname || '/';
    const queryDir = reqUrl.searchParams.get('dir');

    try {
      // 1. GET /api/status
      if (req.method === 'GET' && pathname === '/api/status') {
        const diagnostics = await runSystemDiagnostics(baseDir);
        let projects: DiscoveredProject[] = [];
        try {
          projects = await scanForGodotProjects(baseDir, { maxDepth: 6, includeGodotConfig: true });
        } catch {
          projects = [];
        }

        return sendJson(res, 200, {
          success: true,
          currentDir: baseDir,
          nodeVersion: process.version,
          diagnostics,
          projects,
          stats: {
            projectsCount: projects.length,
            skills: CURATED_SKILLS.length,
            mcps: OFFICIAL_GODOT_MCP_SERVERS.length
          }
        });
      }

      // 2. GET /api/projects
      if (req.method === 'GET' && pathname === '/api/projects') {
        const target = queryDir ? path.resolve(queryDir) : baseDir;
        const projects = await scanForGodotProjects(target, { maxDepth: 6, includeGodotConfig: true });
        return sendJson(res, 200, { success: true, projects });
      }

      // 3. POST /api/scan
      if (req.method === 'POST' && pathname === '/api/scan') {
        const body = await parseJsonBody(req);
        const target = body.dir ? path.resolve(body.dir) : baseDir;
        const projects = await scanForGodotProjects(target, { maxDepth: 6, includeGodotConfig: true });
        return sendJson(res, 200, { success: true, projects });
      }

      // 4. GET /api/skills
      if (req.method === 'GET' && pathname === '/api/skills') {
        const target = queryDir ? path.resolve(queryDir) : baseDir;
        let installedSkills: string[] = [];
        try {
          const inspected = await inspectProject(target);
          installedSkills = inspected.installedSkills;
        } catch {
          // Ignore
        }

        const skills = CURATED_SKILLS.map((s) => ({
          ...s,
          isInstalled: installedSkills.includes(s.id)
        }));

        return sendJson(res, 200, { success: true, skills });
      }

      // 5. POST /api/skills/install
      if (req.method === 'POST' && pathname === '/api/skills/install') {
        const body = await parseJsonBody(req);
        const target = body.projectDir ? path.resolve(body.projectDir) : baseDir;
        const skillId = body.skillId;

        if (!skillId) {
          return sendJson(res, 400, { success: false, message: 'Missing skillId' });
        }

        const result = await installSkill(target, skillId);
        return sendJson(res, result.success ? 200 : 400, result);
      }

      // 6. GET /api/mcps
      if (req.method === 'GET' && pathname === '/api/mcps') {
        const target = queryDir ? path.resolve(queryDir) : baseDir;
        const configured = await listConfiguredMcpServers(target);

        const mcps = OFFICIAL_GODOT_MCP_SERVERS.map((m) => ({
          ...m,
          isConfigured: configured.includes(m.id)
        }));

        return sendJson(res, 200, { success: true, mcps });
      }

      // 7. POST /api/mcps/add
      if (req.method === 'POST' && pathname === '/api/mcps/add') {
        const body = await parseJsonBody(req);
        const target = body.projectDir ? path.resolve(body.projectDir) : baseDir;
        const serverId = body.serverId;

        if (!serverId) {
          return sendJson(res, 400, { success: false, message: 'Missing serverId' });
        }

        const result = await installMcpServer(target, serverId);
        return sendJson(res, result.success ? 200 : 400, result);
      }

      // 8. POST /api/doctor
      if (req.method === 'POST' && pathname === '/api/doctor') {
        const body = await parseJsonBody(req);
        const target = body.projectDir ? path.resolve(body.projectDir) : baseDir;
        const items = await runSystemDiagnostics(target);
        return sendJson(res, 200, { success: true, items });
      }

      // 9. POST /api/init
      if (req.method === 'POST' && pathname === '/api/init') {
        const body = await parseJsonBody(req);
        const target = body.projectDir ? path.resolve(body.projectDir) : baseDir;

        // Auto-create a standard Godot 4 project.godot if not yet present
        const godotFile = path.join(target, 'project.godot');
        try {
          await fs.access(godotFile);
        } catch {
          const projectName = path.basename(target);
          const baseConfig = `; Engine configuration file.\n; Initialized by OrbitKit\nconfig_version=5\n\n[application]\n\nconfig/name="${projectName}"\nconfig/features=PackedStringArray("4.3", "Forward Plus")\n`;
          await fs.writeFile(godotFile, baseConfig, 'utf8');
        }

        // Setup directories
        await fs.mkdir(path.join(target, '.devdock'), { recursive: true });
        await fs.mkdir(path.join(target, '.agents', 'skills'), { recursive: true });
        await fs.mkdir(path.join(target, '.claude', 'skills'), { recursive: true });

        // Default skill & MCP
        await installSkill(target, 'godot4-syntax-guardian');
        await installMcpServer(target, 'godot-lsp');

        return sendJson(res, 200, {
          success: true,
          message: `OrbitKit inicializado con éxito en ${target}`
        });
      }

      // 10. POST /api/update
      if (req.method === 'POST' && pathname === '/api/update') {
        const body = await parseJsonBody(req);
        const target = body.projectDir ? path.resolve(body.projectDir) : baseDir;
        if (body.all) {
          const results = await updateAllProjects(target);
          return sendJson(res, 200, { success: true, results });
        } else {
          const result = await updateProject(target);
          return sendJson(res, 200, { success: true, summary: result });
        }
      }

      // 11. GET /api/commands
      if (req.method === 'GET' && pathname === '/api/commands') {
        return sendJson(res, 200, { success: true, commands: CLI_COMMANDS_CATALOG });
      }

      // 12. Main GUI HTML SPA
      if (pathname === '/' || pathname === '/index.html' || !pathname.startsWith('/api')) {
        const html = renderGuiHtml();
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.end(html);
        return;
      }

      // 404
      sendJson(res, 404, { success: false, message: 'Not found' });
    } catch (err: any) {
      sendJson(res, 500, { success: false, message: err.message || 'Internal server error' });
    }
  });

  // Attempt to listen with port fallback
  const startListening = (portToTry: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          // Try next port up to +20
          if (portToTry < preferredPort + 20) {
            resolve(startListening(portToTry + 1));
          } else {
            reject(err);
          }
        } else {
          reject(err);
        }
      });

      server.listen(portToTry, '127.0.0.1', () => {
        resolve(portToTry);
      });
    });
  };

  const actualPort = await startListening(preferredPort);
  const url = `http://localhost:${actualPort}`;

  if (options.openBrowser !== false) {
    openBrowser(url);
  }

  return {
    server,
    port: actualPort,
    url,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      })
  };
}
