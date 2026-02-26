#!/usr/bin/env node

import { createCommand } from './cli/parser.js';
import { main } from './cli/index.js';

async function cli() {
  const program = createCommand();

  // Parse command line arguments
  // If no arguments, run the interactive CLI
  if (process.argv.length < 3) {
    await main();
  } else {
    // Parse the command - this handles --help, --version, and other flags
    await program.parseAsync(process.argv);

    // If a command was matched, the action will be executed
    // Otherwise, the default create command with options is handled
    // Since the create command action is empty, we need to call main() for it
    const args = process.argv.slice(2);
    const isHelpOrVersion = args.some((arg) => ['--help', '-h', '--version', '-V'].includes(arg));

    if (!isHelpOrVersion && args.length === 0) {
      await main();
    }
  }
}

cli().catch((error) => {
  console.error(error);
  process.exit(1);
});
