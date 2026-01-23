import { z } from 'zod';

/**
 * Core project configuration schema
 * Defines all possible configuration options for project generation
 */

export const RuntimeSchema = z.enum(['vite', 'nextjs']);
export type Runtime = z.infer<typeof RuntimeSchema>;

export const LanguageSchema = z.enum(['javascript', 'typescript']);
export type Language = z.infer<typeof LanguageSchema>;

export const StylingSchema = z.enum(['css', 'tailwind', 'styled-components', 'css-modules']);
export type Styling = z.infer<typeof StylingSchema>;

export const StateManagementSchema = z.enum(['none', 'redux', 'zustand', 'jotai']);
export type StateManagement = z.infer<typeof StateManagementSchema>;

export const PackageManagerSchema = z.enum(['npm', 'yarn', 'pnpm']);
export type PackageManager = z.infer<typeof PackageManagerSchema>;

export const UnitTestRunnerSchema = z.enum(['vitest', 'jest']);
export type UnitTestRunner = z.infer<typeof UnitTestRunnerSchema>;

export const E2ETestRunnerSchema = z.enum(['playwright', 'cypress', 'none']);
export type E2ETestRunner = z.infer<typeof E2ETestRunnerSchema>;

export const TestingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  unit: z.object({
    enabled: z.boolean().default(true),
    runner: UnitTestRunnerSchema.default('vitest'),
  }),
  component: z.object({
    enabled: z.boolean().default(true),
    library: z.literal('testing-library').default('testing-library'),
  }),
  e2e: z.object({
    enabled: z.boolean().default(true),
    runner: E2ETestRunnerSchema.default('playwright'),
  }),
});
export type TestingConfig = z.infer<typeof TestingConfigSchema>;

export const DataFetchingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  library: z.literal('tanstack-query').default('tanstack-query'),
});
export type DataFetchingConfig = z.infer<typeof DataFetchingConfigSchema>;

export const LintingConfigSchema = z.object({
  eslint: z.boolean().default(true),
  prettier: z.boolean().default(true),
});
export type LintingConfig = z.infer<typeof LintingConfigSchema>;

export const GitConfigSchema = z.object({
  init: z.boolean().default(true),
  initialCommit: z.boolean().default(true),
});
export type GitConfig = z.infer<typeof GitConfigSchema>;

export const StylingConfigSchema = z.object({
  solution: StylingSchema.default('tailwind'),
});
export type StylingConfigType = z.infer<typeof StylingConfigSchema>;

export const ProjectConfigSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .regex(/^[a-z0-9-]+$/, 'Project name must be lowercase alphanumeric with hyphens'),
  path: z.string().min(1, 'Project path is required'),
  runtime: RuntimeSchema.default('vite'),
  language: LanguageSchema.default('typescript'),
  styling: StylingConfigSchema,
  stateManagement: StateManagementSchema.default('none'),
  dataFetching: DataFetchingConfigSchema,
  testing: TestingConfigSchema,
  linting: LintingConfigSchema,
  packageManager: PackageManagerSchema.default('npm'),
  git: GitConfigSchema,
  plugins: z.array(z.object({ name: z.string(), config: z.unknown() })).default([]),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

/**
 * Default configuration preset
 */
export const DEFAULT_CONFIG: ProjectConfig = {
  name: 'my-app',
  path: './my-app',
  runtime: 'vite',
  language: 'typescript',
  styling: {
    solution: 'tailwind',
  },
  stateManagement: 'none',
  dataFetching: {
    enabled: true,
    library: 'tanstack-query',
  },
  testing: {
    enabled: true,
    unit: {
      enabled: true,
      runner: 'vitest',
    },
    component: {
      enabled: true,
      library: 'testing-library',
    },
    e2e: {
      enabled: true,
      runner: 'playwright',
    },
  },
  linting: {
    eslint: true,
    prettier: true,
  },
  packageManager: 'npm',
  git: {
    init: true,
    initialCommit: true,
  },
  plugins: [],
};




