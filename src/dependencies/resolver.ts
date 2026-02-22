/**
 * Dependency version registry with pinned versions
 */
export const VERSION_REGISTRY: Record<string, string> = {
  // Runtime
  vite: '^6.0.7',
  '@vitejs/plugin-react': '^4.3.4',
  next: '^16.1.6',
  react: '^19.0.0',
  'react-dom': '^19.0.0',

  // Language
  typescript: '^5.7.2',

  // Styling
  tailwindcss: '^4.0.0',
  '@tailwindcss/postcss': '^4.0.0',
  postcss: '^8.4.49',
  autoprefixer: '^10.4.20',
  'styled-components': '^6.1.14',
  '@types/styled-components': '^5.1.34',
  'babel-plugin-styled-components': '^2.1.4',

  // State Management
  '@reduxjs/toolkit': '^2.5.0',
  'react-redux': '^9.2.0',
  zustand: '^5.0.3',
  jotai: '^2.10.0',

  // Data Fetching
  '@tanstack/react-query': '^5.62.10',
  '@tanstack/react-query-devtools': '^5.62.10',

  // Testing - Unit
  vitest: '^2.1.8',
  '@vitest/ui': '^2.1.8',
  '@vitest/coverage-v8': '^2.1.8',
  jest: '^29.7.0',
  'jest-environment-jsdom': '^29.7.0',
  '@types/jest': '^29.5.14',
  'ts-jest': '^29.2.6',

  // Testing - Component
  '@testing-library/react': '^16.1.0',
  '@testing-library/jest-dom': '^6.6.3',
  '@testing-library/user-event': '^14.5.2',
  jsdom: '^25.0.1',
  msw: '^2.7.0',

  // Testing - E2E
  playwright: '^1.49.1',
  '@playwright/test': '^1.49.1',
  cypress: '^13.17.0',

  // Formatting
  prettier: '^3.4.2',

  // Build & Dev
  tsx: '^4.19.2',

  // Type definitions
  '@types/react': '^19.0.6',
  '@types/react-dom': '^19.0.3',
  '@types/node': '^22.10.5',

  // Routing
  'react-router-dom': '^7.1.1',
  'react-error-boundary': '^4.1.2',
};

/**
 * Dependency resolver for collecting and deduplicating dependencies
 */
export class DependencyResolver {
  private dependencies: Map<string, string> = new Map();
  private devDependencies: Map<string, string> = new Map();
  private conflicts: Array<{ package: string; versions: string[] }> = [];

  /**
   * Add dependencies from a source
   */
  addDependencies(deps: Record<string, string>, isDev: boolean = false): void {
    const map = isDev ? this.devDependencies : this.dependencies;
    const otherMap = isDev ? this.dependencies : this.devDependencies;

    for (const [pkg, version] of Object.entries(deps)) {
      const existing = map.get(pkg);
      if (existing && existing !== version) {
        // Check if they're compatible
        this.conflicts.push({
          package: pkg,
          versions: [existing, version],
        });
      }
      map.set(pkg, version);

      // Remove from dev if adding to prod or vice versa
      if (otherMap.has(pkg)) {
        otherMap.delete(pkg);
      }
    }
  }

  /**
   * Resolve and pin versions
   */
  resolve(): {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    conflicts: Array<{ package: string; versions: string[] }>;
  } {
    const deps: Record<string, string> = {};
    const devDeps: Record<string, string> = {};

    // Convert maps to objects and apply version pinning
    for (const [pkg, version] of this.dependencies.entries()) {
      deps[pkg] = this.pinVersion(version);
    }

    for (const [pkg, version] of this.devDependencies.entries()) {
      devDeps[pkg] = this.pinVersion(version);
    }

    return {
      dependencies: deps,
      devDependencies: devDeps,
      conflicts: this.conflicts,
    };
  }

  /**
   * Apply version pinning strategy
   */
  private pinVersion(version: string): string {
    // Check if version is in registry
    const pkg = Object.keys(VERSION_REGISTRY).find((key) => VERSION_REGISTRY[key] === version);
    if (pkg) {
      return VERSION_REGISTRY[pkg];
    }

    // Use provided version
    return version;
  }

  /**
   * Check for conflicts
   */
  getConflicts(): Array<{ package: string; versions: string[] }> {
    return this.conflicts;
  }

  /**
   * Clear resolver state
   */
  reset(): void {
    this.dependencies.clear();
    this.devDependencies.clear();
    this.conflicts = [];
  }
}
