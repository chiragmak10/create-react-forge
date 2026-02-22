import { describe, expect, it } from 'vitest';
import { createCommand } from '../cli/parser';

describe('CLI parser', () => {
  it('should create command with expected metadata', () => {
    const program = createCommand();

    expect(program.name()).toBe('create-react-forge');
    expect(program.description()).toContain('Production-ready React CLI scaffolder');
    expect(program.version()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should register create command options with supported choices', () => {
    const program = createCommand();
    const createCmd = program.commands.find((cmd) => cmd.name() === 'create');

    expect(createCmd).toBeDefined();
    expect(createCmd?.description()).toBe('Create a new React project');

    const stylingOption = createCmd?.options.find((o) => o.long === '--styling');
    const stateOption = createCmd?.options.find((o) => o.long === '--state');
    const runtimeOption = createCmd?.options.find((o) => o.long === '--runtime');
    const languageOption = createCmd?.options.find((o) => o.long === '--language');
    const unitRunnerOption = createCmd?.options.find((o) => o.long === '--unit-runner');

    expect(runtimeOption?.argChoices).toEqual(['vite', 'nextjs']);
    expect(stylingOption?.argChoices).toEqual([
      'none',
      'tailwind',
      'styled-components',
      'css-modules',
      'css',
    ]);
    expect(stateOption?.argChoices).toEqual(['none', 'redux', 'zustand', 'jotai']);
    expect(languageOption?.argChoices).toEqual(['javascript', 'typescript']);
    expect(unitRunnerOption?.argChoices).toEqual(['vitest', 'jest']);
  });

  it('should parse create command options', async () => {
    const program = createCommand();

    await program.parseAsync(
      [
        'node',
        'create-react-forge',
        'create',
        'demo-app',
        '--runtime',
        'nextjs',
        '--language',
        'javascript',
        '--styling',
        'tailwind',
        '--state',
        'redux',
        '--testing',
        'unit-component',
        '--unit-runner',
        'jest',
        '--e2e-runner',
        'none',
        '--pm',
        'pnpm',
        '--no-git',
        '--no-query',
      ],
      { from: 'user' }
    );

    const createCmd = program.commands.find((cmd) => cmd.name() === 'create');
    const parsed = createCmd?.opts();

    expect(parsed).toMatchObject({
      runtime: 'nextjs',
      language: 'javascript',
      styling: 'tailwind',
      state: 'redux',
      testing: 'unit-component',
      unitRunner: 'jest',
      e2eRunner: 'none',
      pm: 'pnpm',
      git: false,
      query: false,
    });
  });
});
