import { DEFAULT_CONFIG, ProjectConfigSchema, type ProjectConfig } from './schema.js';

/**
 * Configuration builder - validates and normalizes user input
 */

export class ConfigBuilder {
  private config: Partial<ProjectConfig> = {};

  constructor(initialConfig?: Partial<ProjectConfig>) {
    this.config = initialConfig ? structuredClone(initialConfig) : {};
  }

  private ensureTestingConfig(): ProjectConfig['testing'] {
    if (!this.config.testing) {
      this.config.testing = structuredClone(DEFAULT_CONFIG.testing);
    }
    return this.config.testing;
  }

  private ensureDataFetchingConfig(): ProjectConfig['dataFetching'] {
    if (!this.config.dataFetching) {
      this.config.dataFetching = structuredClone(DEFAULT_CONFIG.dataFetching);
    }
    return this.config.dataFetching;
  }

  private ensureGitConfig(): ProjectConfig['git'] {
    if (!this.config.git) {
      this.config.git = structuredClone(DEFAULT_CONFIG.git);
    }
    return this.config.git;
  }

  setName(name: string): this {
    this.config.name = name;
    return this;
  }

  setPath(path: string): this {
    this.config.path = path;
    return this;
  }

  setRuntime(runtime: 'vite' | 'nextjs'): this {
    this.config.runtime = runtime;
    return this;
  }

  setLanguage(language: 'javascript' | 'typescript'): this {
    this.config.language = language;
    return this;
  }

  setStyling(solution: string): this {
    this.config.styling = { solution: solution as any };
    return this;
  }

  setStateManagement(manager: string): this {
    this.config.stateManagement = manager as any;
    return this;
  }

  setTestingEnabled(enabled: boolean): this {
    this.ensureTestingConfig().enabled = enabled;
    return this;
  }

  setUnitTestingEnabled(enabled: boolean): this {
    this.ensureTestingConfig().unit.enabled = enabled;
    return this;
  }

  setE2ETestingEnabled(enabled: boolean): this {
    this.ensureTestingConfig().e2e.enabled = enabled;
    return this;
  }

  setUnitTestRunner(runner: 'vitest' | 'jest'): this {
    this.ensureTestingConfig().unit.runner = runner;
    return this;
  }

  setE2ETestRunner(runner: 'playwright' | 'cypress' | 'none'): this {
    this.ensureTestingConfig().e2e.runner = runner;
    return this;
  }

  setDataFetchingEnabled(enabled: boolean): this {
    this.ensureDataFetchingConfig().enabled = enabled;
    return this;
  }

  setPackageManager(manager: 'npm' | 'yarn' | 'pnpm'): this {
    this.config.packageManager = manager;
    return this;
  }

  setGitInit(init: boolean): this {
    this.ensureGitConfig().init = init;
    return this;
  }

  /**
   * Validate and build final configuration
   * Throws if validation fails
   */
  build(): ProjectConfig {
    const result = ProjectConfigSchema.parse({
      ...DEFAULT_CONFIG,
      ...this.config,
    });
    return result;
  }

  /**
   * Safely validate configuration, returning validation result
   */
  validate(): { success: boolean; data?: ProjectConfig; errors?: string[] } {
    try {
      const data = this.build();
      return { success: true, data };
    } catch (error: unknown) {
      const errors = error instanceof Error ? [error.message] : ['Unknown validation error'];
      return { success: false, errors };
    }
  }

  /**
   * Get current partial config (for inspection)
   */
  getConfig(): Partial<ProjectConfig> {
    return { ...this.config };
  }
}

/**
 * Helper to merge multiple configs with validation
 */
export function mergeConfigs(...configs: Partial<ProjectConfig>[]): ProjectConfig {
  const merged = configs.reduce((acc, config) => ({ ...acc, ...config }), {
    ...DEFAULT_CONFIG,
  } as ProjectConfig);
  return ProjectConfigSchema.parse(merged);
}



