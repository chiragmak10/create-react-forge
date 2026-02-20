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
    git: { init: true, initialCommit: false },
    plugins: [],
    ...overrides,
  };
}

describe('Template Utils', () => {
  it('should resolve runtime template path', () => {
    expect(getTemplatePathForRuntime('vite')).toBe('runtime/vite');
    expect(getTemplatePathForRuntime('nextjs')).toBe('runtime/nextjs');
  });

  it('should resolve styling template paths', () => {
    expect(getTemplatePathForStyling('none')).toBe('');
    expect(getTemplatePathForStyling('tailwind')).toBe('styling/tailwind');
    expect(getTemplatePathForStyling('styled-components')).toBe('styling/styled-components');
    expect(getTemplatePathForStyling('css-modules')).toBe('styling/css-modules');
    expect(getTemplatePathForStyling('css')).toBe('styling/css');
  });

  it('should resolve state and testing template paths', () => {
    expect(getTemplatePathForState('none')).toBe('');
    expect(getTemplatePathForState('redux')).toBe('state/redux');
    expect(getTemplatePathForTesting('none')).toBe('');
    expect(getTemplatePathForTesting('playwright')).toBe('testing/playwright');
  });

  it('should resolve data fetching template path', () => {
    expect(getTemplatePathForDataFetching('none')).toBe('');
    expect(getTemplatePathForDataFetching('tanstack-query')).toBe('features/tanstack-query');
  });

  it('should build applicable template paths for a full-featured config', () => {
    const paths = getApplicableTemplatePaths(
      createConfig({
        runtime: 'vite',
        styling: { solution: 'css-modules' },
        stateManagement: 'redux',
        dataFetching: { enabled: true, library: 'tanstack-query' },
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
      })
    );

    expect(paths).toContain('base');
    expect(paths).toContain('runtime/vite');
    expect(paths).toContain('styling/css-modules');
    expect(paths).toContain('state/redux');
    expect(paths).toContain('testing/vitest');
    expect(paths).toContain('testing/playwright');
    expect(paths).toContain('features/tanstack-query');
  });

  it('should omit optional templates when disabled', () => {
    const paths = getApplicableTemplatePaths(
      createConfig({
        runtime: 'nextjs',
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

    expect(paths).toEqual(['base', 'runtime/nextjs']);
  });

  it('should support legacy applicable template helper', () => {
    const fullPaths = getApplicableTemplates({
      runtime: 'vite',
      styling: 'css',
      stateManagement: 'zustand',
      testing: {},
      dataFetching: { enabled: true },
    });

    expect(fullPaths).toContain('base');
    expect(fullPaths).toContain('runtime/vite');
    expect(fullPaths).toContain('styling/css');
    expect(fullPaths).toContain('state/zustand');
    expect(fullPaths).toContain('features/tanstack-query');

    const minimalPaths = getApplicableTemplates({
      runtime: 'nextjs',
      styling: 'none',
      stateManagement: 'none',
      testing: {},
    });

    expect(minimalPaths).toEqual(['base', 'runtime/nextjs']);
  });
});
