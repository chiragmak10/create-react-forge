import { beforeEach, describe, expect, it, vi } from 'vitest';

const { execaMock, oraMock, spinnerMock } = vi.hoisted(() => {
  const spinner = {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
  };
  const ora = vi.fn(() => spinner);
  const execa = vi.fn();

  return { execaMock: execa, oraMock: ora, spinnerMock: spinner };
});

vi.mock('execa', () => ({
  execa: execaMock,
}));

vi.mock('ora', () => ({
  default: oraMock,
}));

import { installDependencies } from '../lifecycle';

describe('installDependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spinnerMock.start.mockReturnValue(spinnerMock);
  });

  it('should install dependencies and mark spinner as success', async () => {
    execaMock.mockResolvedValueOnce({ exitCode: 0 });

    await installDependencies('/tmp/test-project', 'npm');

    expect(oraMock).toHaveBeenCalledWith('Installing dependencies with npm...');
    expect(spinnerMock.start).toHaveBeenCalledTimes(1);
    expect(execaMock).toHaveBeenCalledWith('npm', ['install'], { cwd: '/tmp/test-project' });
    expect(spinnerMock.succeed).toHaveBeenCalledWith('Dependencies installed');
    expect(spinnerMock.fail).not.toHaveBeenCalled();
  });

  it('should fail spinner and rethrow on installation error', async () => {
    const error = new Error('install failed');
    execaMock.mockRejectedValueOnce(error);

    await expect(installDependencies('/tmp/test-project', 'pnpm')).rejects.toThrow('install failed');

    expect(oraMock).toHaveBeenCalledWith('Installing dependencies with pnpm...');
    expect(spinnerMock.fail).toHaveBeenCalledWith('Failed to install dependencies');
    expect(spinnerMock.succeed).not.toHaveBeenCalled();
  });
});
