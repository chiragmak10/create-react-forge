import { beforeEach, describe, expect, it, vi } from 'vitest';

const { execaMock, oraMock, spinnerMock } = vi.hoisted(() => {
  const spinner = {
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
  };

  return {
    execaMock: vi.fn(),
    oraMock: vi.fn(() => spinner),
    spinnerMock: spinner,
  };
});

vi.mock('execa', () => ({
  execa: execaMock,
}));

vi.mock('ora', () => ({
  default: oraMock,
}));

import { installDependencies } from '../lifecycle/installer';

describe('installDependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spinnerMock.start.mockReturnValue(spinnerMock);
  });

  it('should install dependencies and succeed spinner', async () => {
    execaMock.mockResolvedValueOnce({ exitCode: 0 });

    await installDependencies('/tmp/project', 'npm');

    expect(oraMock).toHaveBeenCalledWith('Installing dependencies with npm...');
    expect(spinnerMock.start).toHaveBeenCalledTimes(1);
    expect(execaMock).toHaveBeenCalledWith('npm', ['install'], { cwd: '/tmp/project' });
    expect(spinnerMock.succeed).toHaveBeenCalledWith('Dependencies installed');
    expect(spinnerMock.fail).not.toHaveBeenCalled();
  });

  it('should fail spinner and rethrow when install fails', async () => {
    execaMock.mockRejectedValueOnce(new Error('install failed'));

    await expect(installDependencies('/tmp/project', 'pnpm')).rejects.toThrow('install failed');

    expect(oraMock).toHaveBeenCalledWith('Installing dependencies with pnpm...');
    expect(spinnerMock.fail).toHaveBeenCalledWith('Failed to install dependencies');
  });
});
