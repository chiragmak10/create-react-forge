<img width="1536" height="1024" alt="create-react-forge-image" src="https://github.com/user-attachments/assets/28bb7771-facd-4bee-84b1-e8de2892acbf" />

<br><br>

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
- **Styling**: Tailwind, Styled Components, CSS Modules, or Plain CSS (Vite offers all 4; Next.js auto-selects Tailwind)
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
│   └── types/            # Shared types (TypeScript projects)
├── tests/                # E2E tests (if selected)
├── README.md             # Auto-generated project README
├── ARCHITECTURE.md       # Auto-generated architecture docs
└── [config files]
```

For JavaScript projects, TypeScript-only files are omitted automatically.

## Configuration options

| Category            | Choices                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **Runtime**         | `vite`, `nextjs`                                                                            |
| **Language**        | `typescript`, `javascript`                                                                  |
| **Styling**         | `tailwind`, `styled-components`, `css-modules`, `css` (Vite: all 4, Next.js: tailwind only) |
| **State**           | `none`, `zustand`, `jotai`, `redux`                                                         |
| **Testing**         | `full`, `unit-component`, `none`                                                            |
| **Unit runner**     | `vitest`, `jest`                                                                            |
| **E2E runner**      | `playwright`, `cypress`                                                                     |
| **Data fetching**   | TanStack Query on/off                                                                       |
| **Package manager** | `npm`, `yarn`, `pnpm`                                                                       |
| **Git**             | init on/off                                                                                 |

## Dependency versions

The CLI uses pinned, tested versions for all dependencies:

| Package        | Version  |
| -------------- | -------- |
| React          | ^19.0.0  |
| Vite           | ^6.0.7   |
| Next.js        | ^16.1.6  |
| Tailwind CSS   | ^4.0.0   |
| TanStack Query | ^5.62.10 |
| Vitest         | ^2.1.8   |
| Playwright     | ^1.49.1  |
| TypeScript     | ^5.7.2   |

## Automated dependency updates

This repo now uses Renovate to auto-update dependencies (including template manifests under `src/templates/overlays/**/manifest.json`, `src/dependencies/resolver.ts`, selected dependency fixtures in `src/__tests__/*.test.ts`, the dependency versions table in this README, and the dependency registry snippet in `ARCHITECTURE.md`). The workflow runs weekly and can also be run manually.

### One-time setup

1. Create a repository secret named `RENOVATE_TOKEN`.
2. Use a fine-grained GitHub token scoped to this repository with:
   - Contents: Read and write
   - Pull requests: Read and write
3. Enable repository auto-merge in GitHub settings.
4. Protect `master`, require CI checks before merge, and enable merge queue.

Why: PRs created with `GITHUB_TOKEN` do not trigger downstream `pull_request` workflows. Using `RENOVATE_TOKEN` ensures CI checks run and automerge can complete.

Workflow file: `.github/workflows/renovate.yml`  
Config file: `renovate.json`

Behavior:

- Renovate runs with strict concurrency (`prConcurrentLimit` and `branchConcurrentLimit` set to `1`) so only one dependency PR is active at a time.
- Renovate disables major/minor/patch stream separation so updates stay in a single grouped PR flow.
- Renovate waits for release-age stability checks (`minimumReleaseAge: 30 days`) before opening PRs and ignores unstable pre-release versions.
- Npm updates are grouped into a single dependency PR stream.
- Minor/patch/pin/digest npm updates auto-merge after checks pass.
- Major npm updates require manual approval from the dependency dashboard.
- Lock file maintenance runs weekly and auto-merges after checks pass.
- Renovate automatically rebases dependency PRs when they fall behind `master`.
- Custom regex managers keep template manifests, the resolver registry, selected test dependency fixtures, README dependency rows, and ARCHITECTURE dependency rows in sync.

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
  testing: {
    enabled: true,
    unit: { runner: 'vitest' },
    e2e: { enabled: true, runner: 'playwright' },
  },
  dataFetching: { enabled: true },
});
```

## Cross-Platform Support

This project is tested across **Windows, macOS, and Linux** using GitHub Actions CI/CD pipeline. Every pull request runs on all three platforms with Node 20.x and 22.x to ensure consistent user experience.

See [CROSS_PLATFORM_TESTING.md](./CROSS_PLATFORM_TESTING.md) for detailed testing strategy and local testing instructions.

## Troubleshooting

- **"Directory already exists"**: pick a new project directory (or delete the existing folder).
- **Node version issues**: ensure `node -v` is **20.9.0+**.
- **Install step**: dependencies are not installed automatically — you'll run your package manager install after generation.
- **Module resolution errors**: if you see "Cannot find package" errors, try `npm install` to reinstall dependencies and clear npm cache.

## Architecture & development

See [ARCHITECTURE.md](./ARCHITECTURE.md) for internal design details.

```bash
npm install
npm run dev       # Run CLI in development
npm run test      # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run with coverage report
npm run build     # Build to dist/
```

## License

MIT
