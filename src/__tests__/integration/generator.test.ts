import { existsSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { ProjectConfig } from '../../config/schema.js';
import { ProjectGenerator } from '../../generator/index.js';

/**
 * Integration tests for project generation flow
 * Tests that different configuration combinations generate valid projects
 */

// Helper to create a unique temp directory path
function getTempProjectPath(name: string): string {
  return join(tmpdir(), `react-setup-test-${name}-${Date.now()}`);
}

// Helper to clean up test directories
function cleanupProject(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

// Helper to read package.json from generated project
function readGeneratedPackageJson(projectPath: string): Record<string, unknown> {
  const pkgPath = join(projectPath, 'package.json');
  const content = readFileSync(pkgPath, 'utf-8');
  return JSON.parse(content);
}

// Base config factory
function createBaseConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  const projectName = overrides.name || 'test-project';
  const basePath = overrides.path || getTempProjectPath(projectName);
  return {
    name: projectName,
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

describe('ProjectGenerator Integration', () => {
  const projectPaths: string[] = [];

  afterEach(() => {
    // Clean up all created projects
    projectPaths.forEach(cleanupProject);
    projectPaths.length = 0;
  });

  describe('Basic Generation', () => {
    it('should generate a minimal Vite project', async () => {
      const config = createBaseConfig({ name: 'minimal-vite' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.filesWritten).toBeGreaterThan(0);
      expect(existsSync(config.path)).toBe(true);
      expect(existsSync(join(config.path, 'package.json'))).toBe(true);
    });

    it('should generate a minimal Next.js project', async () => {
      const config = createBaseConfig({ 
        name: 'minimal-nextjs',
        runtime: 'nextjs' 
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(existsSync(join(config.path, 'package.json'))).toBe(true);
    });
  });

  describe('Package.json Validation', () => {
    it('should generate valid JSON in package.json', async () => {
      const config = createBaseConfig({ name: 'pkg-json-test' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      // Should not throw when parsing
      expect(() => readGeneratedPackageJson(config.path)).not.toThrow();
    });

    it('should include correct project name in package.json', async () => {
      const config = createBaseConfig({ name: 'my-custom-app' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      expect(pkg.name).toBe('my-custom-app');
    });

    it('should have sorted dependencies', async () => {
      const config = createBaseConfig({ 
        name: 'sorted-deps',
        dataFetching: { enabled: true, library: 'tanstack-query' }
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const deps = Object.keys(pkg.dependencies as Record<string, string>);
      const sortedDeps = [...deps].sort((a, b) => a.localeCompare(b));
      
      expect(deps).toEqual(sortedDeps);
    });

    it('should include dev and build scripts', async () => {
      const config = createBaseConfig({ name: 'scripts-test' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      const scripts = pkg.scripts as Record<string, string>;
      
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build');
    });
  });

  describe('Configuration Combinations', () => {
    it('should generate Vite + Tailwind + Zustand + Vitest', async () => {
      const config = createBaseConfig({
        name: 'full-vite-stack',
        runtime: 'vite',
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
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      
      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;
      const devDeps = pkg.devDependencies as Record<string, string>;
      
      // Check Zustand
      expect(deps).toHaveProperty('zustand');
      
      // Check TanStack Query
      expect(deps).toHaveProperty('@tanstack/react-query');
      
      // Check Tailwind
      expect(devDeps).toHaveProperty('tailwindcss');
      
      // Check Vitest
      expect(devDeps).toHaveProperty('vitest');
      
      // Check Playwright (uses @playwright/test package)
      expect(devDeps).toHaveProperty('@playwright/test');
    });

    it.skip('should generate Next.js + CSS Modules + Redux', async () => {
      const config = createBaseConfig({
        name: 'nextjs-redux',
        runtime: 'nextjs',
        styling: { solution: 'css-modules' },
        stateManagement: 'redux',
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      
      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;
      const devDeps = pkg.devDependencies as Record<string, string>;
      
      // Check Next.js
      expect(deps).toHaveProperty('next');
      
      // Check Redux
      expect(deps).toHaveProperty('@reduxjs/toolkit');
      expect(deps).toHaveProperty('react-redux');
      
      // Check Vitest
      expect(devDeps).toHaveProperty('vitest');
    });

    it.skip('should generate Vite + Jest + Playwright', async () => {
      const config = createBaseConfig({
        name: 'vite-jest-pw',
        runtime: 'vite',
        styling: { solution: 'css-modules' },
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      
      const pkg = readGeneratedPackageJson(config.path);
      const devDeps = pkg.devDependencies as Record<string, string>;
      
      // Check Jest
      expect(devDeps).toHaveProperty('jest');
      
      // Check Playwright (uses @playwright/test package)
      expect(devDeps).toHaveProperty('@playwright/test');
    });
  });

  describe('File Structure Validation', () => {
    it('should create src directory structure for Vite', async () => {
      const config = createBaseConfig({ name: 'vite-structure' });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      expect(existsSync(join(config.path, 'src'))).toBe(true);
      expect(existsSync(join(config.path, 'vite.config.ts'))).toBe(true);
      expect(existsSync(join(config.path, 'index.html'))).toBe(true);
    });

    it('should create app directory structure for Next.js', async () => {
      const config = createBaseConfig({ 
        name: 'nextjs-structure',
        runtime: 'nextjs' 
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      expect(existsSync(join(config.path, 'src'))).toBe(true);
      expect(existsSync(join(config.path, 'next.config.js'))).toBe(true);
    });

    it('should create tailwind config when tailwind is selected', async () => {
      const config = createBaseConfig({
        name: 'tailwind-files',
        styling: { solution: 'tailwind' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      expect(existsSync(join(config.path, 'tailwind.config.js'))).toBe(true);
      expect(existsSync(join(config.path, 'postcss.config.js'))).toBe(true);
    });

    it('should create vitest config when vitest is selected', async () => {
      const config = createBaseConfig({
        name: 'vitest-files',
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

      expect(existsSync(join(config.path, 'vitest.config.ts'))).toBe(true);
    });

    it('should create playwright config when playwright is selected', async () => {
      const config = createBaseConfig({
        name: 'playwright-files',
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

      expect(existsSync(join(config.path, 'playwright.config.ts'))).toBe(true);
    });

    it('should create store files when zustand is selected', async () => {
      const config = createBaseConfig({
        name: 'zustand-files',
        stateManagement: 'zustand',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      expect(existsSync(join(config.path, 'src', 'stores'))).toBe(true);
    });

    it('should create store files when redux is selected', async () => {
      const config = createBaseConfig({
        name: 'redux-files',
        stateManagement: 'redux',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      expect(existsSync(join(config.path, 'src', 'stores'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should fail if directory already exists', async () => {
      const config = createBaseConfig({ name: 'existing-dir' });
      projectPaths.push(config.path);

      // First generation
      const generator1 = new ProjectGenerator(config);
      await generator1.generate();

      // Second generation should fail
      const generator2 = new ProjectGenerator(config);
      const result = await generator2.generate();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('already exists');
    });
  });
});

