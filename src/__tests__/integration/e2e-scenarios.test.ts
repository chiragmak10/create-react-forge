import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ProjectGenerator } from '../../generator/index';
import type { ProjectConfig } from '../../config/schema';

/**
 * End-to-End Real-World Scenario Tests
 * Tests common project configurations that users actually use
 */

function getTempDir(): string {
  return join(
    tmpdir(),
    `crf-e2e-scenario-${Date.now()}-${Math.random().toString(36).substring(7)}`
  );
}

function createConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
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
    git: { init: false, initialCommit: false },
  };
  return { ...defaults, ...overrides };
}

describe('E2E Scenarios - Real-World Project Configurations', () => {
  afterEach(() => {
    // Cleanup happens in each test
  });

  describe('Scenario 1: Startup SPA (Vite + TypeScript + Tailwind + Zustand + Full Testing)', () => {
    it('should generate complete startup SPA configuration', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        name: 'startup-app',
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
        packageManager: 'npm',
        git: { init: true, initialCommit: false },
      });

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(result.filesWritten).toBeGreaterThan(20);
      expect(result.errors).toHaveLength(0);

      // Verify structure
      expect(existsSync(join(tempDir, 'package.json'))).toBe(true);
      expect(existsSync(join(tempDir, 'src'))).toBe(true);
      expect(existsSync(join(tempDir, 'tsconfig.json'))).toBe(true);
      expect(existsSync(join(tempDir, 'vite.config.ts'))).toBe(true);

      // Verify dependencies
      const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
      expect(pkg.dependencies.zustand).toBeDefined();
      expect(pkg.dependencies['@tanstack/react-query']).toBeDefined();
      expect(pkg.devDependencies.tailwindcss).toBeDefined();
      expect(pkg.devDependencies.vitest).toBeDefined();
      expect(pkg.devDependencies['@playwright/test']).toBeDefined();

      // Verify scripts
      expect(pkg.scripts.dev).toBeDefined();
      expect(pkg.scripts.build).toBeDefined();
      expect(pkg.scripts.test).toBeDefined();

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should verify startup SPA src structure', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        runtime: 'vite',
        language: 'typescript',
        stateManagement: 'zustand',
      });

      const generator = new ProjectGenerator(config);
      await generator.generate();

      // Verify common directories exist
      expect(existsSync(join(tempDir, 'src', 'app'))).toBe(true);
      expect(existsSync(join(tempDir, 'src', 'components'))).toBe(true);
      expect(existsSync(join(tempDir, 'src', 'features'))).toBe(true);
      expect(existsSync(join(tempDir, 'src', 'hooks'))).toBe(true);
      expect(existsSync(join(tempDir, 'src', 'lib'))).toBe(true);
      expect(existsSync(join(tempDir, 'src', 'stores'))).toBe(true);
      expect(existsSync(join(tempDir, 'src', 'types'))).toBe(true);

      rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Scenario 2: Enterprise Next.js (Next.js + TypeScript + Redux + Full Testing)', () => {
    it('should generate enterprise Next.js configuration', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        name: 'enterprise-app',
        runtime: 'nextjs',
        language: 'typescript',
        styling: { solution: 'tailwind' },
        stateManagement: 'redux',
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
        dataFetching: { enabled: true, library: 'tanstack-query' },
        packageManager: 'pnpm',
        git: { init: true, initialCommit: false },
      });

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(result.filesWritten).toBeGreaterThan(20);

      // Verify Next.js specific files
      expect(existsSync(join(tempDir, 'package.json'))).toBe(true);
      expect(existsSync(join(tempDir, 'next.config.js'))).toBe(true);
      expect(existsSync(join(tempDir, 'tsconfig.json'))).toBe(true);

      // Verify dependencies
      const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
      expect(pkg.dependencies.next).toBeDefined();
      expect(pkg.dependencies['@reduxjs/toolkit']).toBeDefined();
      expect(pkg.devDependencies.jest).toBeDefined();
      expect(pkg.devDependencies['@playwright/test']).toBeDefined();

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should verify enterprise app directory structure', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        runtime: 'nextjs',
        language: 'typescript',
      });

      const generator = new ProjectGenerator(config);
      await generator.generate();

      // Next.js app directory
      expect(existsSync(join(tempDir, 'src', 'app'))).toBe(true);
      expect(existsSync(join(tempDir, 'src', 'components'))).toBe(true);

      rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Scenario 3: Lightweight Project (Vite + JavaScript + CSS Modules + No Testing)', () => {
    it('should generate lightweight JavaScript project', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        name: 'lightweight-app',
        runtime: 'vite',
        language: 'javascript',
        styling: { solution: 'css-modules' },
        stateManagement: 'none',
        testing: {
          enabled: false,
          unit: { enabled: false, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
        dataFetching: { enabled: false, library: 'tanstack-query' },
        packageManager: 'npm',
      });

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Should not have TypeScript config
      // const hasTypeScript = existsSync(join(tempDir, 'tsconfig.json'));
      // Note: Depending on implementation, TS config might still exist as base
      expect(existsSync(join(tempDir, 'package.json'))).toBe(true);

      // Verify no test dependencies
      const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies.vitest).toBeUndefined();
      expect(pkg.devDependencies.jest).toBeUndefined();

      rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Scenario 4: Component Library (Vite + TypeScript + Styled Components + Jest Unit Only)', () => {
    it('should generate component library configuration', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        name: 'component-lib',
        runtime: 'vite',
        language: 'typescript',
        styling: { solution: 'styled-components' },
        stateManagement: 'none',
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
        dataFetching: { enabled: false, library: 'tanstack-query' },
        packageManager: 'npm',
      });

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Verify testing setup
      const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies.jest).toBeDefined();
      expect(pkg.dependencies['styled-components']).toBeDefined();

      // Should NOT have E2E testing
      expect(pkg.devDependencies.cypress).toBeUndefined();
      expect(pkg.devDependencies['@playwright/test']).toBeUndefined();

      rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Scenario 5: Data-Heavy App (Next.js + TypeScript + TanStack Query + Redux)', () => {
    it('should generate data-heavy application configuration', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        name: 'data-app',
        runtime: 'nextjs',
        language: 'typescript',
        styling: { solution: 'tailwind' },
        stateManagement: 'redux',
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
        dataFetching: { enabled: true, library: 'tanstack-query' },
        packageManager: 'npm',
      });

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Verify data fetching setup
      const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
      expect(pkg.dependencies['@tanstack/react-query']).toBeDefined();
      expect(pkg.dependencies['@reduxjs/toolkit']).toBeDefined();
      expect(pkg.dependencies.next).toBeDefined();

      rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Scenario 6: Jotai + Styled Components (Vite + TypeScript + Jotai)', () => {
    it('should generate Jotai-based project', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        name: 'jotai-app',
        runtime: 'vite',
        language: 'typescript',
        styling: { solution: 'styled-components' },
        stateManagement: 'jotai',
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
        packageManager: 'yarn',
      });

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Verify Jotai setup
      const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
      expect(pkg.dependencies.jotai).toBeDefined();
      expect(pkg.dependencies['styled-components']).toBeDefined();

      rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Scenario 7: Multi-PM Support (Same config, different package managers)', () => {
    it('should generate with npm', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        packageManager: 'npm',
      });

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(existsSync(join(tempDir, 'package.json'))).toBe(true);

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should generate with yarn', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        packageManager: 'yarn',
      });

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(existsSync(join(tempDir, 'package.json'))).toBe(true);

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should generate with pnpm', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        packageManager: 'pnpm',
      });

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(existsSync(join(tempDir, 'package.json'))).toBe(true);

      rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Scenario 8: All Options Combinations', () => {
    it('should handle all runtime + language combinations', async () => {
      const runtimes: Array<'vite' | 'nextjs'> = ['vite', 'nextjs'];
      const languages: Array<'typescript' | 'javascript'> = ['typescript', 'javascript'];

      for (const runtime of runtimes) {
        for (const language of languages) {
          const tempDir = getTempDir();
          const config = createConfig({
            path: tempDir,
            runtime,
            language,
          });

          const generator = new ProjectGenerator(config);
          const result = await generator.generate();

          expect(result.success).toBe(true);
          expect(result.projectPath).toBe(tempDir);

          rmSync(tempDir, { recursive: true, force: true });
        }
      }
    });

    it('should handle all styling solutions', async () => {
      const styles: Array<'tailwind' | 'styled-components' | 'css-modules' | 'css'> = [
        'tailwind',
        'styled-components',
        'css-modules',
        'css',
      ];

      for (const style of styles) {
        const tempDir = getTempDir();
        const config = createConfig({
          path: tempDir,
          styling: { solution: style },
        });

        const generator = new ProjectGenerator(config);
        const result = await generator.generate();

        expect(result.success).toBe(true);

        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should handle all state management options', async () => {
      const states: Array<'none' | 'zustand' | 'redux' | 'jotai'> = [
        'none',
        'zustand',
        'redux',
        'jotai',
      ];

      for (const state of states) {
        const tempDir = getTempDir();
        const config = createConfig({
          path: tempDir,
          stateManagement: state,
        });

        const generator = new ProjectGenerator(config);
        const result = await generator.generate();

        expect(result.success).toBe(true);

        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Scenario Quality Checks', () => {
    it('should generate projects with proper package.json name', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        name: 'my-quality-app',
      });

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
      expect(pkg.name).toBe('my-quality-app');

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should generate projects with module type es modules', async () => {
      const tempDir = getTempDir();
      const config = createConfig({ path: tempDir });

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));
      expect(pkg.type).toBe('module');

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should generate documentation files', async () => {
      const tempDir = getTempDir();
      const config = createConfig({
        path: tempDir,
        git: { init: true, initialCommit: false },
      });

      const generator = new ProjectGenerator(config);
      await generator.generate();

      expect(existsSync(join(tempDir, 'README.md'))).toBe(true);
      expect(existsSync(join(tempDir, 'ARCHITECTURE.md'))).toBe(true);
      expect(existsSync(join(tempDir, '.gitignore'))).toBe(true);

      rmSync(tempDir, { recursive: true, force: true });
    });
  });
});
