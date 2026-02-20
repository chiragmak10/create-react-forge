import { describe, expect, it, vi } from 'vitest';
import type { ProjectConfig } from '../config/schema';
import { PluginManager } from '../plugins/manager';
import type { PluginContext, ReactSetupPlugin } from '../plugins/types';

function createConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    name: 'test-app',
    path: '/tmp/test-app',
    runtime: 'vite',
    language: 'typescript',
    styling: { solution: 'styled-components' },
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
    git: { init: false, initialCommit: false },
    plugins: [],
    ...overrides,
  };
}

describe('PluginManager', () => {
  it('should execute registered hooks', async () => {
    const manager = new PluginManager();
    const afterInstall = vi.fn(async () => undefined);
    const context: PluginContext = { config: createConfig() };

    const plugin: ReactSetupPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      hooks: { afterInstall },
    };

    manager.register(plugin);
    await manager.runHook('afterInstall', context);

    expect(afterInstall).toHaveBeenCalledWith(context);
    expect(afterInstall).toHaveBeenCalledTimes(1);
  });

  it('should continue when a hook throws', async () => {
    const manager = new PluginManager();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const successHook = vi.fn(async () => undefined);
    const context: PluginContext = { config: createConfig() };

    manager.register({
      name: 'failing',
      version: '1.0.0',
      hooks: {
        afterTemplateApply: async () => {
          throw new Error('boom');
        },
      },
    });

    manager.register({
      name: 'success',
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

  it('should allow beforeCreate hook chain to transform config', async () => {
    const manager = new PluginManager();

    manager.register({
      name: 'styling-plugin',
      version: '1.0.0',
      hooks: {
        beforeCreate: async (config) => ({
          ...config,
          styling: { solution: 'tailwind' },
        }),
      },
    });

    manager.register({
      name: 'state-plugin',
      version: '1.0.0',
      hooks: {
        beforeCreate: async (config) => ({
          ...config,
          stateManagement: 'zustand',
        }),
      },
    });

    const updated = await manager.runBeforeCreate(createConfig());
    expect(updated.styling.solution).toBe('tailwind');
    expect(updated.stateManagement).toBe('zustand');
  });

  it('should handle beforeCreate errors and continue', async () => {
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
      name: 'noop',
      version: '1.0.0',
      hooks: {
        beforeCreate: async () => undefined,
      },
    });

    const result = await manager.runBeforeCreate(createConfig());
    expect(result.name).toBe('test-app');
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });
});
