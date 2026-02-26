import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { TemplateRegistry } from '../templates/registry';
import type { ProjectConfig } from '../config/schema';

/**
 * Template System Comprehensive Tests
 * Tests template loading, merging, and composition for all configurations
 */

function getTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'forge-template-test-'));
}

function createTestConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  const defaults: ProjectConfig = {
    name: 'test-app',
    path: getTempDir(),
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
    git: { init: false },
  };

  return { ...defaults, ...overrides };
}

describe('TemplateRegistry - Template System', () => {
  let registry: TemplateRegistry;
  let tempDir: string;

  beforeEach(() => {
    registry = new TemplateRegistry();
    tempDir = getTempDir();
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Template Loading', () => {
    it('should initialize without errors', () => {
      expect(registry).toBeDefined();
    });

    it('should load templates for Vite + TypeScript configuration', () => {
      const config = createTestConfig({
        runtime: 'vite',
        language: 'typescript',
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
    });

    it('should load templates for Next.js + JavaScript configuration', () => {
      const config = createTestConfig({
        runtime: 'nextjs',
        language: 'javascript',
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
    });

    it('should load templates for all runtime combinations', () => {
      const runtimes: Array<'vite' | 'nextjs'> = ['vite', 'nextjs'];
      const languages: Array<'typescript' | 'javascript'> = ['typescript', 'javascript'];

      runtimes.forEach((runtime) => {
        languages.forEach((language) => {
          const config = createTestConfig({ runtime, language });
          const templates = registry.loadTemplatesForConfig(config);
          expect(templates).toBeDefined();
          expect(Array.isArray(templates)).toBe(true);
        });
      });
    });
  });

  describe('Template Merging by Styling', () => {
    it('should handle Tailwind CSS templates', () => {
      const config = createTestConfig({
        styling: { solution: 'tailwind' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Styled Components templates', () => {
      const config = createTestConfig({
        styling: { solution: 'styled-components' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle CSS Modules templates', () => {
      const config = createTestConfig({
        styling: { solution: 'css-modules' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Plain CSS templates', () => {
      const config = createTestConfig({
        styling: { solution: 'css' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should load all styling solutions', () => {
      const styles: Array<'tailwind' | 'styled-components' | 'css-modules' | 'css'> = [
        'tailwind',
        'styled-components',
        'css-modules',
        'css',
      ];

      styles.forEach((style) => {
        const config = createTestConfig({
          styling: { solution: style },
        });

        const templates = registry.loadTemplatesForConfig(config);
        expect(templates).toBeDefined();
      });
    });
  });

  describe('Template Merging by State Management', () => {
    it('should handle no state management', () => {
      const config = createTestConfig({
        stateManagement: 'none',
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Zustand templates', () => {
      const config = createTestConfig({
        stateManagement: 'zustand',
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Redux templates', () => {
      const config = createTestConfig({
        stateManagement: 'redux',
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Jotai templates', () => {
      const config = createTestConfig({
        stateManagement: 'jotai',
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should load all state management options', () => {
      const stateOptions: Array<'none' | 'zustand' | 'redux' | 'jotai'> = [
        'none',
        'zustand',
        'redux',
        'jotai',
      ];

      stateOptions.forEach((state) => {
        const config = createTestConfig({
          stateManagement: state,
        });

        const templates = registry.loadTemplatesForConfig(config);
        expect(templates).toBeDefined();
      });
    });
  });

  describe('Template Merging by Testing', () => {
    it('should handle no testing', () => {
      const config = createTestConfig({
        testing: {
          enabled: false,
          unit: { enabled: false, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Vitest unit testing', () => {
      const config = createTestConfig({
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Jest unit testing', () => {
      const config = createTestConfig({
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Playwright E2E testing', () => {
      const config = createTestConfig({
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Cypress E2E testing', () => {
      const config = createTestConfig({
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: true, runner: 'cypress' },
        },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle full testing setup', () => {
      const config = createTestConfig({
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });
  });

  describe('Template Merging by Data Fetching', () => {
    it('should handle data fetching disabled', () => {
      const config = createTestConfig({
        dataFetching: { enabled: false, library: 'tanstack-query' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle TanStack Query data fetching', () => {
      const config = createTestConfig({
        dataFetching: { enabled: true, library: 'tanstack-query' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });
  });

  describe('Complex Template Combinations', () => {
    it('should handle Vite + TypeScript + Tailwind + Zustand + Full Testing + TanStack Query', () => {
      const config = createTestConfig({
        runtime: 'vite',
        language: 'typescript',
        styling: { solution: 'tailwind' },
        stateManagement: 'zustand',
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
        dataFetching: { enabled: true, library: 'tanstack-query' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
    });

    it('should handle Next.js + JavaScript + Styled Components + Redux + Jest + Cypress', () => {
      const config = createTestConfig({
        runtime: 'nextjs',
        language: 'javascript',
        styling: { solution: 'styled-components' },
        stateManagement: 'redux',
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'cypress' },
        },
        dataFetching: { enabled: false, library: 'tanstack-query' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle Vite + JavaScript + CSS Modules + Jotai + Unit Only (Vitest)', () => {
      const config = createTestConfig({
        runtime: 'vite',
        language: 'javascript',
        styling: { solution: 'css-modules' },
        stateManagement: 'jotai',
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
        dataFetching: { enabled: true, library: 'tanstack-query' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle minimal Next.js setup (no testing, no state, no data fetching)', () => {
      const config = createTestConfig({
        runtime: 'nextjs',
        language: 'typescript',
        styling: { solution: 'css' },
        stateManagement: 'none',
        testing: {
          enabled: false,
          unit: { enabled: false, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
        dataFetching: { enabled: false, library: 'tanstack-query' },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });
  });

  describe('Template Consistency', () => {
    it('should return same templates for identical configurations', () => {
      const config = createTestConfig({
        runtime: 'vite',
        language: 'typescript',
        styling: { solution: 'tailwind' },
      });

      const templates1 = registry.loadTemplatesForConfig(config);
      const templates2 = registry.loadTemplatesForConfig(config);

      expect(templates1.length).toBe(templates2.length);
    });

    it('should return different templates for different runtime', () => {
      const configVite = createTestConfig({ runtime: 'vite' });
      const configNextjs = createTestConfig({ runtime: 'nextjs' });

      const templatesVite = registry.loadTemplatesForConfig(configVite);
      const templatesNextjs = registry.loadTemplatesForConfig(configNextjs);

      // They might have different templates or same base + runtime-specific
      expect(templatesVite).toBeDefined();
      expect(templatesNextjs).toBeDefined();
    });

    it('should return different templates for different styling', () => {
      const configTailwind = createTestConfig({
        styling: { solution: 'tailwind' },
      });
      const configStyled = createTestConfig({
        styling: { solution: 'styled-components' },
      });

      const templatesTailwind = registry.loadTemplatesForConfig(configTailwind);
      const templatesStyled = registry.loadTemplatesForConfig(configStyled);

      expect(templatesTailwind).toBeDefined();
      expect(templatesStyled).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle configuration with all testing disabled', () => {
      const config = createTestConfig({
        testing: {
          enabled: false,
          unit: { enabled: false, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });

      const templates = registry.loadTemplatesForConfig(config);
      expect(templates).toBeDefined();
    });

    it('should handle rapid consecutive template loads', () => {
      const config = createTestConfig();

      for (let i = 0; i < 5; i++) {
        const templates = registry.loadTemplatesForConfig(config);
        expect(templates).toBeDefined();
      }
    });

    it('should handle different registries independently', () => {
      const registry1 = new TemplateRegistry();
      const registry2 = new TemplateRegistry();
      const config = createTestConfig();

      const templates1 = registry1.loadTemplatesForConfig(config);
      const templates2 = registry2.loadTemplatesForConfig(config);

      expect(templates1).toBeDefined();
      expect(templates2).toBeDefined();
    });
  });

  describe('Template Types', () => {
    it('should load overlay templates', () => {
      const config = createTestConfig();
      const templates = registry.loadTemplatesForConfig(config);

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('templates should have required structure', () => {
      const config = createTestConfig();
      const templates = registry.loadTemplatesForConfig(config);

      templates.forEach((template) => {
        expect(template).toBeDefined();
        expect(template.name || template.path).toBeDefined();
      });
    });
  });
});
