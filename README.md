# react-setup

Production-ready React CLI scaffolder with first-class testing support, flexible runtimes (Vite/Next.js), and a composable template system based on [bulletproof-react](https://github.com/alan2207/bulletproof-react) architecture.

## Features

- 🚀 **Vite & Next.js Support** — Choose your runtime
- 🧪 **Testing as First-Class Citizen** — Vitest, Jest, React Testing Library, Playwright, Cypress
- 🎨 **Flexible Styling** — Tailwind CSS, CSS Modules, or plain CSS
- 📦 **State Management** — Zustand or Redux Toolkit
- 🔄 **Data Fetching** — TanStack Query with DevTools
- 📁 **Feature-Based Architecture** — Scalable project structure
- ⚡ **Zero Config** — Smart defaults, minimal prompts

## Quick Start

```bash
npx react-setup
```

Or install globally:

```bash
npm install -g react-setup
react-setup
```

## What You Get

A production-ready React project with:

```
my-app/
├── src/
│   ├── app/              # App setup (providers, router)
│   ├── components/       # Shared UI components
│   ├── features/         # Feature-based modules
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities, API client
│   ├── stores/           # State management
│   ├── testing/          # Test utilities, mocks
│   └── types/            # TypeScript types
├── tests/                # E2E tests
└── [config files]
```

## Configuration Options

| Option | Choices |
|--------|---------|
| **Runtime** | Vite, Next.js |
| **Language** | TypeScript, JavaScript |
| **Styling** | Tailwind, CSS Modules, CSS |
| **State** | Zustand, Redux, None |
| **Data Fetching** | TanStack Query, None |
| **Unit Testing** | Vitest, Jest |
| **E2E Testing** | Playwright, Cypress, None |
| **Package Manager** | npm, yarn, pnpm |

## Architecture

This project implements a modular, layered CLI architecture. Generated projects follow the [bulletproof-react](https://github.com/alan2207/bulletproof-react) patterns:

- Feature-based folder structure
- Co-located tests with features
- Centralized API client
- Type-safe throughout

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design documentation.

## Development

```bash
# Install dependencies
npm install

# Run CLI in dev mode
npm run dev

# Run tests
npm run test
npm run test:watch

# Build for production
npm run build
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## Related Projects

- [bulletproof-react](https://github.com/alan2207/bulletproof-react) — Architecture reference
- [Vite](https://vitejs.dev/) — Build tool
- [Next.js](https://nextjs.org/) — React framework
- [TanStack Query](https://tanstack.com/query) — Data fetching

## License

MIT
