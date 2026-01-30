import { DEFAULT_CONFIG } from './schema.js';

export const DEFAULTS = DEFAULT_CONFIG;

export const RUNTIME_DESCRIPTIONS: Record<string, string> = {
  vite: 'Vite - Fast SPA with excellent dev experience',
  nextjs: 'Next.js - Full-stack with SSR and API routes',
};

export const STYLING_DESCRIPTIONS: Record<string, string> = {
  css: 'Plain CSS with CSS modules',
  tailwind: 'Tailwind CSS - Utility-first framework',
  'styled-components': 'Styled Components - CSS-in-JS',
  'css-modules': 'CSS Modules - Scoped styling',
};

export const STATE_DESCRIPTIONS: Record<string, string> = {
  none: 'No state management',
  redux: 'Redux Toolkit - Predictable state container',
  zustand: 'Zustand - Lightweight state management',
  jotai: 'Jotai - Primitive and flexible state management',
};

export const TEST_RUNNER_DESCRIPTIONS: Record<string, string> = {
  vitest: 'Vitest - Lightning-fast unit tests',
  jest: 'Jest - Battle-tested test runner',
};

export const E2E_RUNNER_DESCRIPTIONS: Record<string, string> = {
  playwright: 'Playwright - Cross-browser E2E testing',
  cypress: 'Cypress - Developer-friendly E2E testing',
  none: 'Skip E2E testing setup',
};

export const PACKAGE_MANAGER_COMMANDS: Record<string, { install: string; exec: string }> = {
  npm: {
    install: 'npm install',
    exec: 'npm exec',
  },
  yarn: {
    install: 'yarn install',
    exec: 'yarn exec',
  },
  pnpm: {
    install: 'pnpm install',
    exec: 'pnpm exec',
  },
};




