# react-setup

Production-ready React CLI scaffolder with first-class testing support, flexible runtimes (Vite/Next.js), and composable template system.

## Features

- 🚀 **Vite & Next.js Support** — Choose your runtime
- 🧪 **Testing as First-Class Citizen** — Vitest, Jest, RTL, Playwright, Cypress
- 📦 **Composable Templates** — Modular overlays for features (Tailwind, Redux, TanStack Query)
- 🔌 **Plugin System** — Extend with custom hooks and overlays
- 📊 **Auto-Generated Docs** — Dynamic ARCHITECTURE.md with conventions
- ⚡ **Zero Config** — Smart defaults, minimal prompts

## Quick Start

```bash
npx react-setup
```

## Installation

```bash
npm install -g react-setup
```

## Architecture

This project implements a modular, layered CLI architecture with separation of concerns across CLI, Config, Template, Assembly, and Lifecycle layers.

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

## License

MIT




