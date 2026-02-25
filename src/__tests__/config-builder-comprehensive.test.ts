import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigBuilder } from '../../config/builder';
import type { ProjectConfig } from '../../config/schema';
import { ProjectConfigSchema, DEFAULT_CONFIG } from '../../config/schema';

/**
 * ConfigBuilder Comprehensive Tests
 * Tests validation, chaining, edge cases, and all configuration combinations
 */

describe('ConfigBuilder - Configuration Management', () => {
  let builder: ConfigBuilder;

  beforeEach(() => {
    builder = new ConfigBuilder();
  });

  describe('Builder Fluent API', () => {
    it('should support fluent chaining', () => {
      const result = builder
        .setName('my-app')
        .setPath('/path/to/app')
        .setRuntime('vite')
        .setLanguage('typescript')
        .build();

      expect(result.name).toBe('my-app');
      expect(result.path).toBe('/path/to/app');
      expect(result.runtime).toBe('vite');
      expect(result.language).toBe('typescript');
    });

    it('should return builder instance for method chaining', () => {
      const result = builder.setName('test');
      expect(result).toBe(builder);
    });

    it('should allow partial configuration updates', () => {
      const config = builder.setName('partial-app').setRuntime('nextjs').build();

      expect(config.name).toBe('partial-app');
      expect(config.runtime).toBe('nextjs');
    });
  });

  describe('Basic Configuration', () => {
    it('should set project name', () => {
      builder.setName('test-project');
      const config = builder.build();
      expect(config.name).toBe('test-project');
    });

    it('should set project path', () => {
      builder.setPath('/tmp/test');
      const config = builder.build();
      expect(config.path).toBe('/tmp/test');
    });

    it('should set runtime to vite', () => {
      builder.setRuntime('vite');
      const config = builder.build();
      expect(config.runtime).toBe('vite');
    });

    it('should set runtime to nextjs', () => {
      builder.setRuntime('nextjs');
      const config = builder.build();
      expect(config.runtime).toBe('nextjs');
    });

    it('should set language to typescript', () => {
      builder.setLanguage('typescript');
      const config = builder.build();
      expect(config.language).toBe('typescript');
    });

    it('should set language to javascript', () => {
      builder.setLanguage('javascript');
      const config = builder.build();
      expect(config.language).toBe('javascript');
    });
  });

  describe('Styling Configuration', () => {
    it('should set tailwind styling', () => {
      builder.setStyling('tailwind');
      const config = builder.build();
      expect(config.styling.solution).toBe('tailwind');
    });

    it('should set styled-components styling', () => {
      builder.setStyling('styled-components');
      const config = builder.build();
      expect(config.styling.solution).toBe('styled-components');
    });

    it('should set css-modules styling', () => {
      builder.setStyling('css-modules');
      const config = builder.build();
      expect(config.styling.solution).toBe('css-modules');
    });

    it('should set plain css styling', () => {
      builder.setStyling('css');
      const config = builder.build();
      expect(config.styling.solution).toBe('css');
    });

    it('should handle all styling options', () => {
      const styles = ['tailwind', 'styled-components', 'css-modules', 'css'];
      styles.forEach((style) => {
        const newBuilder = new ConfigBuilder();
        newBuilder.setStyling(style);
        expect(newBuilder.build().styling.solution).toBe(style);
      });
    });
  });

  describe('State Management Configuration', () => {
    it('should set zustand state management', () => {
      builder.setStateManagement('zustand');
      const config = builder.build();
      expect(config.stateManagement).toBe('zustand');
    });

    it('should set redux state management', () => {
      builder.setStateManagement('redux');
      const config = builder.build();
      expect(config.stateManagement).toBe('redux');
    });

    it('should set jotai state management', () => {
      builder.setStateManagement('jotai');
      const config = builder.build();
      expect(config.stateManagement).toBe('jotai');
    });

    it('should set none for no state management', () => {
      builder.setStateManagement('none');
      const config = builder.build();
      expect(config.stateManagement).toBe('none');
    });
  });

  describe('Testing Configuration', () => {
    it('should enable full testing with vitest', () => {
      builder
        .setTestingEnabled(true)
        .setUnitTestingEnabled(true)
        .setUnitTestRunner('vitest')
        .setE2ETestingEnabled(true)
        .setE2ETestRunner('playwright');

      const config = builder.build();
      expect(config.testing.enabled).toBe(true);
      expect(config.testing.unit.enabled).toBe(true);
      expect(config.testing.unit.runner).toBe('vitest');
      expect(config.testing.e2e.enabled).toBe(true);
      expect(config.testing.e2e.runner).toBe('playwright');
    });

    it('should enable full testing with jest', () => {
      builder
        .setTestingEnabled(true)
        .setUnitTestingEnabled(true)
        .setUnitTestRunner('jest')
        .setE2ETestingEnabled(true)
        .setE2ETestRunner('cypress');

      const config = builder.build();
      expect(config.testing.unit.runner).toBe('jest');
      expect(config.testing.e2e.runner).toBe('cypress');
    });

    it('should enable unit testing only', () => {
      builder
        .setTestingEnabled(true)
        .setUnitTestingEnabled(true)
        .setUnitTestRunner('vitest')
        .setE2ETestingEnabled(false)
        .setE2ETestRunner('none');

      const config = builder.build();
      expect(config.testing.enabled).toBe(true);
      expect(config.testing.unit.enabled).toBe(true);
      expect(config.testing.e2e.enabled).toBe(false);
    });

    it('should disable testing', () => {
      builder
        .setTestingEnabled(false)
        .setUnitTestingEnabled(false)
        .setE2ETestingEnabled(false)
        .setE2ETestRunner('none');

      const config = builder.build();
      expect(config.testing.enabled).toBe(false);
      expect(config.testing.unit.enabled).toBe(false);
      expect(config.testing.e2e.enabled).toBe(false);
    });

    it('should handle all unit test runners', () => {
      const runners: Array<'vitest' | 'jest'> = ['vitest', 'jest'];
      runners.forEach((runner) => {
        const newBuilder = new ConfigBuilder();
        newBuilder.setTestingEnabled(true).setUnitTestingEnabled(true).setUnitTestRunner(runner);
        expect(newBuilder.build().testing.unit.runner).toBe(runner);
      });
    });

    it('should handle all E2E runners', () => {
      const runners: Array<'playwright' | 'cypress' | 'none'> = ['playwright', 'cypress', 'none'];
      runners.forEach((runner) => {
        const newBuilder = new ConfigBuilder();
        newBuilder.setE2ETestRunner(runner);
        expect(newBuilder.build().testing.e2e.runner).toBe(runner);
      });
    });
  });

  describe('Package Manager Configuration', () => {
    it('should set npm as package manager', () => {
      builder.setPackageManager('npm');
      const config = builder.build();
      expect(config.packageManager).toBe('npm');
    });

    it('should set yarn as package manager', () => {
      builder.setPackageManager('yarn');
      const config = builder.build();
      expect(config.packageManager).toBe('yarn');
    });

    it('should set pnpm as package manager', () => {
      builder.setPackageManager('pnpm');
      const config = builder.build();
      expect(config.packageManager).toBe('pnpm');
    });

    it('should handle all package managers', () => {
      const managers: Array<'npm' | 'yarn' | 'pnpm'> = ['npm', 'yarn', 'pnpm'];
      managers.forEach((manager) => {
        const newBuilder = new ConfigBuilder();
        newBuilder.setPackageManager(manager);
        expect(newBuilder.build().packageManager).toBe(manager);
      });
    });
  });

  describe('Git Configuration', () => {
    it('should enable git initialization', () => {
      builder.setGitInit(true);
      const config = builder.build();
      expect(config.git.init).toBe(true);
    });

    it('should disable git initialization', () => {
      builder.setGitInit(false);
      const config = builder.build();
      expect(config.git.init).toBe(false);
    });
  });

  describe('Data Fetching Configuration', () => {
    it('should enable data fetching', () => {
      builder.setDataFetchingEnabled(true);
      const config = builder.build();
      expect(config.dataFetching.enabled).toBe(true);
    });

    it('should disable data fetching', () => {
      builder.setDataFetchingEnabled(false);
      const config = builder.build();
      expect(config.dataFetching.enabled).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should validate successfully with all required fields', () => {
      const config = builder
        .setName('valid-app')
        .setPath('/tmp/app')
        .setRuntime('vite')
        .setLanguage('typescript')
        .setStyling('tailwind')
        .setPackageManager('npm')
        .build();

      expect(config.name).toBe('valid-app');
      expect(config).toBeDefined();
    });

    it('should throw on validation error with missing required field', () => {
      const incompleteConfig = {
        // Missing required fields
        runtime: 'vite',
      } as ProjectConfig;

      expect(() => {
        ProjectConfigSchema.parse(incompleteConfig);
      }).toThrow();
    });

    it('should validate mixed configurations', () => {
      const config = builder
        .setName('app')
        .setPath('/tmp')
        .setRuntime('nextjs')
        .setLanguage('javascript')
        .setStyling('styled-components')
        .setStateManagement('zustand')
        .setTestingEnabled(true)
        .setUnitTestingEnabled(true)
        .setUnitTestRunner('jest')
        .setE2ETestingEnabled(true)
        .setE2ETestRunner('playwright')
        .setDataFetchingEnabled(true)
        .setPackageManager('yarn')
        .setGitInit(true)
        .build();

      expect(config).toBeDefined();
      expect(config.name).toBe('app');
      expect(config.runtime).toBe('nextjs');
      expect(config.language).toBe('javascript');
    });
  });

  describe('Configuration Merging', () => {
    it('should initialize with partial config', () => {
      const partial: Partial<ProjectConfig> = {
        name: 'partial-app',
        runtime: 'vite',
      };

      const newBuilder = new ConfigBuilder(partial);
      const config = newBuilder
        .setPath('/tmp')
        .setLanguage('typescript')
        .setStyling('tailwind')
        .setPackageManager('npm')
        .build();

      expect(config.name).toBe('partial-app');
      expect(config.runtime).toBe('vite');
      expect(config.path).toBe('/tmp');
    });

    it('should not mutate original config', () => {
      const original: Partial<ProjectConfig> = { name: 'original' };
      const newBuilder = new ConfigBuilder(original);
      newBuilder.setName('modified');

      expect(original.name).toBe('original');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle Vite + TypeScript + Tailwind + Full Testing + TanStack Query', () => {
      const config = builder
        .setName('vite-ts-full')
        .setPath('/tmp/vite-ts-full')
        .setRuntime('vite')
        .setLanguage('typescript')
        .setStyling('tailwind')
        .setStateManagement('zustand')
        .setTestingEnabled(true)
        .setUnitTestingEnabled(true)
        .setUnitTestRunner('vitest')
        .setE2ETestingEnabled(true)
        .setE2ETestRunner('playwright')
        .setDataFetchingEnabled(true)
        .setPackageManager('npm')
        .setGitInit(true)
        .build();

      expect(config).toBeDefined();
      expect(config.runtime).toBe('vite');
      expect(config.testing.enabled).toBe(true);
    });

    it('should handle Next.js + JavaScript + Styled Components + Jest + Cypress', () => {
      const config = builder
        .setName('nextjs-js-styled')
        .setPath('/tmp/nextjs-js-styled')
        .setRuntime('nextjs')
        .setLanguage('javascript')
        .setStyling('styled-components')
        .setStateManagement('redux')
        .setTestingEnabled(true)
        .setUnitTestingEnabled(true)
        .setUnitTestRunner('jest')
        .setE2ETestingEnabled(true)
        .setE2ETestRunner('cypress')
        .setDataFetchingEnabled(false)
        .setPackageManager('pnpm')
        .setGitInit(false)
        .build();

      expect(config.runtime).toBe('nextjs');
      expect(config.language).toBe('javascript');
      expect(config.testing.unit.runner).toBe('jest');
    });

    it('should handle minimal configuration (no testing, no state, no data fetching)', () => {
      const config = builder
        .setName('minimal')
        .setPath('/tmp/minimal')
        .setRuntime('vite')
        .setLanguage('typescript')
        .setStyling('css')
        .setStateManagement('none')
        .setTestingEnabled(false)
        .setE2ETestRunner('none')
        .setDataFetchingEnabled(false)
        .setPackageManager('npm')
        .setGitInit(false)
        .build();

      expect(config.testing.enabled).toBe(false);
      expect(config.stateManagement).toBe('none');
      expect(config.dataFetching.enabled).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty builder build', () => {
      expect(() => {
        builder.build();
      }).toThrow(); // Should fail validation due to missing required fields
    });

    it('should preserve defaults when not overridden', () => {
      const config = builder
        .setName('defaults')
        .setPath('/tmp')
        .setRuntime('vite')
        .setLanguage('typescript')
        .setStyling('tailwind')
        .setPackageManager('npm')
        .build();

      // Should have defaults for unset properties
      expect(config.testing).toBeDefined();
      expect(config.dataFetching).toBeDefined();
      expect(config.git).toBeDefined();
    });

    it('should handle subsequent builds independently', () => {
      const config1 = builder
        .setName('config1')
        .setRuntime('vite')
        .setPackageManager('npm')
        .setLanguage('typescript')
        .setStyling('tailwind')
        .build();

      const builder2 = new ConfigBuilder();
      const config2 = builder2
        .setName('config2')
        .setRuntime('nextjs')
        .setPackageManager('yarn')
        .setLanguage('javascript')
        .setStyling('styled-components')
        .build();

      expect(config1.name).toBe('config1');
      expect(config1.runtime).toBe('vite');
      expect(config2.name).toBe('config2');
      expect(config2.runtime).toBe('nextjs');
    });
  });
});
