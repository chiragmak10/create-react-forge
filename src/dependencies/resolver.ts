/**
 * Dependency version registry with pinned versions
 */
export const VERSION_REGISTRY: Record<string, string> = {
  // Runtime
  'vite': '^5.4.0',
  '@vitejs/plugin-react': '^4.2.0',
  'next': '^14.2.0',

  // Language
  'typescript': '^5.3.0',

  // Styling
  'tailwindcss': '^3.4.0',
  'postcss': '^8.4.0',
  'autoprefixer': '^10.4.0',
  'styled-components': '^6.1.0',

  // State Management
  '@reduxjs/toolkit': '^2.2.0',
  'react-redux': '^9.1.0',
  'zustand': '^4.5.0',
  'jotai': '^2.6.0',

  // Data Fetching
  '@tanstack/react-query': '^5.60.0',
  '@tanstack/react-query-devtools': '^5.60.0',

  // Testing - Unit
  'vitest': '^2.0.0',
  '@vitest/ui': '^2.0.0',
  'jest': '^29.7.0',

  // Testing - Component
  '@testing-library/react': '^16.0.0',
  '@testing-library/jest-dom': '^6.4.0',
  '@testing-library/user-event': '^14.5.0',
  'jsdom': '^24.0.0',

  // Testing - E2E
  'playwright': '^1.45.0',
  'cypress': '^13.13.0',

  // Linting
  'eslint': '^8.56.0',
  '@typescript-eslint/eslint-plugin': '^6.17.0',
  '@typescript-eslint/parser': '^6.17.0',
  'eslint-config-prettier': '^9.1.0',
  'eslint-plugin-react': '^7.33.0',
  'eslint-plugin-react-hooks': '^4.6.0',

  // Formatting
  'prettier': '^3.1.1',

  // Build & Dev
  'tsx': '^4.7.0',
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
    const pkg = Object.keys(VERSION_REGISTRY).find(
      (key) => VERSION_REGISTRY[key] === version
    );
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
