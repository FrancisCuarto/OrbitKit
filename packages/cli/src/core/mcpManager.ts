import fs from 'node:fs/promises';
import path from 'node:path';

export interface McpServerDefinition {
  id: string;
  name: string;
  description: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export const OFFICIAL_GODOT_MCP_SERVERS: McpServerDefinition[] = [
  {
    id: 'godot-lsp',
    name: 'Godot GDScript Language Server MCP',
    description: 'Bridges AI coding assistants to Godot editor LSP (localhost:6005) for live GDScript diagnostics and completions.',
    command: 'npx',
    args: ['-y', '@devdock/mcp-godot-lsp'],
    env: {
      GODOT_LSP_PORT: '6005'
    }
  },
  {
    id: 'godot-docs',
    name: 'Godot 4 API & Reference Docs MCP',
    description: 'Instant offline lookup of Godot 4 classes, nodes, signals, virtual methods, and properties.',
    command: 'npx',
    args: ['-y', '@devdock/mcp-godot-docs']
  },
  {
    id: 'godot-project-inspector',
    name: 'Godot Scene & Node Tree Inspector MCP',
    description: 'Allows AI coding agents to parse .tscn and .tres files and inspect node hierarchies safely.',
    command: 'npx',
    args: ['-y', '@devdock/mcp-godot-project']
  }
];

export interface McpConfigFile {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

/**
 * Adds or updates an MCP server in a project-level or global config file
 */
export async function installMcpServer(
  targetDir: string,
  serverId: string
): Promise<{ success: boolean; message: string }> {
  const server = OFFICIAL_GODOT_MCP_SERVERS.find((s) => s.id === serverId);
  if (!server) {
    return {
      success: false,
      message: `Unknown MCP server '${serverId}'. Available: ${OFFICIAL_GODOT_MCP_SERVERS.map((s) => s.id).join(', ')}`
    };
  }

  const configPath = path.join(targetDir, '.mcp.json');
  let config: McpConfigFile = { mcpServers: {} };

  try {
    const raw = await fs.readFile(configPath, 'utf8');
    config = JSON.parse(raw);
    if (!config.mcpServers) config.mcpServers = {};
  } catch {
    // New file
  }

  config.mcpServers[server.id] = {
    command: server.command,
    args: server.args,
    env: server.env
  };

  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

  return {
    success: true,
    message: `Configured '${server.name}' in ${configPath}`
  };
}

/**
 * Lists configured MCP servers in a directory
 */
export async function listConfiguredMcpServers(targetDir: string): Promise<string[]> {
  const configPath = path.join(targetDir, '.mcp.json');
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    const config: McpConfigFile = JSON.parse(raw);
    return Object.keys(config.mcpServers || {});
  } catch {
    return [];
  }
}
