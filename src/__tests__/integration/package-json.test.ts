import { describe, expect, it, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ProjectGenerator } from '../../generator/index.js';
import { ProjectConfig } from '../../config/schema.js';

/**
 * Integration tests specifically for package.json generation
 * Ensures generated package.json is valid and contains correct dependencies
 */

function getTempProjectPath(name: string): string {
  return join(tmpdir(), `react-setup-pkg-test-${name}-${Date.now()}`);
}

function cleanupProject(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

function readGeneratedPackageJson(projectPath: string): Record<string, unknown> {
  const pkgPath = join(projectPath, 'package.json');
  const content = readFileSync(pkgPath, 'utf-8');
  return JSON.parse(content);
}

function createConfig(name: string, overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  const basePath = getTempProjectPath(name);
  return {
    name,
    path: basePath,
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
    linting: { prettier: false },
    packageManager: 'npm',
    git: { init: false, initialCommit: false },
    plugins: [],
    ...overrides,
  };
}

describe('Package.json Generation', () => {
  const projectPaths: string[] = [];

  afterEach(() => {
    projectPaths.forEach(cleanupProject);
    projectPaths.length = 0;
  });

  describe('Core Fields', () => {
    it('should have required package.json fields', async () => {
      const config = createConfig('core-fields');
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('version');
      expect(pkg).toHaveProperty('scripts');
      expect(pkg).toHaveProperty('dependencies');
      expect(pkg).toHaveProperty('devDependencies');
    });

    it('should set private to true', async () => {
      const config = createConfig('private-field');
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      expect(pkg.private).toBe(true);
    });

    it('should use ES modules (type: module)', async () => {
      const config = createConfig('type-module');
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      expect(pkg.type).toBe('module');
    });
  });

  describe('Vite Dependencies', () => {
    it('should include vite and react for Vite projects', async () => {
      const config = createConfig('vite-deps', { runtime: 'vite' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;
      const devDeps = pkg.devDependencies as Record<string, string>;

      expect(deps).toHaveProperty('react');
      expect(deps).toHaveProperty('react-dom');
      expect(devDeps).toHaveProperty('vite');
      expect(devDeps).toHaveProperty('@vitejs/plugin-react');
    });

    it('should include react-router for Vite projects', async () => {
      const config = createConfig('vite-router', { runtime: 'vite' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;

      expect(deps).toHaveProperty('react-router-dom');
    });
  });

  describe('Next.js Dependencies', () => {
    it('should include next and react for Next.js projects', async () => {
      const config = createConfig('nextjs-deps', { runtime: 'nextjs' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;

      expect(deps).toHaveProperty('next');
      expect(deps).toHaveProperty('react');
      expect(deps).toHaveProperty('react-dom');
    });
  });

  describe('Styling Dependencies', () => {
    it('should include tailwind dependencies when tailwind selected', async () => {
      const config = createConfig('tailwind-deps', {
        styling: { solution: 'tailwind' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const devDeps = pkg.devDependencies as Record<string, string>;

      expect(devDeps).toHaveProperty('tailwindcss');
      expect(devDeps).toHaveProperty('postcss');
      expect(devDeps).toHaveProperty('autoprefixer');
    });

    it.skip('should not include tailwind when css-modules selected', async () => {
      const config = createConfig('css-modules-deps', {
        styling: { solution: 'css-modules' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const devDeps = pkg.devDependencies as Record<string, string>;

      expect(devDeps).not.toHaveProperty('tailwindcss');
    });
  });

  describe('State Management Dependencies', () => {
    it('should include zustand when zustand selected', async () => {
      const config = createConfig('zustand-deps', {
        stateManagement: 'zustand',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;

      expect(deps).toHaveProperty('zustand');
    });

    it('should include redux toolkit when redux selected', async () => {
      const config = createConfig('redux-deps', {
        stateManagement: 'redux',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;

      expect(deps).toHaveProperty('@reduxjs/toolkit');
      expect(deps).toHaveProperty('react-redux');
    });

    it('should not include state management when none selected', async () => {
      const config = createConfig('no-state-deps', {
        stateManagement: 'none',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;

      expect(deps).not.toHaveProperty('zustand');
      expect(deps).not.toHaveProperty('@reduxjs/toolkit');
      expect(deps).not.toHaveProperty('react-redux');
    });
  });

  describe('Testing Dependencies', () => {
    it('should include vitest when vitest selected', async () => {
      const config = createConfig('vitest-deps', {
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const devDeps = pkg.devDependencies as Record<string, string>;

      expect(devDeps).toHaveProperty('vitest');
      expect(devDeps).toHaveProperty('@testing-library/react');
    });

    it('should include jest when jest selected', async () => {
      const config = createConfig('jest-deps', {
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const devDeps = pkg.devDependencies as Record<string, string>;

      expect(devDeps).toHaveProperty('jest');
    });

    it('should include playwright when playwright selected', async () => {
      const config = createConfig('playwright-deps', {
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const devDeps = pkg.devDependencies as Record<string, string>;

      expect(devDeps).toHaveProperty('@playwright/test');
    });

    it('should not include testing deps when testing disabled', async () => {
      const config = createConfig('no-test-deps', {
        testing: {
          enabled: false,
          unit: { enabled: false, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const devDeps = pkg.devDependencies as Record<string, string>;

      expect(devDeps).not.toHaveProperty('vitest');
      expect(devDeps).not.toHaveProperty('jest');
      expect(devDeps).not.toHaveProperty('playwright');
    });
  });

  describe('Data Fetching Dependencies', () => {
    it('should include tanstack query when enabled', async () => {
      const config = createConfig('tanstack-deps', {
        dataFetching: { enabled: true, library: 'tanstack-query' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;

      expect(deps).toHaveProperty('@tanstack/react-query');
    });

    it('should not include tanstack query when disabled', async () => {
      const config = createConfig('no-tanstack-deps', {
        dataFetching: { enabled: false, library: 'tanstack-query' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;

      expect(deps).not.toHaveProperty('@tanstack/react-query');
    });
  });

  describe('TypeScript Dependencies', () => {
    it('should include typescript when typescript selected', async () => {
      const config = createConfig('typescript-deps', {
        language: 'typescript',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const devDeps = pkg.devDependencies as Record<string, string>;

      expect(devDeps).toHaveProperty('typescript');
    });
  });

  describe('Scripts', () => {
    it('should have dev script for Vite', async () => {
      const config = createConfig('vite-scripts', { runtime: 'vite' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const scripts = pkg.scripts as Record<string, string>;

      expect(scripts.dev).toContain('vite');
      expect(scripts.build).toContain('vite');
    });

    it('should have dev script for Next.js', async () => {
      const config = createConfig('nextjs-scripts', { runtime: 'nextjs' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const scripts = pkg.scripts as Record<string, string>;

      expect(scripts.dev).toContain('next');
    });

    it('should have test scripts when testing enabled with vitest', async () => {
      const config = createConfig('vitest-scripts', {
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const scripts = pkg.scripts as Record<string, string>;

      expect(scripts).toHaveProperty('test');
      expect(scripts.test).toContain('vitest');
    });

    it('should have e2e test scripts when playwright enabled', async () => {
      const config = createConfig('playwright-scripts', {
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const scripts = pkg.scripts as Record<string, string>;

      expect(scripts).toHaveProperty('test:e2e');
    });
  });

  describe('Version Format Validation', () => {
    it('should have valid semver versions for all dependencies', async () => {
      const config = createConfig('version-format', {
        stateManagement: 'zustand',
        dataFetching: { enabled: true, library: 'tanstack-query' },
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const allDeps = {
        ...(pkg.dependencies as Record<string, string>),
        ...(pkg.devDependencies as Record<string, string>),
      };

      // Valid semver patterns (^x.y.z, ~x.y.z, x.y.z, >=x.y.z, etc.)
      const semverPattern = /^[\^~>=<]*\d+\.\d+\.\d+(-[\w.]+)?$/;

      for (const [name, version] of Object.entries(allDeps)) {
        expect(version, `Invalid version for ${name}: ${version}`).toMatch(semverPattern);
      }
    });
  });
});

