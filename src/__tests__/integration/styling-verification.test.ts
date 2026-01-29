import { existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { execa } from 'execa';
import { ProjectConfig } from '../../config/schema.js';
import { ProjectGenerator } from '../../generator/index.js';

/**
 * Styling Solutions Verification Tests
 * Tests that all styling solutions work correctly in generated projects
 */

function getTempProjectPath(name: string): string {
  return join(tmpdir(), `react-setup-styling-${name}-${Date.now()}`);
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

describe('Styling Solutions Verification', () => {
  const projectPaths: string[] = [];

  afterEach(() => {
    projectPaths.forEach(cleanupProject);
    projectPaths.length = 0;
  });

  describe('Plain CSS', () => {
    it('should generate and build with plain CSS', async () => {
      const config = createConfig('css-plain', {
        runtime: 'vite',
        styling: { solution: 'css' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for plain CSS project...');
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building plain CSS project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 300000);
  });

  describe.skip('CSS Modules', () => {
    it('should generate and build with CSS Modules', async () => {
      const config = createConfig('css-modules', {
        runtime: 'vite',
        styling: { solution: 'css-modules' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(existsSync(join(config.path, 'src/components/ui/Button.module.css'))).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for CSS Modules project...');
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building CSS Modules project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 300000);
  });

  describe.skip('Styled Components', () => {
    it('should generate and build with Styled Components (Vite)', async () => {
      const config = createConfig('styled-vite', {
        runtime: 'vite',
        styling: { solution: 'styled-components' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(existsSync(join(config.path, 'src/styles/globals.ts'))).toBe(true);
      expect(existsSync(join(config.path, 'src/components/ui/Button.styled.ts'))).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for Styled Components project...');
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Styled Components project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 300000);

    it('should generate and build with Styled Components (Next.js)', async () => {
      const config = createConfig('styled-nextjs', {
        runtime: 'nextjs',
        styling: { solution: 'styled-components' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(existsSync(join(config.path, 'src/styles/globals.ts'))).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for Next.js + Styled Components...');
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Next.js + Styled Components...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 180000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 360000);
  });

  describe('Tailwind CSS', () => {
    it('should generate and build with Tailwind', async () => {
      const config = createConfig('tailwind', {
        runtime: 'vite',
        styling: { solution: 'tailwind' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);
      expect(existsSync(join(config.path, 'tailwind.config.js'))).toBe(true);
      expect(existsSync(join(config.path, 'postcss.config.js'))).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for Tailwind project...');
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Tailwind project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 300000);
  });
});

