import { describe, expect, it } from 'vitest';
import type { ProjectConfig } from '../config/schema';
import {
  getApplicableTemplatePaths,
  getApplicableTemplates,
  getTemplatePathForDataFetching,
  getTemplatePathForRuntime,
  getTemplatePathForState,
  getTemplatePathForStyling,
  getTemplatePathForTesting,
} from '../templates/utils';

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

describe('template utils', () => {
  it('should resolve individual template paths', () => {
    expect(getTemplatePathForRuntime('vite')).toBe('runtime/vite');
    expect(getTemplatePathForRuntime('nextjs')).toBe('runtime/nextjs');

    expect(getTemplatePathForStyling('none')).toBe('');
    expect(getTemplatePathForStyling('tailwind')).toBe('styling/tailwind');
    expect(getTemplatePathForStyling('styled-components')).toBe('styling/styled-components');
    expect(getTemplatePathForStyling('css-modules')).toBe('styling/css-modules');

    expect(getTemplatePathForState('none')).toBe('');
    expect(getTemplatePathForState('zustand')).toBe('state/zustand');

    expect(getTemplatePathForTesting('none')).toBe('');
    expect(getTemplatePathForTesting('playwright')).toBe('testing/playwright');

    expect(getTemplatePathForDataFetching('none')).toBe('');
    expect(getTemplatePathForDataFetching('tanstack-query')).toBe('features/tanstack-query');
  });

  it('should build applicable template paths for full config', () => {
    const paths = getApplicableTemplatePaths(
      createConfig({
        runtime: 'nextjs',
        styling: { solution: 'tailwind' },
        stateManagement: 'redux',
        dataFetching: { enabled: true, library: 'tanstack-query' },
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'cypress' },
        },
      })
    );

    expect(paths).toContain('base');
    expect(paths).toContain('runtime/nextjs');
    expect(paths).toContain('styling/tailwind');
    expect(paths).toContain('state/redux');
    expect(paths).toContain('testing/jest');
    expect(paths).toContain('testing/cypress');
    expect(paths).toContain('features/tanstack-query');
  });

  it('should skip optional templates when disabled', () => {
    const paths = getApplicableTemplatePaths(
      createConfig({
        runtime: 'vite',
        styling: { solution: 'none' },
        stateManagement: 'none',
        dataFetching: { enabled: false, library: 'tanstack-query' },
        testing: {
          enabled: true,
          unit: { enabled: false, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      })
    );

    expect(paths).toEqual(['base', 'runtime/vite']);
  });

  it('should support legacy template path helper', () => {
    const legacy = getApplicableTemplates({
      runtime: 'vite',
      styling: 'styled-components',
      stateManagement: 'zustand',
      testing: {},
      dataFetching: { enabled: true },
    });

    expect(legacy).toContain('base');
    expect(legacy).toContain('runtime/vite');
    expect(legacy).toContain('styling/styled-components');
    expect(legacy).toContain('state/zustand');
    expect(legacy).toContain('features/tanstack-query');
  });
});
