import { describe, expect, it } from 'vitest';
import { generateArchitectureDoc } from '../docs/architecture-generator';
import { DEFAULT_CONFIG, type ProjectConfig } from '../config/schema';

function createConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    ...DEFAULT_CONFIG,
    name: 'test-app',
    path: './test-app',
    ...overrides,
  };
}

describe('generateArchitectureDoc', () => {
  it('should include TypeScript language and types folder for TypeScript projects', () => {
    const doc = generateArchitectureDoc(createConfig({ language: 'typescript' }));

    expect(doc).toContain('- **Language**: TypeScript');
    expect(doc).toContain('├── types/               # TypeScript type definitions');
  });

  it('should include JavaScript language and omit types folder for JavaScript projects', () => {
    const doc = generateArchitectureDoc(createConfig({ language: 'javascript' }));

    expect(doc).toContain('- **Language**: JavaScript');
    expect(doc).not.toContain('├── types/               # TypeScript type definitions');
  });

  it('should include state management folder when state management is enabled', () => {
    const doc = generateArchitectureDoc(createConfig({ stateManagement: 'zustand' }));

    expect(doc).toContain('├── stores/              # State management stores');
  });

  it('should include lib folder when data fetching is enabled', () => {
    const doc = generateArchitectureDoc(
      createConfig({ dataFetching: { enabled: true, library: 'tanstack-query' } })
    );

    expect(doc).toContain('├── lib/                 # Third-party library configs');
  });
});
