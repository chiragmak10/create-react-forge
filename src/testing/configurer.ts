import type { ProjectConfig } from '../config/schema.js';

/**
 * Testing configuration orchestration
 */
export class TestingConfigurer {
  private config: ProjectConfig;

  constructor(config: ProjectConfig) {
    this.config = config;
  }

  /**
   * Get unit test runner based on config and runtime
   */
  getUnitTestRunner(): 'vitest' | 'jest' {
    if (!this.config.testing.enabled) {
      throw new Error('Testing is not enabled');
    }

    // Vite strongly prefers Vitest
    if (this.config.runtime === 'vite') {
      return 'vitest';
    }

    // Next.js can use either, but default to Vitest
    return this.config.testing.unit.runner || 'vitest';
  }

  /**
   * Get E2E test runner
   */
  getE2ETestRunner(): 'playwright' | 'cypress' | 'none' {
    if (!this.config.testing.enabled || !this.config.testing.e2e.enabled) {
      return 'none';
    }
    return this.config.testing.e2e.runner;
  }

  /**
   * Generate test scripts for package.json
   */
  generateScripts(): Record<string, string> {
    const scripts: Record<string, string> = {};

    if (!this.config.testing.enabled) {
      return scripts;
    }

    const unitRunner = this.getUnitTestRunner();

    if (this.config.testing.unit.enabled) {
      if (unitRunner === 'vitest') {
        scripts['test'] = 'vitest run';
        scripts['test:watch'] = 'vitest';
        scripts['test:ui'] = 'vitest --ui';
        scripts['test:coverage'] = 'vitest run --coverage';
      } else if (unitRunner === 'jest') {
        scripts['test'] = 'jest';
        scripts['test:watch'] = 'jest --watch';
        scripts['test:coverage'] = 'jest --coverage';
      }
    }

    const e2eRunner = this.getE2ETestRunner();
    if (e2eRunner !== 'none') {
      if (e2eRunner === 'playwright') {
        scripts['test:e2e'] = 'playwright test';
        scripts['test:e2e:ui'] = 'playwright test --ui';
        scripts['test:e2e:debug'] = 'playwright test --debug';
      } else if (e2eRunner === 'cypress') {
        scripts['test:e2e'] = 'cypress open';
        scripts['test:e2e:run'] = 'cypress run';
      }
    }

    return scripts;
  }

  /**
   * Get test configuration files needed
   */
  getConfigFiles(): Record<string, string> {
    const files: Record<string, string> = {};

    if (!this.config.testing.enabled) {
      return files;
    }

    const unitRunner = this.getUnitTestRunner();

    if (unitRunner === 'vitest') {
      files['vitest.config.ts'] = this.generateVitestConfig();
    } else if (unitRunner === 'jest') {
      files['jest.config.js'] = this.generateJestConfig();
    }

    const e2eRunner = this.getE2ETestRunner();
    if (e2eRunner === 'playwright') {
      files['playwright.config.ts'] = this.generatePlaywrightConfig();
    } else if (e2eRunner === 'cypress') {
      files['cypress.config.ts'] = this.generateCypressConfig();
    }

    return files;
  }

  private generateVitestConfig(): string {
    return `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
`;
  }

  private generateJestConfig(): string {
    return `export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
`;
  }

  private generatePlaywrightConfig(): string {
    return `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
`;
  }

  private generateCypressConfig(): string {
    return `import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
`;
  }
}
