import { describe, expect, it, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ProjectGenerator } from '../../generator/index.js';
import { ProjectConfig } from '../../config/schema.js';

/**
 * Scenario-based integration tests
 * Tests common real-world configuration combinations
 */

function getTempProjectPath(name: string): string {
  return join(tmpdir(), `react-setup-scenario-${name}-${Date.now()}`);
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

function readFile(projectPath: string, relativePath: string): string {
  return readFileSync(join(projectPath, relativePath), 'utf-8');
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  
  if (!existsSync(dir)) return files;
  
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = fullPath.replace(baseDir + '/', '');
    
    if (statSync(fullPath).isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

function createConfig(name: string, overrides: Partial<ProjectConfig>): ProjectConfig {
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

describe('Real-World Scenarios', () => {
  const projectPaths: string[] = [];

  afterEach(() => {
    projectPaths.forEach(cleanupProject);
    projectPaths.length = 0;
  });

  describe('Scenario: Minimal SPA (Learning/Prototyping)', () => {
    it('should generate minimal Vite + CSS project', async () => {
      const config = createConfig('minimal-spa', {
        runtime: 'vite',
        styling: { solution: 'css' },
        stateManagement: 'none',
        dataFetching: { enabled: false, library: 'tanstack-query' },
        testing: {
          enabled: false,
          unit: { enabled: false, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
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

      // Should have minimal deps
      expect(deps).toHaveProperty('react');
      expect(deps).toHaveProperty('react-dom');
      expect(devDeps).toHaveProperty('vite');
      
      // Should NOT have optional deps
      expect(deps).not.toHaveProperty('zustand');
      expect(deps).not.toHaveProperty('@tanstack/react-query');
      expect(devDeps).not.toHaveProperty('vitest');
      expect(devDeps).not.toHaveProperty('tailwindcss');
    });
  });

  describe('Scenario: Production SPA (Full Stack)', () => {
    it('should generate Vite + Tailwind + Zustand + TanStack Query + Full Testing', async () => {
      const config = createConfig('production-spa', {
        runtime: 'vite',
        styling: { solution: 'tailwind' },
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
      const result = await generator.generate();

      expect(result.success).toBe(true);

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;
      const devDeps = pkg.devDependencies as Record<string, string>;
      const scripts = pkg.scripts as Record<string, string>;

      // Core deps
      expect(deps).toHaveProperty('react');
      expect(deps).toHaveProperty('react-dom');
      expect(deps).toHaveProperty('react-router-dom');

      // State management
      expect(deps).toHaveProperty('zustand');

      // Data fetching
      expect(deps).toHaveProperty('@tanstack/react-query');

      // Styling
      expect(devDeps).toHaveProperty('tailwindcss');
      expect(devDeps).toHaveProperty('postcss');
      expect(devDeps).toHaveProperty('autoprefixer');

      // Testing
      expect(devDeps).toHaveProperty('vitest');
      expect(devDeps).toHaveProperty('@testing-library/react');
      expect(devDeps).toHaveProperty('@playwright/test');

      // Scripts
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('test');
      expect(scripts).toHaveProperty('test:e2e');

      // File structure
      expect(existsSync(join(config.path, 'tailwind.config.js'))).toBe(true);
      expect(existsSync(join(config.path, 'vitest.config.ts'))).toBe(true);
      expect(existsSync(join(config.path, 'playwright.config.ts'))).toBe(true);
      expect(existsSync(join(config.path, 'src/stores'))).toBe(true);
    });
  });

  describe('Scenario: Enterprise App (Redux + Full Testing)', () => {
    it('should generate Vite + Tailwind + Redux + Full Testing', async () => {
      const config = createConfig('enterprise-app', {
        runtime: 'vite',
        styling: { solution: 'tailwind' },
        stateManagement: 'redux',
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
      const result = await generator.generate();

      expect(result.success).toBe(true);

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;

      // Redux deps
      expect(deps).toHaveProperty('@reduxjs/toolkit');
      expect(deps).toHaveProperty('react-redux');

      // Redux store structure
      expect(existsSync(join(config.path, 'src/stores'))).toBe(true);
    });
  });

  describe('Scenario: Next.js Full-Stack App', () => {
    it('should generate Next.js + Tailwind + Zustand + TanStack Query', async () => {
      const config = createConfig('nextjs-fullstack', {
        runtime: 'nextjs',
        styling: { solution: 'tailwind' },
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
      const result = await generator.generate();

      expect(result.success).toBe(true);

      const pkg = readGeneratedPackageJson(config.path);
      const deps = pkg.dependencies as Record<string, string>;

      // Next.js deps
      expect(deps).toHaveProperty('next');
      expect(deps).toHaveProperty('react');
      expect(deps).toHaveProperty('react-dom');

      // Next.js files
      expect(existsSync(join(config.path, 'next.config.js'))).toBe(true);
      expect(existsSync(join(config.path, 'src/app'))).toBe(true);
    });
  });

  describe('Scenario: Next.js with Redux', () => {
    it('should generate Next.js + CSS Modules + Redux', async () => {
      const config = createConfig('nextjs-redux', {
        runtime: 'nextjs',
        styling: { solution: 'css-modules' },
        stateManagement: 'redux',
        dataFetching: { enabled: false, library: 'tanstack-query' },
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

      // Next.js + Redux
      expect(deps).toHaveProperty('next');
      expect(deps).toHaveProperty('@reduxjs/toolkit');
      expect(deps).toHaveProperty('react-redux');

      // No Tailwind
      expect(devDeps).not.toHaveProperty('tailwindcss');
    });
  });

  describe('Scenario: Jest-based Testing Setup', () => {
    it('should generate project with Jest instead of Vitest', async () => {
      const config = createConfig('jest-project', {
        runtime: 'vite',
        styling: { solution: 'tailwind' },
        stateManagement: 'none',
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
      const scripts = pkg.scripts as Record<string, string>;

      // Jest deps (not Vitest)
      expect(devDeps).toHaveProperty('jest');
      expect(scripts.test).toContain('jest');

      // Jest config file
      expect(existsSync(join(config.path, 'jest.config.js'))).toBe(true);
    });
  });

  describe('Scenario: Unit Testing Only (No E2E)', () => {
    it('should generate project with unit tests but no E2E', async () => {
      const config = createConfig('unit-only', {
        runtime: 'vite',
        styling: { solution: 'tailwind' },
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
      const devDeps = pkg.devDependencies as Record<string, string>;
      const scripts = pkg.scripts as Record<string, string>;

      // Has unit testing
      expect(devDeps).toHaveProperty('vitest');
      expect(devDeps).toHaveProperty('@testing-library/react');

      // No E2E
      expect(devDeps).not.toHaveProperty('playwright');
      expect(devDeps).not.toHaveProperty('@playwright/test');
      expect(scripts).not.toHaveProperty('test:e2e');
      expect(existsSync(join(config.path, 'playwright.config.ts'))).toBe(false);
    });
  });

  describe('File Content Validation', () => {
    it('should have valid vite.config.ts for Vite projects', async () => {
      const config = createConfig('vite-config-check', {
        runtime: 'vite',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const viteConfig = readFile(config.path, 'vite.config.ts');
      
      expect(viteConfig).toContain('import');
      expect(viteConfig).toContain('defineConfig');
      expect(viteConfig).toContain('react');
    });

    it('should have valid next.config.js for Next.js projects', async () => {
      const config = createConfig('next-config-check', {
        runtime: 'nextjs',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const nextConfig = readFile(config.path, 'next.config.js');
      
      expect(nextConfig).toContain('nextConfig');
    });

    it('should have valid tailwind.config.js when tailwind selected', async () => {
      const config = createConfig('tailwind-config-check', {
        styling: { solution: 'tailwind' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const tailwindConfig = readFile(config.path, 'tailwind.config.js');
      
      expect(tailwindConfig).toContain('content');
      expect(tailwindConfig).toContain('theme');
    });

    it('should have valid vitest.config.ts when vitest selected', async () => {
      const config = createConfig('vitest-config-check', {
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

      const vitestConfig = readFile(config.path, 'vitest.config.ts');
      
      expect(vitestConfig).toContain('defineConfig');
      expect(vitestConfig).toContain('test');
    });

    it('should have valid playwright.config.ts when playwright selected', async () => {
      const config = createConfig('pw-config-check', {
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

      const pwConfig = readFile(config.path, 'playwright.config.ts');
      
      expect(pwConfig).toContain('defineConfig');
      expect(pwConfig).toContain('projects');
    });

    it('should substitute project name in package.json', async () => {
      const config = createConfig('name-substitution', {});
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      const pkg = readGeneratedPackageJson(config.path);
      expect(pkg.name).toBe('name-substitution');
    });
  });

  describe('TypeScript Configuration', () => {
    it('should include tsconfig.json for TypeScript projects', async () => {
      const config = createConfig('ts-config', {
        language: 'typescript',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      await generator.generate();

      expect(existsSync(join(config.path, 'tsconfig.json'))).toBe(true);
      
      // tsconfig.json may contain comments, so check content as string
      const tsConfigContent = readFile(config.path, 'tsconfig.json');
      expect(tsConfigContent).toContain('compilerOptions');
      expect(tsConfigContent).toContain('target');
    });

    it('should have TypeScript as devDependency', async () => {
      const config = createConfig('ts-dep', {
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

  describe('No Conflicts Between Templates', () => {
    it('should not have conflicting scripts when multiple templates loaded', async () => {
      const config = createConfig('no-conflicts', {
        runtime: 'vite',
        styling: { solution: 'tailwind' },
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
      const result = await generator.generate();

      expect(result.success).toBe(true);

      const pkg = readGeneratedPackageJson(config.path);
      const scripts = pkg.scripts as Record<string, string>;

      // All scripts should be defined (not empty or undefined)
      for (const [name, command] of Object.entries(scripts)) {
        expect(command, `Script ${name} should not be empty`).toBeTruthy();
        expect(typeof command, `Script ${name} should be a string`).toBe('string');
      }
    });

    it('should not have duplicate dependencies', async () => {
      const config = createConfig('no-dupes', {
        runtime: 'vite',
        styling: { solution: 'tailwind' },
        stateManagement: 'redux',
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
      const deps = Object.keys(pkg.dependencies as Record<string, string>);
      const devDeps = Object.keys(pkg.devDependencies as Record<string, string>);

      // Check no package appears in both deps and devDeps
      const overlap = deps.filter(d => devDeps.includes(d));
      expect(overlap, 'Packages should not appear in both deps and devDeps').toHaveLength(0);
    });
  });
});

