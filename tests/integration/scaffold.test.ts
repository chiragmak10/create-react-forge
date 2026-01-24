import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { generateProject } from '../../src/generator/index.js';
import { DEFAULT_CONFIG, type ProjectConfig } from '../../src/config/schema.js';

const TEST_DIR = join(process.cwd(), 'test-output');

describe('Project Generator Integration', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('scaffolds a basic Vite project', async () => {
    const config: ProjectConfig = {
      ...DEFAULT_CONFIG,
      name: 'test-app',
      path: join(TEST_DIR, 'test-app'),
      runtime: 'vite',
      git: { init: false, initialCommit: false } // Skip git for tests
    };

    const result = await generateProject(config);

    expect(result.success).toBe(true);
    expect(existsSync(join(config.path, 'package.json'))).toBe(true);
    expect(existsSync(join(config.path, 'vite.config.ts'))).toBe(true);
    expect(existsSync(join(config.path, 'ARCHITECTURE.md'))).toBe(true);
    
    const archDoc = readFileSync(join(config.path, 'ARCHITECTURE.md'), 'utf-8');
    expect(archDoc).toContain('Vite (SPA)');
  });

  it('scaffolds a Next.js project', async () => {
    const config: ProjectConfig = {
      ...DEFAULT_CONFIG,
      name: 'next-app',
      path: join(TEST_DIR, 'next-app'),
      runtime: 'nextjs',
      git: { init: false, initialCommit: false }
    };

    const result = await generateProject(config);

    expect(result.success).toBe(true);
    expect(existsSync(join(config.path, 'package.json'))).toBe(true);
    expect(existsSync(join(config.path, 'next.config.js'))).toBe(true); // Assuming .js based on file list
    expect(existsSync(join(config.path, 'ARCHITECTURE.md'))).toBe(true);

    const archDoc = readFileSync(join(config.path, 'ARCHITECTURE.md'), 'utf-8');
    expect(archDoc).toContain('Next.js (App Router)');
  });
});

