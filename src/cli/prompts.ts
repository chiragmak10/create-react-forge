import {
    confirm,
    input,
    select
} from '@inquirer/prompts';
import { E2E_RUNNER_DESCRIPTIONS, RUNTIME_DESCRIPTIONS, STATE_DESCRIPTIONS, STYLING_DESCRIPTIONS, TEST_RUNNER_DESCRIPTIONS } from '../config/defaults.js';

export interface PromptAnswers {
  projectName: string;
  projectPath: string;
  runtime: 'vite' | 'nextjs';
  language: 'javascript' | 'typescript';
  styling: string;
  stateManagement: string;
  testing: 'full' | 'unit-component' | 'none';
  unitRunner: 'vitest' | 'jest';
  e2eRunner: 'playwright' | 'cypress' | 'none';
  dataFetching: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  git: boolean;
  eslint: boolean;
  prettier: boolean;
}

/**
 * Interactive prompts for user input
 */
export async function promptForProjectDetails(
  suggestedName?: string
): Promise<PromptAnswers> {
  const projectName = await input({
    message: 'Project name:',
    default: suggestedName || 'my-app',
    validate: (value: string) => {
      if (!value) return 'Project name is required';
      if (!/^[a-z0-9-]+$/.test(value))
        return 'Project name must be lowercase alphanumeric with hyphens';
      return true;
    },
  });

  const projectPath = await input({
    message: 'Project directory:',
    default: `./${projectName}`,
  });

  const runtime = (await select({
    message: 'Choose runtime:',
    choices: [
      { name: RUNTIME_DESCRIPTIONS.vite, value: 'vite' },
      { name: RUNTIME_DESCRIPTIONS.nextjs, value: 'nextjs' },
    ],
  })) as 'vite' | 'nextjs';

  const language = (await select({
    message: 'Language:',
    choices: [
      { name: 'TypeScript (recommended)', value: 'typescript' },
      { name: 'JavaScript', value: 'javascript' },
    ],
  })) as 'javascript' | 'typescript';

  const styling = (await select({
    message: 'Styling solution:',
    choices: [
      { name: STYLING_DESCRIPTIONS.tailwind, value: 'tailwind' },
      { name: STYLING_DESCRIPTIONS.css, value: 'css' },
      { name: STYLING_DESCRIPTIONS['styled-components'], value: 'styled-components' },
      { name: STYLING_DESCRIPTIONS['css-modules'], value: 'css-modules' },
    ],
  })) as string;

  const stateManagement = (await select({
    message: 'State management:',
    choices: [
      { name: STATE_DESCRIPTIONS.none, value: 'none' },
      { name: STATE_DESCRIPTIONS.zustand, value: 'zustand' },
      { name: STATE_DESCRIPTIONS.redux, value: 'redux' },
      { name: STATE_DESCRIPTIONS.jotai, value: 'jotai' },
    ],
  })) as string;

  const testing = (await select({
    message: 'Testing setup:',
    choices: [
      { name: 'Unit + Component + E2E (recommended)', value: 'full' },
      { name: 'Unit + Component only', value: 'unit-component' },
      { name: 'Skip testing', value: 'none' },
    ],
  })) as 'full' | 'unit-component' | 'none';

  let unitRunner: 'vitest' | 'jest' = 'vitest';
  let e2eRunner: 'playwright' | 'cypress' | 'none' = 'playwright';

  if (testing !== 'none') {
    unitRunner = (await select({
      message: 'Unit test runner:',
      choices: [
        { name: TEST_RUNNER_DESCRIPTIONS.vitest, value: 'vitest' },
        { name: TEST_RUNNER_DESCRIPTIONS.jest, value: 'jest' },
      ],
    })) as 'vitest' | 'jest';
  }

  if (testing === 'full') {
    e2eRunner = (await select({
      message: 'E2E testing framework:',
      choices: [
        { name: E2E_RUNNER_DESCRIPTIONS.playwright, value: 'playwright' },
        { name: E2E_RUNNER_DESCRIPTIONS.cypress, value: 'cypress' },
      ],
    })) as 'playwright' | 'cypress';
  }

  const dataFetching = await confirm({
    message: 'Include TanStack Query?',
    default: true,
  });

  const packageManager = (await select({
    message: 'Package manager:',
    choices: [
      { name: 'npm', value: 'npm' },
      { name: 'yarn', value: 'yarn' },
      { name: 'pnpm', value: 'pnpm' },
    ],
  })) as 'npm' | 'yarn' | 'pnpm';

  const git = await confirm({
    message: 'Initialize git repository?',
    default: true,
  });

  const eslint = await confirm({
    message: 'Add ESLint?',
    default: true,
  });

  const prettier = await confirm({
    message: 'Add Prettier?',
    default: true,
  });

  return {
    projectName,
    projectPath,
    runtime,
    language,
    styling,
    stateManagement,
    testing,
    unitRunner,
    e2eRunner,
    dataFetching,
    packageManager,
    git,
    eslint,
    prettier,
  };
}

/**
 * Helper to prompt for confirmation before proceeding
 */
export async function confirmProceed(message: string = 'Proceed?'): Promise<boolean> {
  return await confirm({
    message,
    default: true,
  });
}




