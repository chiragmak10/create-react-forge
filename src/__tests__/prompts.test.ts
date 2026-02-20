import { describe, expect, it, vi, beforeEach } from 'vitest';

const { inputMock, selectMock, confirmMock } = vi.hoisted(() => ({
  inputMock: vi.fn(),
  selectMock: vi.fn(),
  confirmMock: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => ({
  input: inputMock,
  select: selectMock,
  confirm: confirmMock,
}));

import { confirmProceed, promptForProjectDetails } from '../cli/prompts';

describe('CLI Prompts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should collect Vite answers with full testing flow', async () => {
    inputMock.mockResolvedValueOnce('my-app').mockResolvedValueOnce('./my-app');

    selectMock
      .mockResolvedValueOnce('vite')
      .mockResolvedValueOnce('typescript')
      .mockResolvedValueOnce('css')
      .mockResolvedValueOnce('jotai')
      .mockResolvedValueOnce('full')
      .mockResolvedValueOnce('jest')
      .mockResolvedValueOnce('cypress')
      .mockResolvedValueOnce('pnpm');

    confirmMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    const result = await promptForProjectDetails();

    expect(result).toEqual({
      projectName: 'my-app',
      projectPath: './my-app',
      runtime: 'vite',
      language: 'typescript',
      styling: 'css',
      stateManagement: 'jotai',
      testing: 'full',
      unitRunner: 'jest',
      e2eRunner: 'cypress',
      dataFetching: true,
      packageManager: 'pnpm',
      git: false,
      prettier: true,
    });

    const projectNamePrompt = inputMock.mock.calls[0][0] as { validate: (value: string) => true | string };
    expect(projectNamePrompt.validate('')).toBe('Project name is required');
    expect(projectNamePrompt.validate('Invalid Name')).toBe(
      'Project name must be lowercase alphanumeric with hyphens'
    );
    expect(projectNamePrompt.validate('valid-name-123')).toBe(true);
  });

  it('should auto-select tailwind for Next.js and skip test runner prompts when testing is none', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    inputMock.mockResolvedValueOnce('next-app').mockResolvedValueOnce('./next-app');

    selectMock
      .mockResolvedValueOnce('nextjs')
      .mockResolvedValueOnce('javascript')
      .mockResolvedValueOnce('none')
      .mockResolvedValueOnce('none')
      .mockResolvedValueOnce('npm');

    confirmMock.mockResolvedValueOnce(false).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const result = await promptForProjectDetails('suggested-name');

    expect(result).toEqual({
      projectName: 'next-app',
      projectPath: './next-app',
      runtime: 'nextjs',
      language: 'javascript',
      styling: 'tailwind',
      stateManagement: 'none',
      testing: 'none',
      unitRunner: 'vitest',
      e2eRunner: 'playwright',
      dataFetching: false,
      packageManager: 'npm',
      git: true,
      prettier: false,
    });

    expect(logSpy).toHaveBeenCalledWith('  ✓ Styling: Tailwind CSS (recommended for Next.js)');
    expect(selectMock).toHaveBeenCalledTimes(5);

    logSpy.mockRestore();
  });

  it('should ask for confirmation with default and custom message', async () => {
    confirmMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const defaultResult = await confirmProceed();
    const customResult = await confirmProceed('Continue setup?');

    expect(defaultResult).toBe(true);
    expect(customResult).toBe(false);
    expect(confirmMock.mock.calls[0][0]).toEqual({ message: 'Proceed?', default: true });
    expect(confirmMock.mock.calls[1][0]).toEqual({ message: 'Continue setup?', default: true });
  });
});
