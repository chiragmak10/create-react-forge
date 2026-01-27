import type { ProjectConfig } from '../config/schema.js';

export function generateArchitectureDoc(config: ProjectConfig): string {
  const { runtime, language, styling, stateManagement, dataFetching, testing } = config;

  return `# Project Architecture

## Overview

This project was bootstrapped with \`create-react-forge\` using:

- **Runtime**: ${runtime === 'vite' ? 'Vite (SPA)' : 'Next.js (App Router)'}
- **Language**: ${language === 'typescript' ? 'TypeScript' : 'JavaScript'}
- **Styling**: ${styling.solution}
- **State Management**: ${stateManagement}
- **Data Fetching**: ${dataFetching.enabled ? dataFetching.library : 'None'}
- **Testing**: ${testing.enabled ? 'Enabled' : 'Disabled'}

## Directory Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   └── ui/              # Base UI primitives
├── features/            # Feature-based modules
├── hooks/               # Custom React hooks
${dataFetching.enabled ? '├── lib/                 # Third-party library configs\n' : ''}├── providers/           # React context providers
${stateManagement !== 'none' ? '├── stores/              # State management stores\n' : ''}├── types/               # TypeScript type definitions
└── utils/               # Utility functions
\`\`\`

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., \`UserProfile.tsx\`)
- **Hooks**: camelCase with \`use\` prefix (e.g., \`useAuth.ts\`)
- **Utilities**: camelCase (e.g., \`formatDate.ts\`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., \`constants.ts\`)

### Code
- **Components**: PascalCase
- **Functions**: camelCase
- **Variables**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types/Interfaces**: PascalCase

## Testing Strategy

${testing.enabled ? `
- **Unit Tests**: ${testing.unit.runner}
- **Component Tests**: ${testing.component.library}
${testing.e2e.enabled ? `- **E2E Tests**: ${testing.e2e.runner}` : ''}

Run tests:
\`\`\`bash
npm run test
\`\`\`
` : 'Testing is currently disabled.'}

## Data Fetching

${dataFetching.enabled ? `
We use **${dataFetching.library}** for server state management.

- **Queries**: Located in \`features/*/api/*.queries.ts\` or \`hooks/queries/*.ts\`
- **Mutations**: Co-located with queries
` : 'Standard \`fetch\` or \`axios\` is used for data fetching.'}

## State Management

${stateManagement !== 'none' ? `
We use **${stateManagement}** for global client state.
` : 'Local state (`useState`) is preferred. Global state is managed via Context API if needed.'}
`;
}

