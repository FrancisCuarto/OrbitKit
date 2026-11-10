#!/usr/bin/env node

import { createCli } from '../dist/cli.js';
import { startInteractiveTui } from '../dist/tui/interactiveTui.js';

if (process.argv.length <= 2 && process.stdout.isTTY) {
  startInteractiveTui().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  const program = createCli();
  program.parse(process.argv);
}
