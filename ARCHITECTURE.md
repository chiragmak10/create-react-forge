# create-react-forge Architecture

## Overview

create-react-forge is a modular, layered CLI tool for scaffolding production-ready React applications. The architecture prioritizes separation of concerns, testability, and extensibility through a composable template system.

## Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLI Entry Point                    │
│                      (src/index.ts)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    CLI Layer                            │
│  (parser, prompts, interactive user input handling)    │
│  Location: src/cli/                                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Config Layer                           │
│  (schema, validation, builder, configuration)          │
│  Location: src/config/                                 │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 Generator Layer                         │
│  (orchestrates full project generation flow)           │
│  Location: src/generator/                              │
└──────────────────────┬──────────────────────────────────┘
                       │
      ┌────────────────┼────────────────┬────────────────┐
      │                │                │                │
   ┌──▼──┐        ┌────▼─────┐    ┌────▼──────┐   ┌─────▼─────┐
   │Templ.│        │Assembler │    │Dependency │   │  Plugins  │
   │Layer │        │Layer     │    │Layer      │   │  Layer    │
   └──┬───┘        └────┬─────┘    └─────┬─────┘   └─────┬─────┘
      │                 │                │               │
      └─────────────────┼────────────────┴───────────────┘
                        │
   ┌────────────────────▼────────────────────────────────┐
   │              Lifecycle Layer                        │
   │  (dependency installation, post-generation tasks)  │
   │  Location: src/lifecycle/                          │
   └─────────────────────────────────────────────────────┘
                        │
   ┌────────────────────▼────────────────────────────────┐
   │                 Docs Layer                          │
   │  (auto-generates README.md & ARCHITECTURE.md)      │
   │  Location: src/docs/                               │
   └─────────────────────────────────────────────────────┘
```

## Module Breakdown

### 1. CLI Layer (`src/cli/`)

**Responsibility**: Parse user input and collect project preferences through interactive prompts.

#### Files:

- **parser.ts** — Commander.js CLI argument parser
  - Defines CLI command structure
  - Registers all available options and flags
  - Handles version detection from package.json
- **prompts.ts** — @inquirer/prompts interactive prompts
  - 12+ prompts for user configuration
  - Validation logic (e.g., project name format)
  - Returns structured PromptAnswers
- **index.ts** — Main CLI orchestration
  - Converts user input to ProjectConfig via ConfigBuilder
  - Validates configuration with Zod
  - Displays summary
  - Invokes ProjectGenerator
  - Error handling and user feedback

**Input**: User selections (interactive prompts)
**Output**: ProjectConfig object ready for generation

---

### 2. Configuration Layer (`src/config/`)

**Responsibility**: Define, validate, and manage project configuration.

#### Files:

- **schema.ts** — Zod type definitions
  - ProjectConfig interface with all options
  - Individual schemas for each config aspect (Runtime, Language, Styling, etc.)
  - DEFAULT_CONFIG preset
  - Type exports for TypeScript support
- **builder.ts** — ConfigBuilder class (fluent API)
  - Fluent chainable methods for setting config
  - Validation with Zod
  - Config merging utilities
  - `.build()` returns validated ProjectConfig
  - `.validate()` returns validation result
- **defaults.ts** — Constants and descriptions
  - Default values for all config options
  - User-friendly descriptions for CLI display
  - Package manager command mappings

**Key Interfaces**:

```typescript
interface ProjectConfig {
  name: string;
  path: string;
  runtime: 'vite' | 'nextjs';
  language: 'javascript' | 'typescript';
  styling: { solution: 'css' | 'tailwind' | 'styled-components' | 'css-modules' };
  stateManagement: 'none' | 'redux' | 'zustand' | 'jotai';
  testing: TestingConfig;
  dataFetching: DataFetchingConfig;
  linting: LintingConfig;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  git: GitConfig;
  plugins: PluginConfig[];
}
```

---

### 3. Generator Layer (`src/generator/`)

**Responsibility**: Orchestrate the entire project generation flow.

#### Files:

- **index.ts** — ProjectGenerator class
  - Validates directory doesn't exist
  - Loads templates via TemplateRegistry
  - Merges files from all applicable templates
  - Generates ARCHITECTURE.md documentation
  - Writes files via ProjectAssembler
  - Initializes git repository (optional)
  - Returns GenerationResult with success/errors/warnings

**Generation Flow**:

```
1. Check if directory exists → fail if yes
2. Load templates based on config
3. Merge all template files
4. Generate README.md and ARCHITECTURE.md for the project
5. Merge dependencies and scripts
6. Write files to disk
7. Initialize git (optional)
8. Display next steps
```

---

### 4. Template Layer (`src/templates/`)

**Responsibility**: Manage template overlays and file composition strategy.

#### Files:

- **registry.ts** — TemplateRegistry class
  - Template registration and discovery
  - Manifest loading and parsing
  - Dependency aggregation from multiple templates
  - Script merging across templates
  - Binary file handling (images, fonts)
  - `loadTemplatesForConfig()` selects applicable templates
- **utils.ts** — Template utility functions
  - Path resolution for runtime-specific templates
  - Styling/state/testing template lookup

**Template Structure**:

```
src/templates/overlays/
├── base/                    # Core React files (components, hooks, lib, types)
├── runtime/
│   ├── vite/               # Vite-specific config and entry point
│   └── nextjs/             # Next.js App Router structure
├── styling/
│   ├── tailwind/           # Tailwind CSS v4 setup
│   ├── css-modules/        # CSS Modules configuration
│   └── styled-components/  # styled-components setup
├── state/
│   ├── redux/              # Redux Toolkit store structure
│   ├── zustand/            # Zustand store setup
│   └── jotai/              # Jotai atomic state management
├── features/
│   └── tanstack-query/     # TanStack Query + hooks pattern
├── testing/
│   ├── vitest/             # Vitest + Testing Library setup
│   ├── jest/               # Jest + Testing Library setup
│   └── playwright/         # Playwright E2E config
└── tooling/
    └── storybook/          # Storybook setup (future)
```

**Key Data Structure**:

```typescript
interface TemplateOverlay {
  name: string;
  path: string;
  manifest: TemplateManifest;
  files: Map<string, string>;
}

interface TemplateManifest {
  name: string;
  version: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  filePatterns?: { include?: string[]; exclude?: string[] };
}
```

**Template Layers** (composable, order matters):

1. **Base** — Core React files (components, hooks, lib, types)
2. **Runtime** — Vite or Next.js specific configs
3. **Styling** — Tailwind/CSS/Styled Components setup
4. **State** — Redux/Zustand/Jotai store setup
5. **Features** — TanStack Query, etc.
6. **Testing** — Vitest/Jest + RTL + Playwright

---

### 5. Assembly Layer (`src/assembler/`)

**Responsibility**: Merge configurations and write files to disk.

#### Files:

- **index.ts** — ProjectAssembler class
  - File registration system with template variable substitution
  - Package.json construction and dependency management
  - Directory creation
  - Binary file copying
  - Atomic file system operations
- **merger.ts** — ConfigMerger class
  - Deep merge objects with Deepmerge
  - Smart package.json merging:
    - Scripts concatenation
    - Dependencies deduplication
    - Arrays flattened with dedup
  - Strategy-based merging for different config types

**Template Variables**:

```typescript
{{PROJECT_NAME}}         → config.name
{{PROJECT_DESCRIPTION}}  → 'A production-ready React application'
{{AUTHOR}}               → ''
{{LICENSE}}              → 'MIT'
```

---

### 6. Dependency Layer (`src/dependencies/`)

**Responsibility**: Resolve, deduplicate, and version-pin dependencies.

#### Files:

- **resolver.ts** — DependencyResolver class
  - VERSION_REGISTRY with 30+ pinned versions
  - Aggregates dependencies from multiple sources
  - Detects version conflicts
  - Applies version pinning strategy
  - Separates dev vs. production dependencies

**Version Registry** (current):

```typescript
{
  // Runtime
  'vite': '^7.0.0',
  '@vitejs/plugin-react': '^5.0.0',
  'next': '^16.1.6',
  'react': '^19.0.0',
  'react-dom': '^19.0.0',

  // Language
  'typescript': '^5.7.2',

  // Styling
  'tailwindcss': '^4.0.0',
  '@tailwindcss/postcss': '^4.0.0',
  'styled-components': '^6.1.14',

  // State
  '@reduxjs/toolkit': '^2.5.0',
  'react-redux': '^9.2.0',
  'zustand': '^5.0.3',
  'jotai': '^2.10.0',

  // Data Fetching
  '@tanstack/react-query': '^5.62.10',
  '@tanstack/react-query-devtools': '^5.62.10',

  // Testing
  'vitest': '^4.0.0',
  '@vitest/ui': '^4.0.0',
  '@testing-library/react': '^16.1.0',
  '@playwright/test': '^1.49.1',

  // Routing
  'react-router-dom': '^7.1.1',
  'react-error-boundary': '^6.0.0',
}
```

**Conflict Handling**:

- Detects when different versions requested
- Reports conflicts but still resolves (later version wins)
- Prevents duplicate versions in final output

---

### 7. Plugin Layer (`src/plugins/`)

**Responsibility**: Extensibility through lifecycle hooks.

#### Files:

- **types.ts** — Plugin interface definitions
- **loader.ts** — PluginLoader class for dynamic imports
- **manager.ts** — PluginManager class for hook execution
- **index.ts** — Public exports

**Plugin Interface**:

```typescript
interface ReactSetupPlugin {
  name: string;
  version: string;
  hooks?: {
    beforeCreate?: (config: ProjectConfig) => Promise<ProjectConfig | void>;
    afterTemplateApply?: (context: PluginContext) => Promise<void>;
    beforeInstall?: (context: PluginContext) => Promise<void>;
    afterInstall?: (context: PluginContext) => Promise<void>;
  };
}

interface PluginContext {
  config: ProjectConfig;
  assembler?: ProjectAssembler;
}
```

---

### 8. Lifecycle Layer (`src/lifecycle/`)

**Responsibility**: Handle post-generation tasks.

#### Files:

- **installer.ts** — Dependency installation with execa
  - Supports npm, yarn, pnpm
  - Progress spinner with ora
- **index.ts** — Public exports

---

### 9. Docs Layer (`src/docs/`)

**Responsibility**: Generate documentation for created projects.

#### Files:

- **readme-generator.ts** — Generates README.md
  - Dynamic project-specific README with tech stack badges
  - Package manager-specific commands
  - Available scripts table
  - Project structure overview
  - Documentation links based on config
- **architecture-generator.ts** — Generates ARCHITECTURE.md
  - Creates project-specific documentation
  - Documents selected configuration
  - Includes directory structure
  - Naming conventions
  - Testing strategy
- **index.ts** — Public exports

---

### 10. Testing Layer (`src/testing/`)

**Responsibility**: Configure testing setup and generate test scripts.

#### Files:

- **configurer.ts** — TestingConfigurer class
  - Selects appropriate test runners based on runtime
  - Generates npm scripts for testing
  - Creates test configuration files
  - Supports multiple runners: Vitest, Jest, Playwright, Cypress

**Generated Scripts**:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

---

## Template Source: Bulletproof React

Generated projects follow the architecture patterns from [bulletproof-react](https://github.com/alan2207/bulletproof-react) — a battle-tested, scalable React application architecture with 34k+ GitHub stars.

### Why Bulletproof React?

- **Production-proven** — Used by thousands of developers in real applications
- **Scalable structure** — Feature-based organization that scales with team size
- **Best practices** — Implements React community standards and patterns
- **Comprehensive** — Covers API layer, state, testing, error handling, security

### Generated Project Structure

```
my-app/
├── src/
│   ├── app/                    # App-level configuration
│   │   ├── provider.tsx        # App providers (React Query, Router, etc.)
│   │   ├── router.tsx          # Route definitions
│   │   └── main.tsx            # App entry point
│   │
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # Base UI primitives (Button, Input, etc.)
│   │   └── errors/             # Error boundaries and fallbacks
│   │
│   ├── features/               # Feature-based modules
│   │   ├── users/              # Example feature
│   │   │   └── api/            # API calls for feature
│   │   └── [feature]/          # Other features follow same pattern
│   │
│   ├── hooks/                  # Shared custom hooks
│   │   ├── use-disclosure.ts
│   │   └── use-local-storage.ts
│   │
│   ├── lib/                    # Utilities and configurations
│   │   ├── api-client.ts       # Fetch/axios wrapper
│   │   ├── utils.ts            # General utilities
│   │   └── react-query.ts      # Query client (if enabled)
│   │
│   ├── stores/                 # Global state (if applicable)
│   │   ├── auth.ts
│   │   └── notifications.ts
│   │
│   ├── styles/                 # Global styles
│   │   └── globals.css
│   │
│   ├── testing/                # Test utilities and mocks
│   │   ├── mocks/              # MSW handlers, test data
│   │   ├── setup.ts            # Test setup file
│   │   └── test-utils.tsx      # Custom render, providers
│   │
│   └── types/                  # Shared TypeScript types
│       └── api.ts
│
├── tests/                      # E2E tests (Playwright/Cypress)
│   └── e2e/
│
├── public/                     # Static assets
├── ARCHITECTURE.md             # Auto-generated project docs
├── index.html                  # (Vite) or app/ (Next.js)
└── [config files]              # vite.config.ts, tsconfig.json, etc.
```

### Key Patterns Adopted

1. **Feature-First Organization**
   - Each feature is self-contained with its own API, components, hooks
   - Promotes code colocation and easier refactoring
   - Clear boundaries between features

2. **API Layer Abstraction**
   - Centralized API client with interceptors
   - Type-safe request/response handling
   - Easy to swap HTTP libraries

3. **Co-located Tests**
   - Unit tests live alongside source files
   - Feature tests within feature folders
   - Shared test utilities in `src/testing/`

4. **Type Safety Throughout**
   - Strict TypeScript configuration
   - Typed API responses
   - Zod validation for runtime checks

5. **Error Boundaries**
   - React error boundaries at strategic points
   - Fallback UI components
   - Error reporting integration ready

---

## Data Flow

### Project Generation Flow

```
User Input (Interactive Prompts)
    ↓
Parse & Validate Project Name
    ↓
Collect All Configuration Options
    ↓
Convert to ProjectConfig (ConfigBuilder)
    ↓
Validate with Zod
    ↓
Display Configuration Summary
    ↓
Create ProjectGenerator
    ↓
Load Template Overlays (TemplateRegistry)
    ↓
Merge All Template Files
    ↓
Generate README.md & ARCHITECTURE.md
    ↓
Aggregate Dependencies (from manifests)
    ↓
Create ProjectAssembler with Files
    ↓
Write to Disk (atomic operations)
    ↓
Initialize Git (optional)
    ↓
Display Next Steps
    ↓
Success!
```

---

## Module Dependencies

```
src/index.ts
  └─ cli/index.ts
      ├─ cli/parser.ts (Commander)
      ├─ cli/prompts.ts (@inquirer/prompts)
      ├─ config/builder.ts
      │   └─ config/schema.ts (Zod)
      └─ generator/index.ts
          ├─ templates/registry.ts
          ├─ assembler/index.ts
          ├─ docs/architecture-generator.ts
          └─ (plugins/manager.ts)

config/builder.ts
  └─ config/schema.ts
      └─ config/defaults.ts

templates/registry.ts
  └─ (loads overlays from filesystem)

assembler/index.ts
  └─ config/schema.ts

assembler/merger.ts
  └─ deepmerge (3rd party)

dependencies/resolver.ts
  └─ VERSION_REGISTRY (constant)

plugins/manager.ts
  └─ plugins/types.ts

lifecycle/installer.ts
  └─ execa, ora

docs/architecture-generator.ts
  └─ config/schema.ts
```

---

## Key Design Patterns

### 1. Fluent Builder Pattern

```typescript
const config = new ConfigBuilder()
  .setName('my-app')
  .setRuntime('vite')
  .setLanguage('typescript')
  .setStyling('tailwind')
  .build();
```

### 2. Composition Over Inheritance

Templates are composable layers that merge, not inherited class hierarchies.

### 3. Validation at Boundaries

Zod validates user input at CLI entry, preventing invalid states downstream.

### 4. Registry Pattern

TemplateRegistry and VERSION_REGISTRY provide centralized lookup and management.

### 5. Strategy Pattern

ConfigMerger uses different strategies for different config types (arrays, objects, primitives).

### 6. Hook-Based Plugins

Plugins can intercept generation at defined lifecycle points.

---

## Testing Strategy

### Test Organization

- Unit tests in `src/__tests__/`
- Integration tests in `src/__tests__/integration/`
- Each module has corresponding test file

### Test Files

```
src/__tests__/
├── config-builder.test.ts
├── config-merger.test.ts
├── dependency-resolver.test.ts
├── testing-configurer.test.ts
└── integration/
    ├── build-verification.test.ts
    ├── generator.test.ts
    ├── package-json.test.ts
    ├── scenarios.test.ts
    ├── styling-verification.test.ts
    └── template-loading.test.ts
```

### Running Tests

```bash
npm run test              # Run all tests once
npm run test:watch       # Watch mode
npm run test:ui          # Vitest UI dashboard
npm run test:coverage    # Coverage report
```

---

## Configuration Options

### Runtime

- `vite` — Vite SPA with React Router (default)
- `nextjs` — Next.js App Router

### Language

- `typescript` — Recommended, full type safety
- `javascript` — For simple projects

### Styling

Options are conditional based on runtime:

**Vite (4 options)**:

- `tailwind` — Tailwind CSS v4 (recommended)
- `styled-components` — CSS-in-JS
- `css-modules` — Scoped CSS
- `css` — Plain CSS

**Next.js**:

- `tailwind` — Auto-selected (recommended for App Router)

### State Management

- `none` — No setup (default)
- `redux` — Redux Toolkit
- `zustand` — Lightweight alternative
- `jotai` — Primitive and flexible atomic state

### Testing

- **Unit**: Vitest (default) or Jest
- **Component**: React Testing Library
- **E2E**: Playwright (default) or Cypress

### Data Fetching

- `tanstack-query` — TanStack Query v5 with Devtools
- `none` — Skip setup

### Package Manager

- `npm` — Default
- `yarn` — Alternative
- `pnpm` — Space-efficient

### Git Options

- `init` — Initialize git repo
- `initialCommit` — Create first commit

---

## Extension Points

### Plugin System

Register plugins to hook into generation lifecycle:

```typescript
const myPlugin: ReactSetupPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  hooks: {
    beforeCreate: async (config) => {
      // Modify config before generation
      return config;
    },
    afterTemplateApply: async (context) => {
      // Add custom files or modify assembler
    },
    beforeInstall: async (context) => {
      // Pre-installation tasks
    },
    afterInstall: async (context) => {
      // Post-installation tasks
    },
  },
};
```

### Custom Templates

Load templates from the overlays directory. Each template requires:

- `manifest.json` with name, version, dependencies, scripts
- Source files organized by destination path

---

## Performance Considerations

1. **Lazy Template Loading** — Templates loaded on-demand based on config
2. **Map-Based File Aggregation** — Efficient file merging with Map structures
3. **Binary File Markers** — Binary files marked for copy, not loaded into memory
4. **Version Registry Lookup** — O(1) version lookups via object keys
5. **Atomic File Writes** — Directory creation with recursive option

---

## Error Handling Strategy

1. **Validation Errors** — Caught at config layer with Zod, clear error messages
2. **File System Errors** — Caught at assembler layer, reported in result
3. **Dependency Conflicts** — Reported as warnings, don't block generation
4. **User Cancellation** — Graceful exit handling (Ctrl+C)
5. **Plugin Failures** — Logged as warnings, don't block generation

---

## Future Enhancements

- [ ] Custom template support from npm/git
- [ ] Monorepo scaffolding
- [ ] Component generation commands
- [ ] Project upgrade utilities
- [ ] Storybook template
- [ ] Telemetry/analytics (opt-in)
