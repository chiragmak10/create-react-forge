import { describe, expect, it } from 'vitest';
import type { ProjectConfig } from '../config/schema';
import { DEFAULT_CONFIG } from '../config/schema';
import { TestingConfigurer } from '../testing/configurer';

describe('TestingConfigurer', () => {
  const createConfig = (overrides?: Partial<ProjectConfig>): ProjectConfig => ({
    ...DEFAULT_CONFIG,
    ...overrides,
  });

  it('should select Vitest for Vite runtime', () => {
    const config = createConfig({ runtime: 'vite' });
    const configurer = new TestingConfigurer(config);

    expect(configurer.getUnitTestRunner()).toBe('vitest');
  });

  it('should default to Vitest for Next.js', () => {
    const config = createConfig({ runtime: 'nextjs' });
    const configurer = new TestingConfigurer(config);

    expect(configurer.getUnitTestRunner()).toBe('vitest');
  });

  it('should generate Vitest scripts', () => {
    const config = createConfig({
      runtime: 'vite',
      testing: {
        ...DEFAULT_CONFIG.testing,
        enabled: true,
        unit: { enabled: true, runner: 'vitest' },
      },
    });
    const configurer = new TestingConfigurer(config);

    const scripts = configurer.generateScripts();

    expect(scripts.test).toBe('vitest run');
    expect(scripts['test:watch']).toBe('vitest');
    expect(scripts['test:ui']).toBe('vitest --ui');
  });

  it('should generate E2E scripts for Playwright', () => {
    const config = createConfig({
      testing: {
        ...DEFAULT_CONFIG.testing,
        enabled: true,
        e2e: { enabled: true, runner: 'playwright' },
      },
    });
    const configurer = new TestingConfigurer(config);

    const scripts = configurer.generateScripts();

    expect(scripts['test:e2e']).toBe('playwright test');
    expect(scripts['test:e2e:ui']).toBe('playwright test --ui');
  });

  it('should not generate scripts when testing is disabled', () => {
    const config = createConfig({
      testing: { ...DEFAULT_CONFIG.testing, enabled: false },
    });
    const configurer = new TestingConfigurer(config);

    const scripts = configurer.generateScripts();

    expect(Object.keys(scripts).length).toBe(0);
  });

  it('should generate config files', () => {
    const config = createConfig({
      runtime: 'vite',
      testing: {
        ...DEFAULT_CONFIG.testing,
        enabled: true,
        unit: { enabled: true, runner: 'vitest' },
        e2e: { enabled: true, runner: 'playwright' },
      },
    });
    const configurer = new TestingConfigurer(config);

    const files = configurer.getConfigFiles();

    expect(files['vitest.config.ts']).toBeDefined();
    expect(files['playwright.config.ts']).toBeDefined();
  });

  it('should return none for E2E when disabled', () => {
    const config = createConfig({
      testing: { ...DEFAULT_CONFIG.testing, e2e: { enabled: false, runner: 'playwright' } },
    });
    const configurer = new TestingConfigurer(config);

    expect(configurer.getE2ETestRunner()).toBe('none');
  });
});
