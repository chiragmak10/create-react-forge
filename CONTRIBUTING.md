# Contributing to react-setup

Thank you for your interest in contributing to react-setup! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Adding New Templates](#adding-new-templates)

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/react-bootstrap.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

```bash
# Install dependencies
npm install

# Run CLI in development mode
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build the project
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── cli/                 # CLI entry point and prompts
│   ├── index.ts         # Main CLI orchestration
│   ├── parser.ts        # Commander.js argument parser
│   └── prompts.ts       # Interactive prompts
├── config/              # Configuration management
│   ├── schema.ts        # Zod schemas and types
│   ├── builder.ts       # Fluent ConfigBuilder API
│   └── defaults.ts      # Default values
├── templates/           # Template system
│   ├── registry.ts      # Template loading and merging
│   ├── utils.ts         # Path utilities
│   └── overlays/        # Template files
│       ├── base/        # Shared components
│       ├── runtime/     # Vite, Next.js
│       ├── styling/     # Tailwind, CSS Modules
│       ├── state/       # Zustand, Redux
│       ├── testing/     # Vitest, Playwright
│       └── features/    # TanStack Query
├── assembler/           # File assembly and writing
├── generator/           # Project generation orchestration
├── dependencies/        # Dependency resolution
└── testing/             # Test configuration
```

## Making Changes

### Coding Standards

- Use TypeScript with strict mode
- Follow existing code patterns and conventions
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add new styling template for Sass
fix: resolve path issue in template loading
docs: update README with new options
test: add integration tests for generator
```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

## Testing

All changes should include appropriate tests.

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- config-builder

# Run with coverage
npm run test:coverage
```

### Test Structure

- Unit tests: `src/__tests__/*.test.ts`
- Integration tests: `src/__tests__/integration/*.test.ts`

## Submitting a Pull Request

1. Ensure all tests pass: `npm run test`
2. Ensure code is formatted: `npm run format`
3. Ensure no lint errors: `npm run lint`
4. Update documentation if needed
5. Push your branch and open a PR
6. Fill out the PR template with details about your changes

## Adding New Templates

Templates follow the [bulletproof-react](https://github.com/alan2207/bulletproof-react) architecture.

### Template Structure

```
src/templates/overlays/[category]/[template-name]/
├── manifest.json        # Template metadata and dependencies
└── src/                 # Template files (copied to generated project)
```

### Manifest Format

```json
{
  "name": "template-name",
  "version": "1.0.0",
  "description": "Template description",
  "compatibleWith": ["runtime-vite", "runtime-nextjs"],
  "dependencies": {
    "package-name": "^1.0.0"
  },
  "devDependencies": {
    "dev-package": "^1.0.0"
  },
  "scripts": {
    "script-name": "command"
  }
}
```

### Steps to Add a Template

1. Create directory under appropriate category in `src/templates/overlays/`
2. Create `manifest.json` with dependencies and scripts
3. Add template files following bulletproof-react patterns
4. Update `src/templates/registry.ts` if needed for special handling
5. Add tests for the new template
6. Update documentation

## Questions?

If you have questions, please:
1. Check existing issues and discussions
2. Read the [ARCHITECTURE.md](./ARCHITECTURE.md) for design context
3. Open an issue with your question

Thank you for contributing!

