# AI Progress Tracker

> This document is designed for AI tools to understand project state and continue development.
> Last updated: 2026-01-23

---

## CURRENT_PHASE: phase-2-templates

## NEXT_ACTION: Create base Vite runtime template files in src/templates/overlays/runtime/vite/

---

## Quick Context

| Key | Value |
|-----|-------|
| Project | react-setup CLI scaffolding tool |
| Template Source | [bulletproof-react](https://github.com/alan2207/bulletproof-react) |
| Runtime | Node.js with TypeScript |
| Test Framework | Vitest |
| Total Tests | 23 passing |
| Build Status | Compiling successfully |

---

## COMPLETED MODULES

### Phase 1: Core Infrastructure (DONE)

| File | Status | Tests | Description |
|------|--------|-------|-------------|
| `src/index.ts` | DONE | - | CLI entry point with shebang |
| `src/cli/parser.ts` | DONE | - | Commander.js argument parser |
| `src/cli/prompts.ts` | DONE | - | Interactive prompts (12+ questions) |
| `src/cli/index.ts` | DONE | - | CLI orchestration, summary display |
| `src/config/schema.ts` | DONE | 6 | Zod schemas, ProjectConfig types |
| `src/config/builder.ts` | DONE | 6 | Fluent ConfigBuilder API |
| `src/config/defaults.ts` | DONE | - | Default values, descriptions |
| `src/templates/registry.ts` | DONE | - | TemplateRegistry class |
| `src/templates/utils.ts` | DONE | - | Template path utilities |
| `src/assembler/index.ts` | DONE | - | ProjectAssembler class |
| `src/assembler/merger.ts` | DONE | 5 | ConfigMerger, deep merge |
| `src/dependencies/resolver.ts` | DONE | 5 | DependencyResolver, VERSION_REGISTRY |
| `src/testing/configurer.ts` | DONE | 7 | TestingConfigurer, script generation |

### Test Files

| File | Tests | Status |
|------|-------|--------|
| `src/__tests__/config-builder.test.ts` | 6 | PASSING |
| `src/__tests__/config-merger.test.ts` | 5 | PASSING |
| `src/__tests__/dependency-resolver.test.ts` | 5 | PASSING |
| `src/__tests__/testing-configurer.test.ts` | 7 | PASSING |

### Documentation

| File | Status | Purpose |
|------|--------|---------|
| `README.md` | DONE | User-facing documentation |
| `ARCHITECTURE.md` | DONE | System architecture, bulletproof-react reference |
| `IMPLEMENTATION.md` | DONE | Implementation details |
| `STATUS.md` | DONE | Human-readable project status |
| `AI-PROGRESS.md` | DONE | This file - AI continuation guide |

### Configuration Files

| File | Status |
|------|--------|
| `package.json` | DONE |
| `tsconfig.json` | DONE |
| `vitest.config.ts` | DONE |
| `.prettierrc` | DONE |
| `.eslintrc.cjs` | DONE |
| `.gitignore` | DONE |

---

## PENDING TASKS (Priority Order)

### Phase 2: Template Files

```
PRIORITY: HIGH
BLOCKING: Project generation cannot work without templates
```

#### 2.1 Runtime Templates

- [ ] **Create `src/templates/overlays/runtime/vite/`**
  - DEPENDS_ON: none
  - REFERENCE: `bulletproof-react/apps/react-vite/`
  - FILES_TO_CREATE:
    - `manifest.json` — Template metadata, dependencies
    - `vite.config.ts` — Vite configuration
    - `index.html` — HTML entry point
    - `src/main.tsx` — React entry point
    - `src/app/provider.tsx` — App providers wrapper
    - `src/app/router.tsx` — React Router setup
    - `tsconfig.json` — TypeScript config
    - `tsconfig.node.json` — Node TypeScript config

- [ ] **Create `src/templates/overlays/runtime/nextjs/`**
  - DEPENDS_ON: none (can be parallel with vite)
  - REFERENCE: `bulletproof-react/apps/nextjs-app/`
  - FILES_TO_CREATE:
    - `manifest.json` — Template metadata
    - `next.config.js` — Next.js configuration
    - `app/layout.tsx` — Root layout
    - `app/page.tsx` — Home page
    - `app/providers.tsx` — Client providers
    - `tsconfig.json` — TypeScript config

#### 2.2 Base Template (Shared)

- [ ] **Create `src/templates/overlays/base/`**
  - DEPENDS_ON: none
  - FILES_TO_CREATE:
    - `manifest.json`
    - `src/components/ui/button.tsx` — Base button component
    - `src/components/errors/error-boundary.tsx`
    - `src/lib/utils.ts` — Utility functions
    - `src/types/api.ts` — API type definitions
    - `src/hooks/use-disclosure.ts` — Common hook example

#### 2.3 Styling Templates

- [ ] **Create `src/templates/overlays/styling/tailwind/`**
  - DEPENDS_ON: base
  - FILES_TO_CREATE:
    - `manifest.json`
    - `tailwind.config.js`
    - `postcss.config.js`
    - `src/styles/globals.css`

- [ ] **Create `src/templates/overlays/styling/css-modules/`**
  - DEPENDS_ON: base
  - FILES_TO_CREATE:
    - `manifest.json`
    - `src/styles/globals.css`
    - `src/components/ui/button.module.css`

#### 2.4 State Management Templates

- [ ] **Create `src/templates/overlays/state/zustand/`**
  - DEPENDS_ON: base
  - REFERENCE: bulletproof-react stores pattern
  - FILES_TO_CREATE:
    - `manifest.json`
    - `src/stores/notifications.ts` — Example store
    - `src/stores/index.ts` — Store exports

- [ ] **Create `src/templates/overlays/state/redux/`**
  - DEPENDS_ON: base
  - FILES_TO_CREATE:
    - `manifest.json`
    - `src/stores/store.ts` — Redux store setup
    - `src/stores/hooks.ts` — Typed hooks
    - `src/stores/slices/` — Slice examples

#### 2.5 Testing Templates

- [ ] **Create `src/templates/overlays/testing/vitest/`**
  - DEPENDS_ON: base
  - REFERENCE: bulletproof-react testing setup
  - FILES_TO_CREATE:
    - `manifest.json`
    - `vitest.config.ts`
    - `src/testing/setup.ts` — Test setup
    - `src/testing/test-utils.tsx` — Custom render
    - `src/testing/mocks/handlers.ts` — MSW handlers

- [ ] **Create `src/templates/overlays/testing/playwright/`**
  - DEPENDS_ON: none
  - FILES_TO_CREATE:
    - `manifest.json`
    - `playwright.config.ts`
    - `tests/e2e/example.spec.ts`

#### 2.6 Feature Templates

- [ ] **Create `src/templates/overlays/features/tanstack-query/`**
  - DEPENDS_ON: base
  - FILES_TO_CREATE:
    - `manifest.json`
    - `src/lib/react-query.ts` — Query client setup
    - `src/hooks/use-query.ts` — Query hook patterns

---

### Phase 3: Project Generation Flow

```
PRIORITY: HIGH
BLOCKING: Cannot generate projects without this
DEPENDS_ON: Phase 2 templates
```

- [ ] **Connect CLI to template loading**
  - FILE: `src/cli/index.ts`
  - TASK: Load templates based on ProjectConfig

- [ ] **Implement template file reading**
  - FILE: `src/templates/registry.ts`
  - TASK: Read actual template files from disk

- [ ] **Implement file writing**
  - FILE: `src/assembler/index.ts`
  - TASK: Write assembled files to target directory

- [ ] **Generate package.json**
  - FILE: `src/assembler/index.ts`
  - TASK: Merge dependencies from all templates

- [ ] **Add progress indicators**
  - LIBRARY: ora (spinner)
  - TASK: Show progress during generation

---

### Phase 4: Lifecycle Management

```
PRIORITY: MEDIUM
DEPENDS_ON: Phase 3
```

- [ ] **Git initialization**
  - TASK: Run `git init` in generated project
  - TASK: Create initial commit (optional)

- [ ] **Dependency installation**
  - TASK: Run npm/yarn/pnpm install
  - TASK: Handle installation errors gracefully

- [ ] **Post-generation validation**
  - TASK: Verify all files were written
  - TASK: Check package.json is valid

---

### Phase 5: Integration Tests

```
PRIORITY: MEDIUM
DEPENDS_ON: Phase 4
```

- [ ] **Full generation flow tests**
  - FILE: `src/__tests__/integration/`
  - TASK: Test complete project generation

- [ ] **Verify generated project structure**
  - TASK: Assert correct files exist
  - TASK: Assert correct dependencies

- [ ] **Test multiple configurations**
  - TASK: Vite + Tailwind + Zustand
  - TASK: Next.js + CSS Modules + Redux
  - TASK: Minimal config

---

## KEY FILES TO READ

Before making changes, AI should read these files:

| Priority | File | Reason |
|----------|------|--------|
| 1 | `src/config/schema.ts` | Understand ProjectConfig structure |
| 2 | `src/templates/registry.ts` | Template loading patterns |
| 3 | `src/templates/utils.ts` | Template path conventions |
| 4 | `src/assembler/index.ts` | File assembly patterns |
| 5 | `src/dependencies/resolver.ts` | VERSION_REGISTRY for deps |
| 6 | `ARCHITECTURE.md` | Overall system design |

---

## PATTERNS TO FOLLOW

### Template Manifest Format

```json
{
  "name": "template-name",
  "version": "1.0.0",
  "description": "Template description",
  "dependencies": {
    "package-name": "^version"
  },
  "devDependencies": {
    "dev-package": "^version"
  },
  "scripts": {
    "script-name": "command"
  },
  "filePatterns": {
    "include": ["**/*"],
    "exclude": ["manifest.json"]
  }
}
```

### File Path Convention

```
src/templates/overlays/
├── runtime/
│   ├── vite/
│   │   ├── manifest.json
│   │   └── [template files...]
│   └── nextjs/
├── styling/
│   ├── tailwind/
│   └── css-modules/
├── state/
│   ├── zustand/
│   └── redux/
├── testing/
│   ├── vitest/
│   └── playwright/
└── features/
    └── tanstack-query/
```

### Test File Naming

- Unit tests: `[module-name].test.ts`
- Integration tests: `src/__tests__/integration/[feature].test.ts`

---

## BLOCKERS / DECISIONS NEEDED

| ID | Issue | Options | Status |
|----|-------|---------|--------|
| - | None currently | - | - |

---

## COMMANDS REFERENCE

```bash
# Development
npm run dev              # Run CLI interactively
npm run build            # Compile TypeScript

# Testing
npm run test             # Run all 23 tests
npm run test:watch       # Watch mode

# Code Quality
npm run lint             # ESLint check
npm run format           # Prettier format
```

---

## VERSION REGISTRY (Key Packages)

When adding template dependencies, use these pinned versions from `src/dependencies/resolver.ts`:

```typescript
{
  'react': '^18.2.0',
  'react-dom': '^18.2.0',
  'vite': '^5.4.0',
  '@vitejs/plugin-react': '^4.2.0',
  'next': '^14.2.0',
  'typescript': '^5.6.0',
  'tailwindcss': '^3.4.0',
  'zustand': '^5.0.0',
  '@reduxjs/toolkit': '^2.3.0',
  'vitest': '^2.0.0',
  '@tanstack/react-query': '^5.60.0',
  'playwright': '^1.48.0'
}
```

---

## CONTINUATION INSTRUCTIONS

To continue development:

1. **Read this file** to understand current state
2. **Check NEXT_ACTION** at the top for immediate task
3. **Read KEY FILES** listed above for context
4. **Follow PATTERNS** section for consistency
5. **Update this file** after completing tasks

### Starting Phase 2

```bash
# 1. Create the vite template directory structure
mkdir -p src/templates/overlays/runtime/vite

# 2. Create manifest.json first
# 3. Then create template files following bulletproof-react patterns
# 4. Update this file to mark tasks complete
```

---

## CHANGE LOG

| Date | Change | By |
|------|--------|-----|
| 2026-01-23 | Initial AI-PROGRESS.md created | AI |
| 2026-01-23 | Added bulletproof-react to ARCHITECTURE.md | AI |
| 2026-01-23 | Phase 1 complete, Phase 2 ready to start | - |

