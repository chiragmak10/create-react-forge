import { describe, expect, it, vi } from 'vitest';
import type { ProjectConfig } from '../config/schema';
import { PluginManager, type PluginContext, type ReactSetupPlugin } from '../plugins';

function createConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    name: 'test-app',
    path: '/tmp/test-app',
    runtime: 'vite',
    language: 'typescript',
    styling: { solution: 'tailwind' },
    stateManagement: 'none',
    dataFetching: { enabled: false, library: 'tanstack-query' },
    testing: {
      enabled: false,
      unit: { enabled: false, runner: 'vitest' },
      component: { enabled: false, library: 'testing-library' },
      e2e: { enabled: false, runner: 'none' },
    },
    linting: { prettier: true },
    packageManager: 'npm',
    git: { init: true, initialCommit: false },
    plugins: [],
    ...overrides,
  };
}

describe('PluginManager', () => {
  it('should run registered lifecycle hooks', async () => {
    const manager = new PluginManager();
    const hook = vi.fn(async () => undefined);
    const context: PluginContext = { config: createConfig() };

    const plugin: ReactSetupPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      hooks: {
        afterInstall: hook,
      },
    };

    manager.register(plugin);
    await manager.runHook('afterInstall', context);

    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith(context);
  });

  it('should continue running hooks when one plugin throws', async () => {
    const manager = new PluginManager();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const successHook = vi.fn(async () => undefined);
    const context: PluginContext = { config: createConfig() };

    manager.register({
      name: 'failing-plugin',
      version: '1.0.0',
      hooks: {
        afterTemplateApply: async () => {
          throw new Error('hook failed');
        },
      },
    });
    manager.register({
      name: 'successful-plugin',
      version: '1.0.0',
      hooks: {
        afterTemplateApply: successHook,
      },
    });

    await manager.runHook('afterTemplateApply', context);

    expect(successHook).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it('should merge beforeCreate plugin results', async () => {
    const manager = new PluginManager();

    manager.register({
      name: 'set-styling',
      version: '1.0.0',
      hooks: {
        beforeCreate: async (config) => ({
          ...config,
          styling: { solution: 'css' },
        }),
      },
    });
    manager.register({
      name: 'noop-plugin',
      version: '1.0.0',
      hooks: {
        beforeCreate: async () => undefined,
      },
    });

    const updated = await manager.runBeforeCreate(createConfig());

    expect(updated.styling.solution).toBe('css');
  });

  it('should continue beforeCreate when plugin throws', async () => {
    const manager = new PluginManager();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    manager.register({
      name: 'thrower',
      version: '1.0.0',
      hooks: {
        beforeCreate: async () => {
          throw new Error('beforeCreate failed');
        },
      },
    });
    manager.register({
      name: 'state-plugin',
      version: '1.0.0',
      hooks: {
        beforeCreate: async (config) => ({
          ...config,
          stateManagement: 'jotai',
        }),
      },
    });

    const updated = await manager.runBeforeCreate(createConfig());

    expect(updated.stateManagement).toBe('jotai');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
