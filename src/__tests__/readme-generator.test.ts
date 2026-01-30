import { describe, expect, it } from 'vitest';
import { generateReadme } from '../docs/readme-generator';
import { DEFAULT_CONFIG, type ProjectConfig } from '../config/schema';

describe('generateReadme', () => {
  const createConfig = (overrides: Partial<ProjectConfig> = {}): ProjectConfig => ({
    ...DEFAULT_CONFIG,
    name: 'test-app',
    path: './test-app',
    ...overrides,
  });

  describe('basic structure', () => {
    it('should include project name as title', () => {
      const config = createConfig({ name: 'my-awesome-app' });
      const readme = generateReadme(config);

      expect(readme).toContain('# my-awesome-app');
    });

    it('should include getting started section', () => {
      const readme = generateReadme(createConfig());

      expect(readme).toContain('## Getting Started');
      expect(readme).toContain('## Prerequisites');
      expect(readme).toContain('## Available Scripts');
    });

    it('should include project structure section', () => {
      const readme = generateReadme(createConfig());

      expect(readme).toContain('## Project Structure');
      expect(readme).toContain('src/');
      expect(readme).toContain('components/');
    });

    it('should include tech stack section', () => {
      const readme = generateReadme(createConfig());

      expect(readme).toContain('## Tech Stack');
    });

    it('should include documentation links', () => {
      const readme = generateReadme(createConfig());

      expect(readme).toContain('## Documentation');
    });
  });

  describe('badges', () => {
    it('should include Vite badge for Vite runtime', () => {
      const config = createConfig({ runtime: 'vite' });
      const readme = generateReadme(config);

      expect(readme).toContain('Vite');
      expect(readme).toContain('img.shields.io/badge');
    });

    it('should include Next.js badge for Next.js runtime', () => {
      const config = createConfig({ runtime: 'nextjs' });
      const readme = generateReadme(config);

      expect(readme).toContain('Next.js');
    });

    it('should include TypeScript badge when using TypeScript', () => {
      const config = createConfig({ language: 'typescript' });
      const readme = generateReadme(config);

      expect(readme).toContain('TypeScript');
    });

    it('should include styling badge', () => {
      const config = createConfig({ styling: { solution: 'tailwind' } });
      const readme = generateReadme(config);

      expect(readme).toContain('Tailwind');
    });

    it('should include state management badge when not none', () => {
      const config = createConfig({ stateManagement: 'zustand' });
      const readme = generateReadme(config);

      expect(readme).toContain('Zustand');
    });

    it('should include jotai badge when using jotai', () => {
      const config = createConfig({ stateManagement: 'jotai' });
      const readme = generateReadme(config);

      expect(readme).toContain('Jotai');
    });

    it('should include TanStack Query badge when data fetching enabled', () => {
      const config = createConfig({ dataFetching: { enabled: true, library: 'tanstack-query' } });
      const readme = generateReadme(config);

      expect(readme).toContain('TanStack');
    });
  });

  describe('package manager commands', () => {
    it('should use npm commands for npm package manager', () => {
      const config = createConfig({ packageManager: 'npm' });
      const readme = generateReadme(config);

      expect(readme).toContain('npm install');
      expect(readme).toContain('npm run dev');
    });

    it('should use yarn commands for yarn package manager', () => {
      const config = createConfig({ packageManager: 'yarn' });
      const readme = generateReadme(config);

      expect(readme).toContain('yarn');
      expect(readme).toContain('yarn dev');
    });

    it('should use pnpm commands for pnpm package manager', () => {
      const config = createConfig({ packageManager: 'pnpm' });
      const readme = generateReadme(config);

      expect(readme).toContain('pnpm install');
      expect(readme).toContain('pnpm dev');
    });
  });

  describe('runtime-specific content', () => {
    it('should show correct port for Vite (5173)', () => {
      const config = createConfig({ runtime: 'vite' });
      const readme = generateReadme(config);

      expect(readme).toContain('localhost:5173');
    });

    it('should show correct port for Next.js (3000)', () => {
      const config = createConfig({ runtime: 'nextjs' });
      const readme = generateReadme(config);

      expect(readme).toContain('localhost:3000');
    });

    it('should include Vite documentation link for Vite projects', () => {
      const config = createConfig({ runtime: 'vite' });
      const readme = generateReadme(config);

      expect(readme).toContain('vitejs.dev');
    });

    it('should include Next.js documentation link for Next.js projects', () => {
      const config = createConfig({ runtime: 'nextjs' });
      const readme = generateReadme(config);

      expect(readme).toContain('nextjs.org');
    });
  });

  describe('testing scripts', () => {
    it('should include test scripts when testing is enabled', () => {
      const config = createConfig({
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: true, runner: 'playwright' },
        },
      });
      const readme = generateReadme(config);

      expect(readme).toContain('test');
      expect(readme).toContain('test:watch');
      expect(readme).toContain('test:e2e');
    });

    it('should not include e2e scripts when e2e is disabled', () => {
      const config = createConfig({
        testing: {
          enabled: true,
          unit: { enabled: true, runner: 'vitest' },
          component: { enabled: true, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      });
      const readme = generateReadme(config);

      expect(readme).toContain('test');
      expect(readme).not.toContain('test:e2e');
    });
  });

  describe('styling options', () => {
    it('should include styled-components documentation link', () => {
      const config = createConfig({ styling: { solution: 'styled-components' } });
      const readme = generateReadme(config);

      expect(readme).toContain('styled-components.com');
    });

    it('should handle none styling option', () => {
      const config = createConfig({ styling: { solution: 'none' } });
      const readme = generateReadme(config);

      expect(readme).toContain('none');
    });

    it('should include Tailwind documentation link', () => {
      const config = createConfig({ styling: { solution: 'tailwind' } });
      const readme = generateReadme(config);

      expect(readme).toContain('tailwindcss.com');
    });
  });

  describe('state management documentation links', () => {
    it('should include Redux Toolkit documentation link', () => {
      const config = createConfig({ stateManagement: 'redux' });
      const readme = generateReadme(config);

      expect(readme).toContain('redux-toolkit.js.org');
    });

    it('should include Zustand documentation link', () => {
      const config = createConfig({ stateManagement: 'zustand' });
      const readme = generateReadme(config);

      expect(readme).toContain('zustand-demo.pmnd.rs');
    });

    it('should include Jotai documentation link', () => {
      const config = createConfig({ stateManagement: 'jotai' });
      const readme = generateReadme(config);

      expect(readme).toContain('jotai.org');
    });
  });
});

