import type { ProjectConfig } from '../config/schema.js';

/**
 * Generate badge URLs for tech stack
 */
function generateBadges(config: ProjectConfig): string {
  const badges: string[] = [];

  // Runtime badge
  if (config.runtime === 'vite') {
    badges.push('![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)');
  } else {
    badges.push('![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)');
  }

  // Language badge
  if (config.language === 'typescript') {
    badges.push('![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)');
  } else {
    badges.push('![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)');
  }

  // Styling badge
  const stylingBadges: Record<string, string> = {
    tailwind: '![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)',
    'styled-components': '![styled-components](https://img.shields.io/badge/styled--components-DB7093?style=flat&logo=styled-components&logoColor=white)',
    'css-modules': '![CSS Modules](https://img.shields.io/badge/CSS_Modules-1572B6?style=flat&logo=css3&logoColor=white)',
    css: '![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat&logo=css3&logoColor=white)',
  };
  if (stylingBadges[config.styling.solution]) {
    badges.push(stylingBadges[config.styling.solution]);
  }

  // State management badge
  const stateBadges: Record<string, string> = {
    redux: '![Redux](https://img.shields.io/badge/Redux-764ABC?style=flat&logo=redux&logoColor=white)',
    zustand: '![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat&logo=react&logoColor=white)',
    jotai: '![Jotai](https://img.shields.io/badge/Jotai-000000?style=flat&logo=react&logoColor=white)',
  };
  if (config.stateManagement !== 'none' && stateBadges[config.stateManagement]) {
    badges.push(stateBadges[config.stateManagement]);
  }

  // Data fetching badge
  if (config.dataFetching.enabled) {
    badges.push('![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat&logo=reactquery&logoColor=white)');
  }

  // Testing badges
  if (config.testing.enabled) {
    const testBadges: Record<string, string> = {
      vitest: '![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)',
      jest: '![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)',
    };
    if (testBadges[config.testing.unit.runner]) {
      badges.push(testBadges[config.testing.unit.runner]);
    }

    if (config.testing.e2e.enabled) {
      const e2eBadges: Record<string, string> = {
        playwright: '![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)',
        cypress: '![Cypress](https://img.shields.io/badge/Cypress-17202C?style=flat&logo=cypress&logoColor=white)',
      };
      if (e2eBadges[config.testing.e2e.runner]) {
        badges.push(e2eBadges[config.testing.e2e.runner]);
      }
    }
  }

  return badges.join(' ');
}

/**
 * Get package manager commands
 */
function getPackageManagerCommands(pm: string): { install: string; dev: string; build: string; test: string } {
  const commands: Record<string, { install: string; dev: string; build: string; test: string }> = {
    npm: {
      install: 'npm install',
      dev: 'npm run dev',
      build: 'npm run build',
      test: 'npm run test',
    },
    yarn: {
      install: 'yarn',
      dev: 'yarn dev',
      build: 'yarn build',
      test: 'yarn test',
    },
    pnpm: {
      install: 'pnpm install',
      dev: 'pnpm dev',
      build: 'pnpm build',
      test: 'pnpm test',
    },
  };
  return commands[pm] || commands.npm;
}

/**
 * Generate scripts table based on config
 */
function generateScriptsTable(config: ProjectConfig): string {
  const pm = config.packageManager;
  const runCmd = pm === 'npm' ? 'npm run' : pm;

  const scripts: Array<{ command: string; description: string }> = [
    { command: `${runCmd} dev`, description: 'Start development server' },
    { command: `${runCmd} build`, description: 'Build for production' },
    { command: `${runCmd} preview`, description: 'Preview production build' },
  ];

  if (config.testing.enabled) {
    scripts.push({ command: `${runCmd} test`, description: 'Run unit tests' });
    scripts.push({ command: `${runCmd} test:watch`, description: 'Run tests in watch mode' });
    scripts.push({ command: `${runCmd} test:coverage`, description: 'Run tests with coverage' });

    if (config.testing.e2e.enabled && config.testing.e2e.runner !== 'none') {
      scripts.push({ command: `${runCmd} test:e2e`, description: 'Run E2E tests' });
    }
  }

  if (config.linting.prettier) {
    scripts.push({ command: `${runCmd} format`, description: 'Format code with Prettier' });
  }

  scripts.push({ command: `${runCmd} lint`, description: 'Lint code' });

  const tableRows = scripts
    .map((s) => `| \`${s.command}\` | ${s.description} |`)
    .join('\n');

  return `| Command | Description |
|---------|-------------|
${tableRows}`;
}

/**
 * Generate project structure section
 */
function generateProjectStructure(config: ProjectConfig): string {
  const isNextjs = config.runtime === 'nextjs';

  let structure = `\`\`\`
${config.name}/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ui/              # Base UI primitives
│   ├── features/            # Feature-based modules
│   ├── hooks/               # Custom React hooks`;

  if (config.dataFetching.enabled) {
    structure += `
│   ├── lib/                 # Third-party library configs`;
  }

  if (config.stateManagement !== 'none') {
    structure += `
│   ├── stores/              # State management stores`;
  }

  structure += `
│   ├── styles/              # Global styles`;

  if (config.language === 'typescript') {
    structure += `
│   └── types/               # TypeScript type definitions`;
  }

  if (isNextjs) {
    structure += `
│   └── app/                 # Next.js App Router pages`;
  }

  if (config.testing.enabled && config.testing.e2e.enabled) {
    structure += `
├── tests/                   # E2E tests`;
  }

  structure += `
├── public/                  # Static assets
└── [config files]           # Configuration files
\`\`\``;

  return structure;
}

/**
 * Generate documentation links based on config
 */
function generateDocLinks(config: ProjectConfig): string {
  const links: string[] = [];

  if (config.runtime === 'vite') {
    links.push('- [Vite Documentation](https://vitejs.dev/)');
    links.push('- [React Router](https://reactrouter.com/)');
  } else {
    links.push('- [Next.js Documentation](https://nextjs.org/docs)');
  }

  links.push('- [React Documentation](https://react.dev/)');

  if (config.language === 'typescript') {
    links.push('- [TypeScript Documentation](https://www.typescriptlang.org/docs/)');
  }

  const stylingDocs: Record<string, string> = {
    tailwind: '- [Tailwind CSS Documentation](https://tailwindcss.com/docs)',
    'styled-components': '- [styled-components Documentation](https://styled-components.com/docs)',
    'css-modules': '- [CSS Modules](https://github.com/css-modules/css-modules)',
  };
  if (stylingDocs[config.styling.solution]) {
    links.push(stylingDocs[config.styling.solution]);
  }

  const stateDocs: Record<string, string> = {
    redux: '- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)',
    zustand: '- [Zustand Documentation](https://zustand-demo.pmnd.rs/)',
    jotai: '- [Jotai Documentation](https://jotai.org/)',
  };
  if (config.stateManagement !== 'none' && stateDocs[config.stateManagement]) {
    links.push(stateDocs[config.stateManagement]);
  }

  if (config.dataFetching.enabled) {
    links.push('- [TanStack Query Documentation](https://tanstack.com/query/latest)');
  }

  if (config.testing.enabled) {
    const testDocs: Record<string, string> = {
      vitest: '- [Vitest Documentation](https://vitest.dev/)',
      jest: '- [Jest Documentation](https://jestjs.io/)',
    };
    if (testDocs[config.testing.unit.runner]) {
      links.push(testDocs[config.testing.unit.runner]);
    }

    links.push('- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)');

    if (config.testing.e2e.enabled) {
      const e2eDocs: Record<string, string> = {
        playwright: '- [Playwright Documentation](https://playwright.dev/)',
        cypress: '- [Cypress Documentation](https://docs.cypress.io/)',
      };
      if (e2eDocs[config.testing.e2e.runner]) {
        links.push(e2eDocs[config.testing.e2e.runner]);
      }
    }
  }

  return links.join('\n');
}

/**
 * Generate a dynamic README.md for the project
 */
export function generateReadme(config: ProjectConfig): string {
  const badges = generateBadges(config);
  const commands = getPackageManagerCommands(config.packageManager);
  const scriptsTable = generateScriptsTable(config);
  const projectStructure = generateProjectStructure(config);
  const docLinks = generateDocLinks(config);

  const runtimeName = config.runtime === 'vite' ? 'Vite' : 'Next.js';
  const description = `A production-ready React application built with ${runtimeName}, scaffolded by create-react-forge.`;

  return `# ${config.name}

${badges}

${description}

## Prerequisites

- Node.js 18.x or higher
- ${config.packageManager}

## Getting Started

1. Install dependencies:

\`\`\`bash
${commands.install}
\`\`\`

2. Start the development server:

\`\`\`bash
${commands.dev}
\`\`\`

3. Open [http://localhost:${config.runtime === 'nextjs' ? '3000' : '5173'}](http://localhost:${config.runtime === 'nextjs' ? '3000' : '5173'}) in your browser.

## Available Scripts

${scriptsTable}

## Project Structure

${projectStructure}

## Tech Stack

- **Runtime**: ${runtimeName}
- **Language**: ${config.language === 'typescript' ? 'TypeScript' : 'JavaScript'}
- **Styling**: ${config.styling.solution}
${config.stateManagement !== 'none' ? `- **State Management**: ${config.stateManagement}\n` : ''}\
${config.dataFetching.enabled ? `- **Data Fetching**: TanStack Query\n` : ''}\
${config.testing.enabled ? `- **Testing**: ${config.testing.unit.runner}${config.testing.e2e.enabled ? ` + ${config.testing.e2e.runner}` : ''}\n` : ''}
## Documentation

${docLinks}

## License

MIT
`;
}
