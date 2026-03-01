import { execa } from 'execa';
import { existsSync, mkdirSync, realpathSync, rmSync } from 'fs';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { ProjectConfig } from '../../config/schema.js';
import { ProjectGenerator } from '../../generator/index.js';

/**
 * Styling Solutions Verification Tests
 * Tests that all styling solutions work correctly in generated projects
 */

function getTempProjectPath(name: string): string {
  const baseDir = join(process.cwd(), '.tmp-test-projects');
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }
  return join(
    baseDir,
    `react-setup-styling-${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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

describe('Styling Solutions Verification', () => {
  const projectPaths: string[] = [];

  afterEach(() => {
    projectPaths.forEach(cleanupProject);
    projectPaths.length = 0;
  }, TEST_HOOK_TIMEOUT_MS);

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
      const installResult = await installDependencies(config.path);
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Styled Components project...');
      const buildResult = await buildProject(config.path);
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, 'dist'))).toBe(true);
    }, 600000);
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
      const installResult = await installDependencies(config.path);
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building Tailwind project...');
      const buildResult = await buildProject(config.path);
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 720000);
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
      const installResult = await installDependencies(config.path);
      expect(installResult.exitCode).toBe(0);

      // Build the project
      console.log('Building None styling project...');
      const buildResult = await buildProject(config.path);
      expect(buildResult.exitCode).toBe(0);

      expect(existsSync(join(config.path, '.next'))).toBe(true);
    }, 720000);
  });
});
