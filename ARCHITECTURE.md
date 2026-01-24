# React-Setup Architecture

## Overview

React-Setup is a modular, layered CLI tool for scaffolding production-ready React applications. The architecture prioritizes separation of concerns, testability, and extensibility.

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
      ┌────────────────┼────────────────┐
      │                │                │
   ┌──▼──┐        ┌────▼─────┐    ┌────▼──────┐
   │Templ.│        │Assembler │    │Dependency │
   │Layer │        │Layer     │    │Layer      │
   └──────┘        └──────────┘    └───────────┘
      │                │                │
   ┌──▼──────────────────────────────────▼──┐
   │         Testing Layer                   │
   │  (script generation, config templating) │
   │  Location: src/testing/                 │
   └────────────────────────────────────────┘
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
  - Converts user input to ProjectConfig
  - Validates configuration
  - Displays summary
  - Error handling and user feedback

**Input**: User selections (interactive or CLI flags)
**Output**: ProjectConfig object ready for assembly

---

### 2. Configuration Layer (`src/config/`)

**Responsibility**: Define, validate, and manage project configuration.

#### Files:

- **schema.ts** — Zod type definitions
  - ProjectConfig interface with all options
  - Individual schemas for each config aspect
  - DEFAULT_CONFIG preset
  - Type exports for TS support
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
  styling: { solution: string };
  stateManagement: string;
  testing: TestingConfig;
  dataFetching: DataFetchingConfig;
  // ... more fields
}
```

---

### 3. Template Layer (`src/templates/`)

**Responsibility**: Manage template overlays and file composition strategy.

#### Files:

- **registry.ts** — TemplateRegistry class
  - Template registration and discovery
  - Manifest loading and parsing
  - Dependency aggregation from multiple templates
  - Script merging across templates
  - Template filtering by category
- **utils.ts** — Template utility functions
  - Path resolution for runtime-specific templates
  - Styling/state/testing template lookup
  - Determine applicable templates based on config

**Key Data Structure**:

```typescript
interface TemplateOverlay {
  name: string;
  path: string;
  manifest: TemplateManifest;
  files?: Record<string, string>;
}

interface TemplateManifest {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  filePatterns?: { include?: string[]; exclude?: string[] };
}
```

**Template Layers** (composable, order matters):

1. **Base** — Core React files (App.tsx, index, main.tsx)
2. **Runtime** — Vite or Next.js specific configs
3. **Styling** — Tailwind/CSS/Styled Components setup
4. **State** — Redux/Zustand store setup
5. **Features** — TanStack Query, etc.
6. **Testing** — Vitest/Jest + RTL + Playwright/Cypress
7. **Tooling** — Prettier config

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
│   │   ├── layouts/            # Layout components (MainLayout, AuthLayout)
│   │   └── errors/             # Error boundaries and fallbacks
│   │
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Authentication feature
│   │   │   ├── api/            # API calls for auth
│   │   │   ├── components/     # Auth-specific components
│   │   │   ├── hooks/          # Auth hooks (useUser, useLogin)
│   │   │   ├── stores/         # Auth state (if using Zustand/Redux)
│   │   │   └── types/          # Auth TypeScript types
│   │   └── [feature]/          # Other features follow same pattern
│   │
│   ├── hooks/                  # Shared custom hooks
│   │   └── use-disclosure.ts
│   │
│   ├── lib/                    # Utilities and configurations
│   │   ├── api-client.ts       # Axios/fetch wrapper
│   │   ├── auth.ts             # Auth utilities
│   │   └── utils.ts            # General utilities
│   │
│   ├── stores/                 # Global state (if applicable)
│   │   └── notifications.ts
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
├── index.html                  # (Vite) or app/ (Next.js)
└── [config files]              # vite.config.ts, tsconfig.json, etc.
```

### Template Overlay Mapping

Each template overlay generates files following the bulletproof-react patterns:

| Overlay | Bulletproof Reference | Generated Files |
|---------|----------------------|-----------------|
| `runtime/vite` | `apps/react-vite/` | vite.config.ts, index.html, main.tsx |
| `runtime/nextjs` | `apps/nextjs-app/` | next.config.js, app/ structure |
| `styling/tailwind` | Tailwind setup | tailwind.config.js, globals.css |
| `state/zustand` | `stores/` pattern | Store templates with TypeScript |
| `state/redux` | Redux Toolkit pattern | Slice-based store structure |
| `testing/vitest` | `testing/` directory | setup.ts, test-utils.tsx, mocks/ |
| `features/tanstack-query` | `lib/react-query.ts` | Query client, hooks pattern |

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

### 4. Assembly Layer (`src/assembler/`)

**Responsibility**: Merge configurations and write files to disk.

#### Files:

- **index.ts** — ProjectAssembler class
  - File registration system
  - Batches files for writing
  - Directory creation
  - Atomic file system operations
- **merger.ts** — ConfigMerger class
  - Deep merge objects with Deepmerge
  - Smart package.json merging:
    - Scripts concatenation
    - Dependencies deduplication
    - Arrays flattened with dedup
  - Strategy-based merging for different config types

**Merge Logic**:

```typescript
ConfigMerger.mergePackageJson(
  { scripts: { start: 'vite' }, dependencies: { react: '^18' } },
  { scripts: { dev: 'vite', dev: 'vite --host' }, dependencies: { react-dom: '^18' } }
)
// Result: { scripts: { start, dev }, dependencies: { react, react-dom } }
```

---

### 5. Dependency Layer (`src/dependencies/`)

**Responsibility**: Resolve, deduplicate, and version-pin dependencies.

#### Files:

- **resolver.ts** — DependencyResolver class
  - VERSION_REGISTRY with 30+ pinned versions
  - Aggregates dependencies from multiple sources
  - Detects version conflicts
  - Applies version pinning strategy
  - Separates dev vs. production dependencies

**Version Registry** (sample):

```typescript
{
  'vite': '^5.4.0',
  '@vitejs/plugin-react': '^4.2.0',
  'react': '^18.2.0',
  'vitest': '^2.0.0',
  '@tanstack/react-query': '^5.60.0',
  // ... 25+ more packages
}
```

**Conflict Handling**:

- Detects when different versions requested
- Reports conflicts but still resolves (later version wins)
- Prevents duplicate versions in final output

---

### 6. Testing Layer (`src/testing/`)

**Responsibility**: Configure testing setup and generate test scripts.

#### Files:

- **configurer.ts** — TestingConfigurer class
  - Selects appropriate test runners based on runtime
  - Generates npm scripts for testing
  - Creates test configuration files
  - Supports multiple runners: Vitest, Jest, Playwright, Cypress

**Test Runner Selection Logic**:

```
Vite → Vitest (native integration, fast HMR)
Next.js → Vitest (default) or Jest (if specified)

E2E:
→ Playwright (default, cross-browser)
→ Cypress (alternative, dev-friendly)
```

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

## Data Flow

### Project Generation Flow

```
User Input (CLI/Flags)
    ↓
Parse Arguments → Validate Names
    ↓
Interactive Prompts
    ↓
Collect Answers
    ↓
Convert to ProjectConfig
    ↓
Validate with Zod
    ↓
Load Template Overlays
    ↓
Aggregate Dependencies
    ↓
Resolve Version Conflicts
    ↓
Generate Test Scripts
    ↓
Merge Package.json
    ↓
Create Assembler with Files
    ↓
Write to Disk
    ↓
Initialize Git (optional)
    ↓
Install Dependencies
    ↓
Success!
```

---

## Module Dependencies

```
index.ts
  └─ cli/index.ts
      ├─ cli/parser.ts (Commander)
      ├─ cli/prompts.ts (@inquirer/prompts)
      ├─ cli/validators.ts
      ├─ config/builder.ts
      │   └─ config/schema.ts (Zod)
      │       └─ config/defaults.ts
      └─ (future: assembler/index.ts)

config/builder.ts
  └─ config/schema.ts
      └─ config/defaults.ts

templates/registry.ts
  └─ (templates/index.ts on-demand loading)

templates/utils.ts
  └─ config/schema.ts

assembler/index.ts
  └─ config/schema.ts

assembler/merger.ts
  ├─ deepmerge (3rd party)
  └─ (package.json files)

dependencies/resolver.ts
  └─ (VERSION_REGISTRY as constant)

testing/configurer.ts
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

### 6. Dependency Injection (Implicit)

Layers accept configured objects rather than creating dependencies.

---

## Testing Strategy

### Test Organization

- Unit tests co-located with source in `src/__tests__/`
- Each module has corresponding test file
- 23 tests covering core functionality

### Test Coverage

- **Config Layer**: ConfigBuilder, merging, validation
- **Dependency Layer**: Resolution, conflict detection, pinning
- **Assembly Layer**: Config merging strategies
- **Testing Layer**: Runner selection, script generation

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

- `vite` — Vite SPA (default for speed)
- `nextjs` — Next.js SSR/Full-stack

### Language

- `typescript` — Recommended, full type safety
- `javascript` — For simple projects

### Styling

- `tailwind` — Utility-first (recommended)
- `css` — Plain CSS with CSS Modules
- `styled-components` — CSS-in-JS
- `css-modules` — Scoped CSS

### State Management

- `none` — No setup (default)
- `redux` — Redux Toolkit
- `zustand` — Lightweight alternative

### Testing

- **Unit**: Vitest (Vite) or Jest (Next.js)
- **Component**: React Testing Library
- **E2E**: Playwright or Cypress

### Data Fetching

- `tanstack-query` — TanStack Query with Devtools
- `none` — Skip setup

### Package Manager

- `npm` — Default
- `yarn` — Alternative
- `pnpm` — Space-efficient

### Git Options

- `init` — Initialize git repo
- `initialCommit` — Create first commit

---

## Extension Points (Future)

### Plugin System

Planned hooks for extensibility:

```typescript
interface ReactSetupPlugin {
  beforeCreate?: (config) => void;
  afterTemplateApply?: (context) => void;
  beforeInstall?: (context) => void;
  afterInstall?: (context) => void;
}
```

### Custom Templates

Load templates from:

- Local filesystem
- npm packages (`react-setup-template-*`)
- Git repositories

### Custom Test Runners

Add new test runners through plugin system.

---

## Performance Considerations

1. **Lazy Template Loading** — Templates loaded on-demand, not all upfront
2. **Parallel Dependency Resolution** — Multiple sources aggregated concurrently
3. **Streaming File Writes** — Files written in batches, not one-by-one
4. **Version Registry Lookup** — O(1) version lookups via object keys

---

## Error Handling Strategy

1. **Validation Errors** — Caught at config layer with Zod
2. **File System Errors** — Caught at assembler layer
3. **Dependency Conflicts** — Reported but don't block generation
4. **User Cancellation** — Graceful exit handling

---

## Future Enhancements

- [ ] Plugin system implementation
- [ ] Custom template support
- [ ] Monorepo scaffolding
- [ ] Component generation commands
- [ ] Project upgrade utilities
- [ ] Integration tests with real file output
- [ ] Performance profiling
- [ ] Telemetry/analytics (opt-in)
