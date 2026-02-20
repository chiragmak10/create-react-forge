# Project Architecture

## Overview

This project was bootstrapped with `create-react-forge` using:

- **Runtime**: Vite (SPA)
- **Language**: TypeScript
- **Styling**: styled-components
- **State Management**: zustand
- **Data Fetching**: None
- **Testing**: Disabled

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/              # Base UI primitives
├── features/            # Feature-based modules
├── hooks/               # Custom React hooks
├── providers/           # React context providers
├── stores/              # State management stores
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., UserProfile.tsx)
- **Hooks**: camelCase with "use" prefix (e.g., useAuth.ts)
- **Utilities**: camelCase (e.g., formatDate.ts)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., constants.ts)

### Code
- **Components**: PascalCase
- **Functions**: camelCase
- **Variables**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types/Interfaces**: PascalCase

## Testing Strategy

Testing is currently disabled.

## Data Fetching

Standard `fetch` or `axios` is used for data fetching.

## State Management


We use **zustand** for global client state.

