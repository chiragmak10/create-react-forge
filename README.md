# create-react-forge

Production-ready React scaffolding CLI with first-class testing, flexible runtimes (Vite/Next.js), and a composable template system inspired by [bulletproof-react](https://github.com/alan2207/bulletproof-react).

## Requirements

- Node.js **>= 18**

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
- Optionally initialize a git repo (depending on your answers)
- Print the “next steps” commands

Note: it **does not automatically install dependencies** — you’ll run your package manager install after generation.

## Interactive prompts (current)

The CLI is currently **prompt-driven**. You’ll choose:

- **Project name** (lowercase letters/numbers/hyphens)
- **Project directory**
- **Runtime**: Vite or Next.js
- **Language**: TypeScript or JavaScript
- **Styling**: Tailwind, CSS, Styled Components, or CSS Modules
- **State**: none, Zustand, or Redux Toolkit
- **Testing**: full (unit+component+E2E), unit+component only, or none
- **Unit runner**: Vitest or Jest (if testing enabled)
- **E2E runner**: Playwright or Cypress (if full testing)
- **Data fetching**: include TanStack Query
- **Package manager**: npm / yarn / pnpm
- **Git init**: yes/no
- **Prettier**: yes/no

## What you get

A production-ready React project with a scalable, feature-based structure:

```
my-app/
├── src/
│   ├── app/              # App setup (providers, router)
│   ├── components/       # Shared UI components
│   ├── features/         # Feature-based modules
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities, API client
│   ├── stores/           # State management (if selected)
│   ├── testing/          # Test utilities, mocks (if selected)
│   └── types/            # Shared types
├── tests/                # E2E tests (if selected)
└── [config files]
```

## Configuration options (summary)

| Category | Choices |
|---|---|
| **Runtime** | `vite`, `nextjs` |
| **Language** | `typescript`, `javascript` |
| **Styling** | `tailwind`, `css`, `styled-components`, `css-modules` |
| **State** | `none`, `zustand`, `redux` |
| **Testing** | `full`, `unit-component`, `none` |
| **Unit runner** | `vitest`, `jest` |
| **E2E runner** | `playwright`, `cypress` |
| **Data fetching** | TanStack Query on/off |
| **Package manager** | `npm`, `yarn`, `pnpm` |
| **Formatting** | Prettier on/off |
| **Git** | init on/off |

## Screenshot
<img width="709" height="1047" alt="image" src="https://github.com/user-attachments/assets/dc8956a9-473b-4001-8c2d-0b3b54f29583" />

## Next steps (after generation)

```bash
cd <your-project>
npm install
npm run dev
```

## Advanced: config schema & templates API

This package exposes a couple of **advanced** entrypoints intended for tooling:

### Config schema (Zod)

```ts
import { ProjectConfigSchema, DEFAULT_CONFIG } from 'create-react-forge/config';

const parsed = ProjectConfigSchema.parse(DEFAULT_CONFIG);
```

### Template registry

```ts
import { TemplateRegistry } from 'create-react-forge/templates';

const registry = new TemplateRegistry();
// registry.loadTemplatesForConfig(...) etc.
```

## Troubleshooting

- **“Directory already exists”**: pick a new project directory (or delete the existing folder).
- **Node version issues**: ensure `node -v` is **18+**.
- **Install step**: dependencies are not installed automatically — run your package manager install in the generated folder.

## Architecture & development

See [ARCHITECTURE.md](https://github.com/chiragmak10/react-setup/blob/master/ARCHITECTURE.md) for internal design details.

```bash
npm install
npm run dev
npm run test
npm run build
```

## License

MIT
