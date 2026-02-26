import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ProjectGenerator } from '../generator/index';
import type { ProjectConfig } from '../config/schema';

/**
 * Project Generator Comprehensive Tests
 * Tests project generation for all configuration combinations
 */

function getTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'forge-generator-test-'));
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

describe('ProjectGenerator - Project Generation', () => {
  let generator: ProjectGenerator;
  let config: ProjectConfig;
  let tempDir: string;

  beforeEach(() => {
    tempDir = getTempDir();
    config = createTestConfig({ path: tempDir });
    generator = new ProjectGenerator(config);
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Basic Generation', () => {
    it('should initialize without errors', () => {
      expect(generator).toBeDefined();
    });

    it('should generate project successfully', async () => {
      const result = await generator.generate();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.projectPath).toBe(tempDir);
      expect(result.filesWritten).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should create project directory', async () => {
      await generator.generate();
      expect(existsSync(tempDir)).toBe(true);
    });

    it('should create package.json', async () => {
      await generator.generate();
      const pkgPath = join(tempDir, 'package.json');
      expect(existsSync(pkgPath)).toBe(true);

      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      expect(pkg.name).toBe(config.name);
      expect(pkg.version).toBeDefined();
      expect(pkg.type).toBe('module');
    });

    it('should create .gitignore', async () => {
      await generator.generate();
      const gitignorePath = join(tempDir, '.gitignore');
      expect(existsSync(gitignorePath)).toBe(true);
    });

    it('should create README.md', async () => {
      await generator.generate();
      const readmePath = join(tempDir, 'README.md');
      expect(existsSync(readmePath)).toBe(true);
    });

    it('should create ARCHITECTURE.md', async () => {
      await generator.generate();
      const archPath = join(tempDir, 'ARCHITECTURE.md');
      expect(existsSync(archPath)).toBe(true);
    });
  });

  describe('Runtime Generation', () => {
    it('should generate Vite project', async () => {
      const viteConfig = createTestConfig({
        path: getTempDir(),
        runtime: 'vite',
      });
      const viteGen = new ProjectGenerator(viteConfig);

      const result = await viteGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(viteConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies.vite).toBeDefined();
    });

    it('should generate Next.js project', async () => {
      const nextConfig = createTestConfig({
        path: getTempDir(),
        runtime: 'nextjs',
      });
      const nextGen = new ProjectGenerator(nextConfig);

      const result = await nextGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(nextConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.dependencies.next).toBeDefined();
    });
  });

  describe('Language Generation', () => {
    it('should generate TypeScript project', async () => {
      const tsConfig = createTestConfig({
        path: getTempDir(),
        language: 'typescript',
      });
      const tsGen = new ProjectGenerator(tsConfig);

      const result = await tsGen.generate();
      expect(result.success).toBe(true);

      const tsConfigPath = join(tsConfig.path, 'tsconfig.json');
      expect(existsSync(tsConfigPath)).toBe(true);
    });

    it('should generate JavaScript project', async () => {
      const jsConfig = createTestConfig({
        path: getTempDir(),
        language: 'javascript',
      });
      const jsGen = new ProjectGenerator(jsConfig);

      const result = await jsGen.generate();
      expect(result.success).toBe(true);
    });
  });

  describe('Styling Generation', () => {
    it('should generate Tailwind CSS project', async () => {
      const tailwindConfig = createTestConfig({
        path: getTempDir(),
        styling: { solution: 'tailwind' },
      });
      const tailwindGen = new ProjectGenerator(tailwindConfig);

      const result = await tailwindGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(tailwindConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies.tailwindcss).toBeDefined();
    });

    it('should generate Styled Components project', async () => {
      const styledConfig = createTestConfig({
        path: getTempDir(),
        styling: { solution: 'styled-components' },
      });
      const styledGen = new ProjectGenerator(styledConfig);

      const result = await styledGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(styledConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.dependencies['styled-components']).toBeDefined();
    });

    it('should generate CSS Modules project', async () => {
      const cssModulesConfig = createTestConfig({
        path: getTempDir(),
        styling: { solution: 'css-modules' },
      });
      const cssModulesGen = new ProjectGenerator(cssModulesConfig);

      const result = await cssModulesGen.generate();
      expect(result.success).toBe(true);
    });

    it('should generate Plain CSS project', async () => {
      const cssConfig = createTestConfig({
        path: getTempDir(),
        styling: { solution: 'css' },
      });
      const cssGen = new ProjectGenerator(cssConfig);

      const result = await cssGen.generate();
      expect(result.success).toBe(true);
    });
  });

  describe('Testing Generation', () => {
    it('should generate project with Vitest', async () => {
      const vitestConfig = createTestConfig({
        path: getTempDir(),
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });
      const vitestGen = new ProjectGenerator(vitestConfig);

      const result = await vitestGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(vitestConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies.vitest).toBeDefined();
    });

    it('should generate project with Jest', async () => {
      const jestConfig = createTestConfig({
        path: getTempDir(),
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });
      const jestGen = new ProjectGenerator(jestConfig);

      const result = await jestGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(jestConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies.jest).toBeDefined();
    });

    it('should generate project with Playwright E2E', async () => {
      const playwrightConfig = createTestConfig({
        path: getTempDir(),
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
      });
      const playwrightGen = new ProjectGenerator(playwrightConfig);

      const result = await playwrightGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(playwrightConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies['@playwright/test']).toBeDefined();
    });

    it('should generate project with Cypress E2E', async () => {
      const cypressConfig = createTestConfig({
        path: getTempDir(),
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'jest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'cypress' },
        },
      });
      const cypressGen = new ProjectGenerator(cypressConfig);

      const result = await cypressGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(cypressConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.devDependencies.cypress).toBeDefined();
    });
  });

  describe('State Management Generation', () => {
    it('should generate project with Zustand', async () => {
      const zustandConfig = createTestConfig({
        path: getTempDir(),
        stateManagement: 'zustand',
      });
      const zustandGen = new ProjectGenerator(zustandConfig);

      const result = await zustandGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(zustandConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.dependencies.zustand).toBeDefined();
    });

    it('should generate project with Redux', async () => {
      const reduxConfig = createTestConfig({
        path: getTempDir(),
        stateManagement: 'redux',
      });
      const reduxGen = new ProjectGenerator(reduxConfig);

      const result = await reduxGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(reduxConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.dependencies['@reduxjs/toolkit']).toBeDefined();
    });

    it('should generate project with Jotai', async () => {
      const jotaiConfig = createTestConfig({
        path: getTempDir(),
        stateManagement: 'jotai',
      });
      const jotaiGen = new ProjectGenerator(jotaiConfig);

      const result = await jotaiGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(jotaiConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.dependencies.jotai).toBeDefined();
    });

    it('should generate project without state management', async () => {
      const noneConfig = createTestConfig({
        path: getTempDir(),
        stateManagement: 'none',
      });
      const noneGen = new ProjectGenerator(noneConfig);

      const result = await noneGen.generate();
      expect(result.success).toBe(true);
    });
  });

  describe('Package Manager Generation', () => {
    it('should generate npm project', async () => {
      const npmConfig = createTestConfig({
        path: getTempDir(),
        packageManager: 'npm',
      });
      const npmGen = new ProjectGenerator(npmConfig);

      const result = await npmGen.generate();
      expect(result.success).toBe(true);
    });

    it('should generate yarn project', async () => {
      const yarnConfig = createTestConfig({
        path: getTempDir(),
        packageManager: 'yarn',
      });
      const yarnGen = new ProjectGenerator(yarnConfig);

      const result = await yarnGen.generate();
      expect(result.success).toBe(true);
    });

    it('should generate pnpm project', async () => {
      const pnpmConfig = createTestConfig({
        path: getTempDir(),
        packageManager: 'pnpm',
      });
      const pnpmGen = new ProjectGenerator(pnpmConfig);

      const result = await pnpmGen.generate();
      expect(result.success).toBe(true);
    });
  });

  describe('Data Fetching Generation', () => {
    it('should generate project with TanStack Query', async () => {
      const queryConfig = createTestConfig({
        path: getTempDir(),
        dataFetching: { enabled: true, library: 'tanstack-query' },
      });
      const queryGen = new ProjectGenerator(queryConfig);

      const result = await queryGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(queryConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.dependencies['@tanstack/react-query']).toBeDefined();
    });

    it('should generate project without data fetching', async () => {
      const noQueryConfig = createTestConfig({
        path: getTempDir(),
        dataFetching: { enabled: false, library: 'tanstack-query' },
      });
      const noQueryGen = new ProjectGenerator(noQueryConfig);

      const result = await noQueryGen.generate();
      expect(result.success).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should generate complete Vite + TypeScript + Tailwind + Zustand + Full Testing setup', async () => {
      const complexConfig = createTestConfig({
        path: getTempDir(),
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
      });
      const complexGen = new ProjectGenerator(complexConfig);

      const result = await complexGen.generate();
      expect(result.success).toBe(true);
      expect(result.filesWritten).toBeGreaterThan(10);

      const pkg = JSON.parse(readFileSync(join(complexConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.dependencies.zustand).toBeDefined();
      expect(pkg.devDependencies.vitest).toBeDefined();
      expect(pkg.devDependencies['@playwright/test']).toBeDefined();
      expect(pkg.dependencies['@tanstack/react-query']).toBeDefined();
    });

    it('should generate minimal Next.js + JavaScript setup', async () => {
      const minimalConfig = createTestConfig({
        path: getTempDir(),
        runtime: 'nextjs',
        language: 'javascript',
        styling: { solution: 'css' },
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
      const minimalGen = new ProjectGenerator(minimalConfig);

      const result = await minimalGen.generate();
      expect(result.success).toBe(true);

      const pkg = JSON.parse(readFileSync(join(minimalConfig.path, 'package.json'), 'utf-8'));
      expect(pkg.dependencies.next).toBeDefined();
    });
  });

  describe('Generation Results', () => {
    it('should return files count', async () => {
      const result = await generator.generate();
      expect(result.filesWritten).toBeGreaterThan(0);
      expect(typeof result.filesWritten).toBe('number');
    });

    it('should return success status', async () => {
      const result = await generator.generate();
      expect(result.success).toBe(true);
      expect(typeof result.success).toBe('boolean');
    });

    it('should include project path in result', async () => {
      const result = await generator.generate();
      expect(result.projectPath).toBe(tempDir);
    });

    it('should have empty errors on success', async () => {
      const result = await generator.generate();
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid consecutive generations', async () => {
      const result1 = await generator.generate();
      expect(result1.success).toBe(true);

      // Generate another in different directory
      const config2 = createTestConfig({ path: getTempDir() });
      const generator2 = new ProjectGenerator(config2);
      const result2 = await generator2.generate();
      expect(result2.success).toBe(true);
    });

    it('should create valid package.json structure', async () => {
      await generator.generate();
      const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8'));

      expect(pkg.name).toBeDefined();
      expect(pkg.version).toBeDefined();
      expect(pkg.type).toBe('module');
      expect(pkg.scripts).toBeDefined();
      expect(typeof pkg.scripts).toBe('object');
    });
  });
});
