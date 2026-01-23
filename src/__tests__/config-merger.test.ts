import { describe, expect, it } from 'vitest';
import { ConfigMerger } from '../assembler/merger';

describe('ConfigMerger', () => {
  it('should deep merge objects', () => {
    const merged = ConfigMerger.merge({ a: { b: 1 } }, { a: { c: 2 } });

    expect(merged).toEqual({ a: { b: 1, c: 2 } });
  });

  it('should concatenate arrays', () => {
    const merged = ConfigMerger.merge({ scripts: ['a', 'b'] }, { scripts: ['c'] });

    expect((merged.scripts as unknown[]).length).toBe(3);
  });

  it('should merge package.json files correctly', () => {
    const pkg1 = {
      name: 'app',
      version: '1.0.0',
      dependencies: { react: '^18.0.0' },
      scripts: { start: 'react-scripts start' },
    };

    const pkg2 = {
      dependencies: { 'react-dom': '^18.0.0' },
      scripts: { test: 'vitest' },
    };

    const merged = ConfigMerger.mergePackageJson(pkg1, pkg2);

    expect(merged.dependencies as Record<string, unknown>).toHaveProperty('react');
    expect(merged.dependencies as Record<string, unknown>).toHaveProperty('react-dom');
    expect(merged.scripts as Record<string, unknown>).toHaveProperty('start');
    expect(merged.scripts as Record<string, unknown>).toHaveProperty('test');
  });

  it('should handle primitive values with last-write-wins', () => {
    const merged = ConfigMerger.mergePackageJson(
      { name: 'app1', version: '1.0.0' },
      { version: '2.0.0' }
    );

    expect(merged.version).toBe('2.0.0');
    expect(merged.name).toBe('app1');
  });

  it('should deduplicate array values', () => {
    const merged = ConfigMerger.mergePackageJson(
      { keywords: ['react', 'app'] },
      { keywords: ['react', 'cli'] }
    );

    const keywords = merged.keywords as unknown[];
    expect(keywords.length).toBe(3);
    expect(keywords).toContain('react');
  });
});
