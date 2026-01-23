import deepmerge from 'deepmerge';

/**
 * Merges configuration objects with smart strategies
 */
export class ConfigMerger {
  /**
   * Deep merge objects with array concatenation
   */
  static merge(...objects: Record<string, unknown>[]): Record<string, unknown> {
    return deepmerge.all(objects, {
      arrayMerge: (target: unknown[], source: unknown[]) => [...target, ...source],
    }) as Record<string, unknown>;
  }

  /**
   * Merge package.json files intelligently
   */
  static mergePackageJson(...packages: Record<string, unknown>[]): Record<string, unknown> {
    const merged: Record<string, unknown> = {};

    for (const pkg of packages) {
      // Regular merge for most fields
      for (const [key, value] of Object.entries(pkg)) {
        if (key === 'scripts') {
          // Merge scripts by combining them
          if (!merged.scripts) {
            merged.scripts = {};
          }
          Object.assign(
            merged.scripts as Record<string, unknown>,
            value as Record<string, unknown>
          );
        } else if (
          key === 'dependencies' ||
          key === 'devDependencies' ||
          key === 'peerDependencies'
        ) {
          // Merge dependencies, later versions win
          if (!merged[key]) {
            merged[key] = {};
          }
          Object.assign(merged[key] as Record<string, unknown>, value as Record<string, unknown>);
        } else if (Array.isArray(value)) {
          // Deduplicate arrays
          if (!merged[key]) {
            merged[key] = [];
          }
          merged[key] = Array.from(new Set([...(merged[key] as unknown[]), ...value]));
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Deep merge objects
          merged[key] = this.merge(
            merged[key] as Record<string, unknown>,
            value as Record<string, unknown>
          );
        } else {
          // Primitive: later value wins
          merged[key] = value;
        }
      }
    }

    return merged;
  }
}
