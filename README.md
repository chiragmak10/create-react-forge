[![CodeQL Security Analysis](https://github.com/chiragmak10/create-react-forge/actions/workflows/codeql.yml/badge.svg)](https://github.com/chiragmak10/create-react-forge/actions/workflows/codeql.yml) 
[![Release](https://github.com/chiragmak10/create-react-forge/actions/workflows/release.yml/badge.svg)](https://github.com/chiragmak10/create-react-forge/actions/workflows/release.yml)
[![Dependency Review](https://github.com/chiragmak10/create-react-forge/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/chiragmak10/create-react-forge/actions/workflows/dependency-review.yml)
[![CI](https://github.com/chiragmak10/create-react-forge/actions/workflows/ci.yml/badge.svg)](https://github.com/chiragmak10/create-react-forge/actions/workflows/ci.yml)
# create-react-forge

Production-ready React scaffolding CLI with first-class testing, flexible runtimes (Vite/Next.js), and a composable template system inspired by [bulletproof-react](https://github.com/alan2207/bulletproof-react).

## Requirements

- Node.js **>= 20.9.0**

## Quick start

Create a new project (interactive):

```bash
npx create-react-forge@latest
```

Or install globally:

```bash
npm install -g create-react-forge
create-react-forge
```

## What it does

When you run `create-react-forge`, it will:

- Ask a few questions (runtime, language, styling, testing, etc.)
- Generate a new project directory (the directory **must not already exist**)
- Optionally initialize a git repository
- Print the "next steps" commands

Note: it **does not automatically install dependencies** — you'll run your package manager install after generation.

## Interactive prompts

The CLI is **prompt-driven**. You'll choose:

- **Project name** (lowercase letters/numbers/hyphens)
- **Project directory**
- **Runtime**: Vite or Next.js
- **Language**: TypeScript or JavaScript
- **Styling**: Vite uses Styled Components (auto-selected); Next.js offers Tailwind CSS or None (plain CSS)
- **State**: none, Zustand, Jotai, or Redux Toolkit
- **Testing**: full (unit+component+E2E), unit+component only, or none
- **Unit runner**: Vitest or Jest (if testing enabled)
- **E2E runner**: Playwright or Cypress (if full testing)
- **Data fetching**: include TanStack Query
- **Package manager**: npm / yarn / pnpm
- **Git init**: yes/no

## What you get

A production-ready React project with a scalable, feature-based structure:

```
my-app/
├── src/
│   ├── app/              # App setup (providers, router)
│   ├── components/       # Shared UI components
│   │   ├── ui/           # Base UI primitives
│   │   └── errors/       # Error boundaries & fallbacks
│   ├── features/         # Feature-based modules
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities, API client
│   ├── stores/           # State management (if selected)
│   ├── styles/           # Global styles
│   ├── testing/          # Test utilities, mocks (if selected)
│   └── types/            # Shared types
├── tests/                # E2E tests (if selected)
├── README.md             # Auto-generated project README
├── ARCHITECTURE.md       # Auto-generated architecture docs
└── [config files]
```

## Configuration options

| Category | Choices |
|---|---|
| **Runtime** | `vite`, `nextjs` |
| **Language** | `typescript`, `javascript` |
| **Styling** | Vite: `styled-components` (auto), Next.js: `tailwind` or `none` |
| **State** | `none`, `zustand`, `jotai`, `redux` |
| **Testing** | `full`, `unit-component`, `none` |
| **Unit runner** | `vitest`, `jest` |
| **E2E runner** | `playwright`, `cypress` |
| **Data fetching** | TanStack Query on/off |
| **Package manager** | `npm`, `yarn`, `pnpm` |
| **Git** | init on/off |

## Dependency versions

The CLI uses pinned, tested versions for all dependencies:

| Package | Version |
|---|---|
| React | ^19.0.0 |
| Vite | ^6.0.7 |
| Next.js | ^16.1.6 |
| Tailwind CSS | ^4.0.0 |
| TanStack Query | ^5.62.10 |
| Vitest | ^2.1.8 |
| Playwright | ^1.49.1 |
| TypeScript | ^5.7.2 |

## Screenshot

<img width="709" height="1047" alt="image" src="https://github.com/user-attachments/assets/dc8956a9-473b-4001-8c2d-0b3b54f29583" />

## Next steps (after generation)

```bash
cd <your-project>
npm install
npm run dev
```

## Advanced: API exports

This package exposes advanced entrypoints for tooling integration:

### Config schema (Zod)

```ts
import { ProjectConfigSchema, DEFAULT_CONFIG } from 'create-react-forge/config';

const parsed = ProjectConfigSchema.parse(DEFAULT_CONFIG);
```

### Template registry

```ts
import { TemplateRegistry } from 'create-react-forge/templates';

const registry = new TemplateRegistry();
const templates = registry.loadTemplatesForConfig({
  runtime: 'vite',
  styling: { solution: 'styled-components' },
  stateManagement: 'zustand',
  testing: { enabled: true, unit: { runner: 'vitest' }, e2e: { enabled: true, runner: 'playwright' } },
  dataFetching: { enabled: true },
});
```

## Troubleshooting

- **"Directory already exists"**: pick a new project directory (or delete the existing folder).
- **Node version issues**: ensure `node -v` is **20.9.0+**.
- **Install step**: dependencies are not installed automatically — run your package manager install in the generated folder.

## Architecture & development

See [ARCHITECTURE.md](./ARCHITECTURE.md) for internal design details.

```bash
npm install
npm run dev       # Run CLI in development
npm run test      # Run tests
npm run build     # Build to dist/
```

## License

MIT
