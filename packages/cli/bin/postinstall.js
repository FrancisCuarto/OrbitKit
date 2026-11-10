#!/usr/bin/env node

/**
 * OrbitKit (DevDock) Postinstall Hook
 * Displays available CLI commands and quickstart instructions upon installation.
 */

try {
  const supportsColor =
    process.stdout.isTTY &&
    !process.env.NO_COLOR &&
    (process.env.TERM !== 'dumb' || process.env.CI !== undefined);

  const c = {
    bold: (s) => (supportsColor ? `\x1b[1m${s}\x1b[22m` : s),
    cyan: (s) => (supportsColor ? `\x1b[36m${s}\x1b[39m` : s),
    green: (s) => (supportsColor ? `\x1b[32m${s}\x1b[39m` : s),
    yellow: (s) => (supportsColor ? `\x1b[33m${s}\x1b[39m` : s),
    magenta: (s) => (supportsColor ? `\x1b[35m${s}\x1b[39m` : s),
    blue: (s) => (supportsColor ? `\x1b[34m${s}\x1b[39m` : s),
    gray: (s) => (supportsColor ? `\x1b[90m${s}\x1b[39m` : s)
  };

  const line = '━'.repeat(68);

  console.log('\n' + c.cyan(line));
  console.log(`  ${c.bold(c.cyan('🚀 ¡OrbitKit (DevDock) instalado con éxito!'))}`);
  console.log(`  ${c.gray('Ecosistema de AI Skills, Servidores MCP y Addons para Godot 4')}`);
  console.log(c.cyan(line));

  console.log(`\n${c.bold('📋 Comandos que podés usar:')}\n`);

  const commands = [
    {
      cmd: 'orbitkit ui',
      alias: '(o orbitkit gui)',
      desc: 'Abre la interfaz gráfica interactiva en tu navegador web'
    },
    {
      cmd: 'orbitkit doctor',
      alias: '',
      desc: 'Diagnostica Godot 4, GDScript LSP (puerto 6005) y Node.js'
    },
    {
      cmd: 'orbitkit scan [dir]',
      alias: '',
      desc: 'Escanea proyectos Godot y detecta addons, skills y MCPs'
    },
    {
      cmd: 'orbitkit init',
      alias: '',
      desc: 'Inicializa OrbitKit en el proyecto Godot actual'
    },
    {
      cmd: 'orbitkit update [--all]',
      alias: '',
      desc: 'Actualiza AI skills y MCPs a las últimas versiones'
    },
    {
      cmd: 'orbitkit skill list',
      alias: '',
      desc: 'Lista todos los AI Skills curados para Godot 4'
    },
    {
      cmd: 'orbitkit skill install <id>',
      alias: '',
      desc: 'Instala un AI skill en .agents/skills y .claude/skills'
    },
    {
      cmd: 'orbitkit mcp list',
      alias: '',
      desc: 'Lista los servidores MCP oficiales para Godot 4'
    },
    {
      cmd: 'orbitkit mcp add <id>',
      alias: '',
      desc: 'Configura un servidor MCP en .mcp.json para asistentes de IA'
    },
    {
      cmd: 'orbitkit --help',
      alias: '',
      desc: 'Muestra la ayuda completa con todas las opciones disponibles'
    }
  ];

  for (const item of commands) {
    const cmdStr = item.alias
      ? `${c.bold(c.green(item.cmd))} ${c.gray(item.alias)}`
      : c.bold(c.green(item.cmd));
    const padLen = item.alias ? 38 : 28;
    console.log(`  ${cmdStr.padEnd(padLen)} ${c.gray('→')} ${item.desc}`);
  }

  console.log('\n' + c.bold(c.yellow('⚡ Primeros pasos recomendados:')));
  console.log(`  1. Iniciar la Interfaz Gráfica:  ${c.bold(c.cyan('orbitkit ui'))}`);
  console.log(`  2. Diagnosticar tu entorno:      ${c.bold(c.cyan('orbitkit doctor'))}`);
  console.log(`  3. Explorar proyectos Godot:     ${c.bold(c.cyan('orbitkit scan .'))}`);

  console.log(`\n  ${c.gray('Nota: También podés usar el alias')} ${c.bold(c.magenta('devdock'))} ${c.gray('en lugar de')} ${c.bold(c.magenta('orbitkit'))}.\n`);
} catch {
  // Exit cleanly without halting installation if stdout fails
}
