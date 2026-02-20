import { existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';
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
  return join(tmpdir(), `react-setup-build-${name}-${Date.now()}`);
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

describe('Build Verification Tests', () => {
  const projectPaths: string[] = [];

  afterEach(() => {
    projectPaths.forEach(cleanupProject);
    projectPaths.length = 0;
  });

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
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000, // 2 minutes
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Next.js project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 180000, // 3 minutes
      });
      expect(buildResult.exitCode).toBe(0);

      // Verify build output exists
      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 360000); // 6 minute timeout for entire test

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
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Next.js + Tailwind project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 180000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 360000);

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
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Next.js + Zustand project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 180000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 360000);
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
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Vite project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(buildResult.exitCode).toBe(0);

      // Verify build output exists
      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 300000); // 5 minute timeout

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
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Vite + Tailwind project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 300000);

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
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Vite full stack project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 300000);
  });
});

