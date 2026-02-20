import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { createCommand } from '../cli/parser';

describe('CLI Parser', () => {
  it('should configure root command metadata and version', () => {
    const program = createCommand();
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8')) as {
      version: string;
    };

    expect(program.name()).toBe('create-react-forge');
    expect(program.description()).toContain('Production-ready React CLI scaffolder');
    expect(program.version()).toBe(packageJson.version);
  });

  it('should register create command with expected option choices', () => {
    const program = createCommand();
    const createCommandDefinition = program.commands.find((command) => command.name() === 'create');

    expect(createCommandDefinition).toBeDefined();
    expect(createCommandDefinition?.description()).toBe('Create a new React project');

    const runtimeOption = createCommandDefinition?.options.find((option) => option.long === '--runtime');
    const languageOption = createCommandDefinition?.options.find((option) => option.long === '--language');
    const stylingOption = createCommandDefinition?.options.find((option) => option.long === '--styling');
    const stateOption = createCommandDefinition?.options.find((option) => option.long === '--state');
    const testingOption = createCommandDefinition?.options.find((option) => option.long === '--testing');
    const unitRunnerOption = createCommandDefinition?.options.find(
      (option) => option.long === '--unit-runner'
    );
    const e2eRunnerOption = createCommandDefinition?.options.find(
      (option) => option.long === '--e2e-runner'
    );
    const packageManagerOption = createCommandDefinition?.options.find((option) => option.long === '--pm');

    expect(runtimeOption?.argChoices).toEqual(['vite', 'nextjs']);
    expect(languageOption?.argChoices).toEqual(['javascript', 'typescript']);
    expect(stylingOption?.argChoices).toEqual([
      'none',
      'tailwind',
      'styled-components',
      'css-modules',
      'css',
    ]);
    expect(stateOption?.argChoices).toEqual(['none', 'redux', 'zustand', 'jotai']);
    expect(testingOption?.argChoices).toEqual(['full', 'unit-component', 'custom', 'none']);
    expect(unitRunnerOption?.argChoices).toEqual(['vitest', 'jest']);
    expect(e2eRunnerOption?.argChoices).toEqual(['playwright', 'cypress', 'none']);
    expect(packageManagerOption?.argChoices).toEqual(['npm', 'yarn', 'pnpm']);
  });

  it('should parse create command options', async () => {
    const program = createCommand();

    await program.parseAsync(
      [
        'node',
        'create-react-forge',
        'create',
        'my-app',
        '--runtime',
        'vite',
        '--language',
        'typescript',
        '--styling',
        'css',
        '--state',
        'jotai',
        '--testing',
        'none',
        '--unit-runner',
        'vitest',
        '--e2e-runner',
        'none',
        '--pm',
        'pnpm',
        '--no-git',
        '--query',
      ],
      { from: 'user' }
    );

    const createCommandDefinition = program.commands.find((command) => command.name() === 'create');
    const parsed = createCommandDefinition?.opts();

    expect(parsed).toMatchObject({
      runtime: 'vite',
      language: 'typescript',
      styling: 'css',
      state: 'jotai',
      testing: 'none',
      unitRunner: 'vitest',
      e2eRunner: 'none',
      pm: 'pnpm',
      git: false,
      query: true,
    });
  });
});
