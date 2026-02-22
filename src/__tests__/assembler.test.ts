import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import type { ProjectConfig } from '../config/schema';
import { ProjectAssembler } from '../assembler';

const TSX_VERSION = '^4.19.2'; // renovate: depName=tsx
const REACT_VERSION = '^19.0.0'; // renovate: depName=react
const TYPESCRIPT_VERSION = '^5.7.2'; // renovate: depName=typescript

function createConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    name: 'test-app',
    path: '/tmp/test-app',
    runtime: 'vite',
    language: 'typescript',
    styling: { solution: 'tailwind' },
    stateManagement: 'none',
    dataFetching: { enabled: false, library: 'tanstack-query' },
    testing: {
      enabled: false,
      unit: { enabled: false, runner: 'vitest' },
      component: { enabled: false, library: 'testing-library' },
      e2e: { enabled: false, runner: 'none' },
    },
    linting: { prettier: true },
    packageManager: 'npm',
    git: { init: false, initialCommit: false },
    plugins: [],
    ...overrides,
  };
}

describe('ProjectAssembler', () => {
  it('should process template variables and expose immutable file map', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'forge-assembler-vars-'));
    const config = createConfig({ path: tempDir, name: 'awesome-app' });
    const assembler = new ProjectAssembler(tempDir, config);

    assembler.addFile(
      'README.md',
      '{{PROJECT_NAME}} | {{PROJECT_DESCRIPTION}} | {{AUTHOR}} | {{LICENSE}}'
    );
    const files = assembler.getFiles();

    expect(files.get('README.md')).toBe(
      'awesome-app | A production-ready React application |  | MIT'
    );

    files.set('another.md', 'changed');
    expect(assembler.getFiles().has('another.md')).toBe(false);

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should merge dependencies/scripts and write text and binary files', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'forge-assembler-write-'));
    const config = createConfig({ path: tempDir });
    const assembler = new ProjectAssembler(tempDir, config);

    const sourceBinaryPath = join(tempDir, 'source.bin');
    writeFileSync(sourceBinaryPath, Buffer.from([0xde, 0xad, 0xbe, 0xef]));

    assembler.addFiles(
      new Map([
        ['src/index.ts', 'export const app = "{{PROJECT_NAME}}";'],
        ['assets/copied.bin', `__BINARY__:${sourceBinaryPath}`],
      ])
    );

    assembler.addDependencies({ zeta: '^1.0.0', alpha: '^1.0.0' });
    assembler.addDevDependencies({ tsx: TSX_VERSION });
    assembler.addScripts({ dev: 'vite', build: 'vite build' });
    assembler.mergeTemplateDeps({
      dependencies: { react: REACT_VERSION },
      devDependencies: { typescript: TYPESCRIPT_VERSION },
      scripts: { test: 'vitest' },
    });

    const writeResult = assembler.writeFiles();

    expect(writeResult.errors).toEqual([]);
    expect(writeResult.filesWritten).toBe(3);

    const textFile = readFileSync(join(tempDir, 'src/index.ts'), 'utf-8');
    expect(textFile).toContain('test-app');

    const copiedBinary = readFileSync(join(tempDir, 'assets/copied.bin'));
    expect(copiedBinary.equals(Buffer.from([0xde, 0xad, 0xbe, 0xef]))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
      scripts: Record<string, string>;
    };

    expect(Object.keys(pkg.dependencies)).toEqual(['alpha', 'react', 'zeta']);
    expect(pkg.devDependencies).toMatchObject({
      tsx: TSX_VERSION,
      typescript: TYPESCRIPT_VERSION,
    });
    expect(pkg.scripts).toMatchObject({
      dev: 'vite',
      build: 'vite build',
      test: 'vitest',
    });

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should capture file write errors and still write remaining files', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'forge-assembler-errors-'));
    const config = createConfig({ path: tempDir });
    const assembler = new ProjectAssembler(tempDir, config);

    assembler.addFile('ok.txt', 'ok');
    assembler.addFile(`bad\u0000name.txt`, 'bad');

    const result = assembler.writeFiles();

    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('Failed to write');
    expect(result.filesWritten).toBe(2);
    expect(readFileSync(join(tempDir, 'ok.txt'), 'utf-8')).toBe('ok');

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should support package json override and expose config/path', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'forge-assembler-pkg-'));
    const config = createConfig({ path: tempDir, name: 'pkg-app' });
    const assembler = new ProjectAssembler(tempDir, config);

    assembler.setPackageJson({
      name: 'custom-name',
      version: '2.0.0',
      scripts: { start: 'node index.js' },
      dependencies: { b: '1.0.0', a: '1.0.0' },
      devDependencies: {},
    });
    assembler.addFile('index.js', 'console.log("hello");');

    const pkgBeforeWrite = assembler.getPackageJson();
    expect(pkgBeforeWrite.name).toBe('custom-name');

    const result = assembler.writeFiles();
    expect(result.errors).toEqual([]);

    const pkg = JSON.parse(readFileSync(join(tempDir, 'package.json'), 'utf-8')) as {
      dependencies: Record<string, string>;
    };
    expect(Object.keys(pkg.dependencies)).toEqual(['a', 'b']);

    expect(assembler.getConfig().name).toBe('pkg-app');
    expect(assembler.getProjectPath()).toBe(tempDir);

    rmSync(tempDir, { recursive: true, force: true });
  });
});
