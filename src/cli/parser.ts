import { Command, Option } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get version from package.json
function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch {
    return '1.0.0';
  }
}

export function createCommand(): Command {
  const program = new Command();

  program
    .name('create-react-forge')
    .description('Production-ready React CLI scaffolder with first-class testing support')
    .version(getVersion());

  program
    .command('create [projectName]', { isDefault: true })
    .description('Create a new React project')
    .addOption(
      new Option('--runtime <runtime>', 'Project runtime').choices(['vite', 'nextjs'])
    )
    .addOption(
      new Option('--language <language>', 'Programming language').choices(['javascript', 'typescript'])
    )
    .addOption(
      new Option('--styling <styling>', 'Styling solution').choices([
        'none',
        'tailwind',
        'styled-components',
        'css-modules',
        'css',
      ])
    )
    .addOption(
      new Option('--state <state>', 'State management').choices(['none', 'redux', 'zustand', 'jotai'])
    )
    .addOption(
      new Option('--testing <testing>', 'Testing setup').choices(['full', 'unit-component', 'none'])
    )
    .addOption(
      new Option('--unit-runner <runner>', 'Unit test runner').choices(['vitest', 'jest'])
    )
    .addOption(
      new Option('--e2e-runner <runner>', 'E2E test runner').choices(['playwright', 'cypress', 'none'])
    )
    .addOption(
      new Option('--pm <packageManager>', 'Package manager').choices(['npm', 'yarn', 'pnpm'])
    )
    .option('--no-git', 'Skip git initialization')
    .option('--query', 'Include TanStack Query')
    .option('--no-query', 'Skip TanStack Query')
    .option('--typescript', 'Use TypeScript (default)')
    .option('--javascript', 'Use JavaScript')
    .action(async () => {
      // Action handled in main CLI entry point
    });

  return program;
}
