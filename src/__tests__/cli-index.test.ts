import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PromptAnswers } from '../cli/prompts';

const { promptForProjectDetailsMock, generateProjectMock } = vi.hoisted(() => ({
  promptForProjectDetailsMock: vi.fn(),
  generateProjectMock: vi.fn(),
}));

vi.mock('../cli/prompts', () => ({
  promptForProjectDetails: promptForProjectDetailsMock,
}));

vi.mock('../generator/index', () => ({
  generateProject: generateProjectMock,
}));

import { main, promptAnswersToConfig, validateProjectName } from '../cli/index';

function createAnswers(overrides: Partial<PromptAnswers> = {}): PromptAnswers {
  return {
    projectName: 'test-app',
    projectPath: './test-app',
    runtime: 'vite',
    language: 'typescript',
    styling: 'styled-components',
    stateManagement: 'none',
    testing: 'none',
    unitRunner: 'vitest',
    e2eRunner: 'none',
    dataFetching: true,
    packageManager: 'npm',
    git: true,
    prettier: true,
    ...overrides,
  };
}

describe('CLI Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should convert prompt answers into project config', () => {
    const config = promptAnswersToConfig(
      createAnswers({
        testing: 'full',
        runtime: 'nextjs',
        language: 'javascript',
        stateManagement: 'jotai',
        packageManager: 'pnpm',
        git: false,
        dataFetching: false,
        e2eRunner: 'cypress',
      })
    );

    expect(config.name).toBe('test-app');
    expect(config.path).toContain('/test-app');
    expect(config.runtime).toBe('nextjs');
    expect(config.language).toBe('javascript');
    expect(config.styling.solution).toBe('styled-components');
    expect(config.stateManagement).toBe('jotai');
    expect(config.packageManager).toBe('pnpm');
    expect(config.git.init).toBe(false);
    expect(config.dataFetching.enabled).toBe(false);
    expect(config.testing.enabled).toBe(true);
    expect(config.testing.unit.runner).toBe('vitest');
    expect(config.testing.e2e.runner).toBe('cypress');
  });

  it('should validate project name', () => {
    expect(validateProjectName('')).toEqual({
      valid: false,
      error: 'Project name is required',
    });
    expect(validateProjectName('Invalid Name')).toEqual({
      valid: false,
      error: 'Project name must be lowercase alphanumeric with hyphens',
    });
    expect(validateProjectName('valid-name-123')).toEqual({ valid: true });
  });

  it('should run successful main flow and print warnings', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    promptForProjectDetailsMock.mockResolvedValue(createAnswers());
    generateProjectMock.mockResolvedValue({
      success: true,
      projectPath: '/tmp/test-app',
      filesWritten: 10,
      errors: [],
      warnings: ['warn-one'],
    });

    await main();

    expect(promptForProjectDetailsMock).toHaveBeenCalledTimes(1);
    expect(generateProjectMock).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️  Warnings:'));
    expect(errorSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should exit with code 1 when generation fails', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code?: number) => {
        throw new Error(`exit ${code}`);
      }) as never);

    promptForProjectDetailsMock.mockResolvedValue(createAnswers());
    generateProjectMock.mockResolvedValue({
      success: false,
      projectPath: '/tmp/test-app',
      filesWritten: 1,
      errors: ['generation failed'],
      warnings: [],
    });

    await expect(main()).rejects.toThrow('exit 1');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Project generation failed:'));

    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should exit with code 0 when user cancels prompt', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code?: number) => {
        throw new Error(`exit ${code}`);
      }) as never);

    promptForProjectDetailsMock.mockRejectedValue(new Error('User force closed the prompt'));

    await expect(main()).rejects.toThrow('exit 0');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Setup cancelled'));

    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should rethrow unexpected errors from main flow', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    promptForProjectDetailsMock.mockRejectedValue(new Error('unexpected failure'));

    await expect(main()).rejects.toThrow('unexpected failure');

    logSpy.mockRestore();
  });
});
