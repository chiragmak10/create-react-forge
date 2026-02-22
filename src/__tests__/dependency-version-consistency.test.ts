import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { VERSION_REGISTRY } from '../dependencies/resolver';

const README_VERSION_ROWS: Array<{ label: string; depName: string }> = [
  { label: 'React', depName: 'react' },
  { label: 'Vite', depName: 'vite' },
  { label: 'Next.js', depName: 'next' },
  { label: 'Tailwind CSS', depName: 'tailwindcss' },
  { label: 'TanStack Query', depName: '@tanstack/react-query' },
  { label: 'Vitest', depName: 'vitest' },
  { label: 'Playwright', depName: '@playwright/test' },
  { label: 'TypeScript', depName: 'typescript' },
];

function collectManifestPaths(dirPath: string): string[] {
  const manifestPaths: string[] = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      manifestPaths.push(...collectManifestPaths(fullPath));
      continue;
    }
    if (entry.name === 'manifest.json') {
      manifestPaths.push(fullPath);
    }
  }
  return manifestPaths;
}

function readReadmeRowVersion(content: string, label: string): string | null {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rowRegex = new RegExp(`^\\|\\s*${escapedLabel}\\s*\\|\\s*([^|\\s]+)\\s*\\|\\s*$`, 'm');
  const match = content.match(rowRegex);
  return match?.[1] ?? null;
}

describe('Dependency Version Consistency', () => {
  it('should keep tracked README dependency rows in sync with VERSION_REGISTRY', () => {
    const readmeContent = readFileSync('README.md', 'utf-8');

    for (const { label, depName } of README_VERSION_ROWS) {
      const actual = readReadmeRowVersion(readmeContent, label);
      expect(actual, `README row missing or malformed for "${label}"`).not.toBeNull();
      expect(actual).toBe(VERSION_REGISTRY[depName]);
    }
  });

  it('should keep all template manifest dependency versions in sync with VERSION_REGISTRY', () => {
    const manifestPaths = collectManifestPaths('src/templates/overlays');
    const missingInRegistry: string[] = [];
    const mismatches: string[] = [];

    for (const manifestPath of manifestPaths) {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const depEntries = Object.entries({
        ...(manifest.dependencies || {}),
        ...(manifest.devDependencies || {}),
      });

      for (const [depName, currentValue] of depEntries) {
        const expectedValue = VERSION_REGISTRY[depName];
        if (!expectedValue) {
          missingInRegistry.push(`${depName} (${manifestPath})`);
          continue;
        }
        if (currentValue !== expectedValue) {
          mismatches.push(
            `${depName} (${manifestPath}) expected ${expectedValue} but found ${currentValue}`
          );
        }
      }
    }

    expect(missingInRegistry).toEqual([]);
    expect(mismatches).toEqual([]);
  });
});
