import { existsSync, mkdirSync, realpathSync, rmSync } from 'fs';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { execa } from 'execa';
import { ProjectConfig } from '../../config/schema.js';
import { ProjectGenerator } from '../../generator/index.js';

/**
 * Build Verification Tests
 * These tests actually run npm install and npm build on generated projects
 * to ensure they can be built and run successfully.
 */

function getTempProjectPath(name: string): string {
  const baseDir = join(process.cwd(), '.tmp-test-projects');
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }
  return join(
    baseDir,
    `react-setup-build-${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}

function cleanupProject(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
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

const NPM_INSTALL_TIMEOUT_MS = Number(process.env.CRF_NPM_INSTALL_TIMEOUT_MS ?? 600000);
const NPM_BUILD_TIMEOUT_MS = Number(process.env.CRF_NPM_BUILD_TIMEOUT_MS ?? 600000);
const TEST_HOOK_TIMEOUT_MS = Number(process.env.CRF_TEST_HOOK_TIMEOUT_MS ?? 300000);

async function installDependencies(projectPath: string) {
  return execa('npm', ['install', '--no-audit', '--no-fund'], {
    cwd: getCommandCwd(projectPath),
    timeout: NPM_INSTALL_TIMEOUT_MS,
  });
}

async function buildProject(projectPath: string) {
  return execa('npm', ['run', 'build'], {
    cwd: getCommandCwd(projectPath),
    timeout: NPM_BUILD_TIMEOUT_MS,
  });
}

function getCommandCwd(projectPath: string): string {
  try {
    return realpathSync(projectPath);
  } catch {
    return projectPath;
  }
}

describe('Build Verification Tests', () => {
  const projectPaths: string[] = [];

  afterEach(() => {
    projectPaths.forEach(cleanupProject);
    projectPaths.length = 0;
  }, TEST_HOOK_TIMEOUT_MS);

  describe('Next.js Projects', () => {
    it('should generate and build a minimal Next.js project', async () => {
      const config = createConfig('nextjs-build-minimal', {
        runtime: 'nextjs',
        styling: { solution: 'none' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(existsSync(join(config.path, 'package.json'))).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for Next.js project...');
      const installResult = await installDependencies(config.path);
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Next.js project...');
      const buildResult = await buildProject(config.path);
      expect(buildResult.exitCode).toBe(0);

      // Verify build output exists
      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 720000); // 12 minute timeout for entire test

    it('should generate and build Next.js with Tailwind', async () => {
      const config = createConfig('nextjs-build-tailwind', {
        runtime: 'nextjs',
        styling: { solution: 'tailwind' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for Next.js + Tailwind project...');
      const installResult = await installDependencies(config.path);
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Next.js + Tailwind project...');
      const buildResult = await buildProject(config.path);
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 720000);

    it('should generate and build Next.js with state management', async () => {
      const config = createConfig('nextjs-build-zustand', {
        runtime: 'nextjs',
        styling: { solution: 'none' },
        stateManagement: 'zustand',
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for Next.js + Zustand project...');
      const installResult = await installDependencies(config.path);
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Next.js + Zustand project...');
      const buildResult = await buildProject(config.path);
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 720000);
  });

  describe('Vite Projects', () => {
    it('should generate and build a minimal Vite project', async () => {
      const config = createConfig('vite-build-minimal', {
        runtime: 'vite',
        styling: { solution: 'styled-components' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(existsSync(join(config.path, 'package.json'))).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for Vite project...');
      const installResult = await installDependencies(config.path);
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Vite project...');
      const buildResult = await buildProject(config.path);
      expect(buildResult.exitCode).toBe(0);

      // Verify build output exists
      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 600000); // 10 minute timeout

    it('should generate and build Vite with Tailwind', async () => {
      const config = createConfig('vite-build-tailwind', {
        runtime: 'vite',
        styling: { solution: 'tailwind' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for Vite + Tailwind project...');
      const installResult = await installDependencies(config.path);
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Vite + Tailwind project...');
      const buildResult = await buildProject(config.path);
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 600000);

    it('should generate and build Vite with full stack (Tailwind + Zustand + TanStack Query)', async () => {
      const config = createConfig('vite-build-full', {
        runtime: 'vite',
        styling: { solution: 'tailwind' },
        stateManagement: 'zustand',
        dataFetching: { enabled: true, library: 'tanstack-query' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for Vite full stack project...');
      const installResult = await installDependencies(config.path);
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Vite full stack project...');
      const buildResult = await buildProject(config.path);
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 600000);
  });
});
