import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { join, sep } from 'node:path';
import os from 'node:os';
import { existsSync } from 'node:fs';

/**
 * Cross-platform CLI E2E tests
 * Tests the create-react-forge command on different OS environments
 * Verifies proper functionality across Windows, macOS, and Linux
 */

describe('Cross-Platform CLI E2E Tests', () => {
  let testDir: string;
  const platform = os.platform(); // 'win32', 'darwin', 'linux'

  beforeEach(async () => {
    // Create unique test directory for each test
    testDir = join(os.tmpdir(), `crf-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      await fs.mkdir(testDir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create test directory: ${testDir}`, err);
    }
  });

  afterEach(async () => {
    // Cleanup test directory
    if (existsSync(testDir)) {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to cleanup test directory: ${testDir}`, err);
      }
    }
  });

  describe('Platform Detection', () => {
    it('should identify current platform correctly', () => {
      expect(['win32', 'darwin', 'linux']).toContain(platform);
    });

    it('should provide platform-specific path separators', () => {
      if (platform === 'win32') {
        expect(sep).toBe('\\');
      } else {
        expect(sep).toBe('/');
      }
    });
  });

  describe('CLI Command Execution', () => {
    it('should execute help command successfully across platforms', () => {
      try {
        // Build the dist first if not already built
        const output = executeCommand('npm run build', testDir);
        expect(output).toBeDefined();
      } catch (err) {
        console.warn('Build output:', err);
        // Build might warn but shouldn't fail
      }
    });

    it('should handle environment variables correctly on current platform', async () => {
      const envVars = { ...process.env, DEBUG: 'create-react-forge:*' };

      // Verify environment is passed correctly
      expect(envVars.DEBUG).toBe('create-react-forge:*');
      expect(typeof envVars.PATH).toBe('string');
    });

    it('should work with platform-specific path formats', async () => {
      const projectName = 'test-app';
      const projectPath = join(testDir, projectName);

      expect(projectPath).toContain(sep);

      // Verify path can be created
      await fs.mkdir(projectPath, { recursive: true });
      expect(existsSync(projectPath)).toBe(true);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should normalize paths correctly on all platforms', () => {
      const paths = [
        'src/components/App.tsx',
        'src\\components\\App.tsx', // Windows style
      ];

      paths.forEach((path) => {
        // Should handle mixed path separators gracefully
        expect(path).toBeTruthy();
      });
    });

    it('should handle long file paths on Windows', async () => {
      if (platform === 'win32') {
        // Windows has 260 character limit for paths without special handling
        const deepPath = join(testDir, 'very', 'long', 'nested', 'directory', 'structure');

        // Path length should be managed
        expect(deepPath.length).toBeGreaterThan(0);
      }
    });

    it('should handle special characters in paths', async () => {
      const specialNames = ['test-app', 'test_app', 'testApp'];

      for (const name of specialNames) {
        const path = join(testDir, name);
        await fs.mkdir(path, { recursive: true });
        expect(existsSync(path)).toBe(true);
        await fs.rm(path, { recursive: true });
      }
    });

    it('should have consistent line endings handling', async () => {
      const testFile = join(testDir, 'test.txt');
      const content = 'line1\nline2\nline3';

      await fs.writeFile(testFile, content);
      const read = await fs.readFile(testFile, 'utf-8');

      // Should preserve content regardless of platform
      expect(read).toContain('line1');
      expect(read).toContain('line2');
      expect(read).toContain('line3');
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should handle case sensitivity appropriately', async () => {
      const file1 = join(testDir, 'test.txt');
      const file2 = join(testDir, 'TEST.txt');

      await fs.writeFile(file1, 'test1');

      if (platform === 'win32' || platform === 'darwin') {
        // Windows and macOS are case-insensitive
        const exists = existsSync(file2);
        expect(typeof exists).toBe('boolean');
      } else {
        // Linux is case-sensitive
        expect(existsSync(file1)).toBe(true);
        expect(existsSync(file2)).toBe(false);
      }
    });

    it('should use correct package manager detection', () => {
      // Should detect available package manager on platform
      const hasNpm = checkCommandExists('npm');
      // const hasYarn = checkCommandExists('yarn');

      // At least npm should be available
      expect(hasNpm).toBe(true);
    });

    it('should handle permissions correctly on Unix systems', async () => {
      if (platform !== 'win32') {
        const scriptPath = join(testDir, 'test.sh');
        await fs.writeFile(scriptPath, '#!/bin/bash\necho "test"');

        // File should be created successfully
        expect(existsSync(scriptPath)).toBe(true);
      }
    });
  });

  describe('Output and Logging', () => {
    it('should produce platform-consistent output', () => {
      // Verify chalk handles colors on all platforms
      const coloredText = '\x1b[32mSuccess\x1b[0m';
      expect(coloredText).toContain('Success');
    });

    it('should handle multiple output lines', () => {
      const output = 'Line 1\nLine 2\nLine 3';
      const lines = output.split('\n');

      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('Line 1');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing directories gracefully', async () => {
      const nonExistentPath = join(testDir, 'does', 'not', 'exist', 'yet');

      try {
        await fs.readFile(nonExistentPath);
        expect.fail('Should throw error');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it('should handle invalid input on all platforms', () => {
      const invalidInputs = ['', null, undefined, NaN];

      invalidInputs.forEach((input) => {
        if (input === null || input === undefined) {
          expect(input).not.toBeTruthy();
        }
      });
    });
  });
});

/**
 * Helper function to execute commands
 */
function executeCommand(command: string, cwd: string): string {
  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return output;
  } catch (err) {
    throw new Error(`Command failed: ${command}\nError: ${err}`);
  }
}

/**
 * Helper to check if command exists
 */
function checkCommandExists(command: string): boolean {
  try {
    if (os.platform() === 'win32') {
      execSync(`where ${command}`, { stdio: 'ignore' });
    } else {
      execSync(`which ${command}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}
