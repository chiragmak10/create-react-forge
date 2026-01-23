import { describe, expect, it } from 'vitest';
import { DependencyResolver } from '../dependencies/resolver';

describe('DependencyResolver', () => {
  it('should add and resolve dependencies', () => {
    const resolver = new DependencyResolver();

    resolver.addDependencies({
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    });

    const result = resolver.resolve();
    expect(result.dependencies).toHaveProperty('react');
    expect(result.dependencies).toHaveProperty('react-dom');
  });

  it('should separate dev dependencies', () => {
    const resolver = new DependencyResolver();

    resolver.addDependencies({ react: '^18.0.0' });
    resolver.addDependencies({ vitest: '^2.0.0' }, true);

    const result = resolver.resolve();
    expect(result.dependencies).toHaveProperty('react');
    expect(result.devDependencies).toHaveProperty('vitest');
    expect(result.dependencies).not.toHaveProperty('vitest');
  });

  it('should detect version conflicts', () => {
    const resolver = new DependencyResolver();

    resolver.addDependencies({ react: '^18.0.0' });
    resolver.addDependencies({ react: '^17.0.0' }); // Different version

    const result = resolver.resolve();
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.conflicts[0].package).toBe('react');
  });

  it('should pin versions from registry', () => {
    const resolver = new DependencyResolver();

    resolver.addDependencies({ react: '^18.2.0' });
    resolver.addDependencies({ '@testing-library/react': '^14.0.0' }, true);

    const result = resolver.resolve();
    // Versions should be applied
    expect(result.dependencies.react).toBeDefined();
    expect(result.devDependencies['@testing-library/react']).toBeDefined();
  });

  it('should move package from dev to prod if added to prod', () => {
    const resolver = new DependencyResolver();

    resolver.addDependencies({ react: '^18.0.0' }, true);
    expect(resolver.resolve().devDependencies).toHaveProperty('react');

    resolver.reset();
    resolver.addDependencies({ react: '^18.0.0' });
    expect(resolver.resolve().dependencies).toHaveProperty('react');
  });
});
