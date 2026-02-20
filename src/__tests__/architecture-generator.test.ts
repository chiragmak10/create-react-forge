import { describe, expect, it } from 'vitest';
import type { ProjectConfig } from '../config/schema';
import { generateArchitectureDoc } from '../docs';

function createConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    name: 'test-app',
    path: '/tmp/test-app',
    runtime: 'vite',
    language: 'typescript',
    styling: { solution: 'tailwind' },
    stateManagement: 'zustand',
    dataFetching: { enabled: true, library: 'tanstack-query' },
    testing: {
      enabled: true,
      unit: { enabled: true, runner: 'vitest' },
      component: { enabled: true, library: 'testing-library' },
      e2e: { enabled: true, runner: 'playwright' },
    },
    linting: { prettier: true },
    packageManager: 'npm',
    git: { init: false, initialCommit: false },
    plugins: [],
    ...overrides,
  };
}

describe('Architecture Generator', () => {
  it('should generate architecture docs for enabled features', () => {
    const doc = generateArchitectureDoc(createConfig());

    expect(doc).toContain('Runtime**: Vite (SPA)');
    expect(doc).toContain('Language**: TypeScript');
    expect(doc).toContain('Styling**: tailwind');
    expect(doc).toContain('State Management**: zustand');
    expect(doc).toContain('Data Fetching**: tanstack-query');
    expect(doc).toContain('Testing**: Enabled');
    expect(doc).toContain('├── lib/                 # Third-party library configs');
    expect(doc).toContain('├── stores/              # State management stores');
    expect(doc).toContain('- **Unit Tests**: vitest');
    expect(doc).toContain('- **E2E Tests**: playwright');
    expect(doc).toContain('We use **tanstack-query** for server state management.');
    expect(doc).toContain('We use **zustand** for global client state.');
  });

  it('should generate architecture docs for disabled features', () => {
    const doc = generateArchitectureDoc(
      createConfig({
        runtime: 'nextjs',
        language: 'javascript',
        styling: { solution: 'none' },
        stateManagement: 'none',
        dataFetching: { enabled: false, library: 'tanstack-query' },
        testing: {
          enabled: false,
          unit: { enabled: false, runner: 'vitest' },
          component: { enabled: false, library: 'testing-library' },
          e2e: { enabled: false, runner: 'none' },
        },
      })
    );

    expect(doc).toContain('Runtime**: Next.js (App Router)');
    expect(doc).toContain('Language**: JavaScript');
    expect(doc).toContain('Styling**: none');
    expect(doc).toContain('Testing**: Disabled');
    expect(doc).not.toContain('├── lib/                 # Third-party library configs');
    expect(doc).not.toContain('├── stores/              # State management stores');
    expect(doc).toContain('Testing is currently disabled.');
    expect(doc).toContain('Standard `fetch` or `axios` is used for data fetching.');
    expect(doc).toContain('Local state (`useState`) is preferred.');
  });
});
