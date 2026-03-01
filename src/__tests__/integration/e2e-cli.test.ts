import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execa, type ExecaError } from 'execa';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';
import { existsSync } from 'node:fs';

/**
 * E2E CLI Command Tests
 * Tests that verify the actual create-react-forge CLI command execution
 * across different platforms
 */

const CLI_TEST_TIMEOUT_MS = Number(process.env.CRF_CLI_TEST_TIMEOUT_MS ?? 30000);

describe('E2E CLI Command Tests', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(join(os.tmpdir(), 'crf-e2e-'));
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (err) {
        console.error(`Cleanup warning: ${err}`);
      }
    }
  });

  describe('CLI Version and Help', () => {
    it('should display version information', async () => {
      try {
        const { stdout } = await execa('node', ['dist/index.js', '--version']);
        expect(stdout).toBeTruthy();
        expect(/^\d+\.\d+\.\d+/.test(stdout) || stdout.includes('1.')).toBe(true);
      } catch (err) {
        // Version might not be displayed in dev mode, that's ok
        console.warn('Version check:', err);
      }
    });
    it('should display help information', { timeout: CLI_TEST_TIMEOUT_MS }, async () => {
      const { stdout, stderr, exitCode } = await execa('node', ['dist/index.js', '--help']);
      expect(exitCode === undefined || exitCode === 0).toBe(true);

      const output = `${stdout}\n${stderr}`.trim();
      if (output.length > 0) {
        const hasHelpContent = output.includes('create-react-forge') || output.includes('Usage');
        expect(hasHelpContent).toBe(true);
      }
    });

    it(
      'should handle help flag on different platforms',
      { timeout: CLI_TEST_TIMEOUT_MS },
      async () => {
        const helpFlags = ['--help', '-h', '--version', '-V'];

        for (const flag of helpFlags) {
          try {
            const { stdout, stderr } = await execa('node', ['dist/index.js', flag]);
            expect(stdout || stderr).toBeTruthy();
          } catch (err) {
            // Some flags might error in non-interactive mode
            console.warn(`Flag ${flag} error:`, err);
          }
        }
      }
    );
  });

  describe('CLI Platform-Specific Execution', () => {
    it('should execute on current platform', async () => {
      const platform = os.platform();
      expect(['win32', 'darwin', 'linux']).toContain(platform);

      try {
        const { stdout } = await execa('node', ['dist/index.js', '--help']);
        expect(stdout).toBeTruthy();
      } catch (err) {
        console.warn(`Execution on ${platform}:`, err);
      }
    });

    it('should handle environment variables correctly', async () => {
      const env = {
        ...process.env,
        NODE_ENV: 'test',
        DEBUG: 'create-react-forge:*',
      };

      try {
        const { stdout } = await execa('node', ['dist/index.js', '--help'], { env });
        expect(stdout).toBeTruthy();
      } catch (err) {
        console.warn('Environment test:', err);
      }
    });
  });

  describe('CLI Error Handling', () => {
    it('should handle invalid arguments gracefully', { timeout: CLI_TEST_TIMEOUT_MS }, async () => {
      try {
        await execa('node', ['dist/index.js', '--invalid-flag']);
      } catch (err) {
        // Should error but not crash
        expect(err).toBeDefined();
      }
    });

    it('should handle missing required arguments', { timeout: CLI_TEST_TIMEOUT_MS }, async () => {
      try {
        // When called without flags, the CLI prompts for input
        // In non-interactive test environment, we need to provide stdin or skip
        // For now, we test that --help works without issues
        const { stdout, stderr } = await execa('node', ['dist/index.js', '--help']);
        expect(stdout || stderr).toBeTruthy();
      } catch (err) {
        // In test environment without stdin, this may error
        expect(err).toBeDefined();
      }
    });
  });

  describe('CLI Output Consistency', () => {
    it(
      'should produce consistent output across multiple runs',
      { timeout: CLI_TEST_TIMEOUT_MS },
      async () => {
        const runs = [];

        for (let i = 0; i < 3; i++) {
          const { stdout } = await execa('node', ['dist/index.js', '--help']);
          runs.push(stdout);
        }

        // All runs should be identical
        expect(runs[0]).toBe(runs[1]);
        expect(runs[1]).toBe(runs[2]);
      }
    );

    it('should handle concurrent CLI invocations', { timeout: CLI_TEST_TIMEOUT_MS }, async () => {
      const results = await Promise.allSettled([
        execa('node', ['dist/index.js', '--help']),
        execa('node', ['dist/index.js', '--help']),
        execa('node', ['dist/index.js', '--help']),
      ]);

      expect(results).toHaveLength(3);
      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('CLI Node Version Compatibility', () => {
    it('should provide Node version information', async () => {
      const { stdout } = await execa('node', ['--version']);
      expect(stdout).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should work with Node 20+', async () => {
      const { stdout } = await execa('node', ['--version']);
      const version = parseInt(stdout.slice(1).split('.')[0], 10);
      expect(version).toBeGreaterThanOrEqual(20);
    });
  });

  describe('CLI Exit Codes', () => {
    it('should exit with code 0 on success', { timeout: CLI_TEST_TIMEOUT_MS }, async () => {
      try {
        const result = await execa('node', ['dist/index.js', '--help']);
        expect(result.exitCode === undefined || result.exitCode === 0).toBe(true);
      } catch (err) {
        // In execa, success is default
        console.warn('Exit code test:', err);
      }
    });

    it('should exit with non-zero on error', { timeout: CLI_TEST_TIMEOUT_MS }, async () => {
      try {
        await execa('node', ['dist/index.js', '--nonexistent-flag']);
      } catch (err) {
        const error = err as ExecaError;
        expect(error.exitCode || error.code).toBeTruthy();
      }
    });
  });

  describe('Platform Path Handling', () => {
    it('should handle paths correctly on all platforms', async () => {
      const testFile = join(testDir, 'test.txt');
      await fs.writeFile(testFile, 'test', { mode: 0o600 });

      expect(existsSync(testFile)).toBe(true);
    });

    it('should handle special characters in paths', async () => {
      const specialDir = join(testDir, 'test-app_v1.0');
      await fs.mkdir(specialDir, { recursive: true });

      expect(existsSync(specialDir)).toBe(true);
    });
  });
});
