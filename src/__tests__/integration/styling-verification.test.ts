import { execa } from 'execa';
import { existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
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
    styling: { solution: 'styled-components' },
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

  describe('Styled Components (Vite)', () => {
    it('should generate project with Styled Components file structure', async () => {
      const config = createConfig('styled-vite-structure', {
        runtime: 'vite',
        styling: { solution: 'styled-components' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Verify Styled Components files exist
      expect(existsSync(join(config.path, 'src/styles/globals.ts'))).toBe(true);
      expect(existsSync(join(config.path, 'src/components/ui/Button.styled.ts'))).toBe(true);
      expect(existsSync(join(config.path, 'src/app/provider.tsx'))).toBe(true);
      expect(existsSync(join(config.path, 'src/main.tsx'))).toBe(true);
    }, 60000);

    it('should generate and build with Styled Components', async () => {
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
  });

  describe('Tailwind CSS (Next.js)', () => {
    it('should generate and build with Tailwind', async () => {
      const config = createConfig('tailwind-nextjs', {
        runtime: 'nextjs',
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
        timeout: 180000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 360000);
  });

  describe('None Styling (Next.js)', () => {
    it('should generate project with no styling framework', async () => {
      const config = createConfig('none-nextjs-structure', {
        runtime: 'nextjs',
        styling: { solution: 'none' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Verify no Tailwind config files
      expect(existsSync(join(config.path, 'tailwind.config.js'))).toBe(false);
      expect(existsSync(join(config.path, 'postcss.config.js'))).toBe(false);

      // Verify base files exist
      expect(existsSync(join(config.path, 'src/app/page.tsx'))).toBe(true);
      expect(existsSync(join(config.path, 'src/styles/globals.css'))).toBe(true);
    }, 60000);

    it('should generate and build with no styling framework', async () => {
      const config = createConfig('none-nextjs', {
        runtime: 'nextjs',
        styling: { solution: 'none' },
      });
      projectPaths.push(config.path);

      const generator = new ProjectGenerator(config);
      const result = await generator.generate();

      expect(result.success).toBe(true);

      // Install dependencies
      console.log('Installing dependencies for None styling project...');
      const installResult = await execa('npm', ['install'], {
        cwd: config.path,
        timeout: 120000,
      });
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building None styling project...');
      const buildResult = await execa('npm', ['run', 'build'], {
        cwd: config.path,
        timeout: 180000,
      });
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 360000);
  });
});
