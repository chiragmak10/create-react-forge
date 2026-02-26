# Cross-Platform Testing Guide

This document explains the cross-platform testing strategy for `create-react-forge` to ensure consistent user experience across Windows, macOS, and Linux.

## Overview

The project includes comprehensive cross-platform testing to catch OS-specific issues early and ensure reliability across different environments.

## Test Coverage

### 1. **Cross-Platform CLI Tests** (`src/__tests__/integration/cross-platform-cli.test.ts`)

Tests platform-specific behaviors:

- **Path Handling**: Tests path separators (`/` vs `\`) on Windows vs Unix
- **Case Sensitivity**: Verifies file system case sensitivity (case-insensitive on Windows/macOS, case-sensitive on Linux)
- **Line Endings**: Tests consistent handling of `LF` vs `CRLF`
- **Special Characters**: Tests directory names with hyphens, underscores, camelCase
- **Permissions**: Tests executable file permissions on Unix systems
- **Package Manager Detection**: Verifies correct detection of `npm`, `yarn`, `pnpm` on each platform

### 2. **E2E CLI Tests** (`src/__tests__/integration/e2e-cli.test.ts`)

Tests actual CLI command execution:

- **Version & Help**: Ensures `--version` and `--help` flags work
- **Exit Codes**: Verifies proper exit codes (0 for success, non-zero for errors)
- **Output Consistency**: Ensures output is consistent across multiple runs
- **Concurrent Execution**: Tests CLI behavior under concurrent invocations
- **Environment Variables**: Tests behavior with different env vars
- **Error Handling**: Tests graceful error handling for invalid inputs

## Running Tests Locally

### Run All Tests

```bash
npm test
```

### Run Only Cross-Platform Tests

```bash
npm test -- cross-platform-cli.test.ts
```

### Run Only E2E Tests

```bash
npm test -- e2e-cli.test.ts
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run With Coverage

```bash
npm run test:coverage
```

## CI/CD Pipeline

The project uses GitHub Actions for automated cross-platform testing:

**Workflow: `.github/workflows/cross-platform-tests.yml`**

### Test Matrix

- **Operating Systems**: Ubuntu Latest, Windows Latest, macOS Latest
- **Node Versions**: Node 20.x, Node 22.x
- **Total Combinations**: 6 OS/Node combinations

### Jobs

1. **test**: Runs unit, integration, and platform-specific tests
2. **e2e-scaffold-test**: Tests the actual scaffolding command
3. **lint**: Runs linter and format checks
4. **build-artifacts**: Verifies build output

### Each Job Tests

- ✅ Installation of dependencies
- ✅ Project builds successfully
- ✅ All tests pass
- ✅ Linter rules pass
- ✅ CLI can be invoked
- ✅ TypeScript definitions are generated

## Key Platform Differences

### Windows (`win32`)

```typescript
// Path separator
sep === '\\';

// Case-insensitive file system
file.txt === FILE.TXT; // true

// CRLF line endings
lineEnding === '\r\n';
```

### macOS (`darwin`)

```typescript
// Path separator
sep === '/';

// Case-insensitive file system (by default)
file.txt === FILE.TXT; // true

// LF line endings
lineEnding === '\n';
```

### Linux

```typescript
// Path separator
sep === '/';

// Case-sensitive file system
file.txt === FILE.TXT; // false

// LF line endings
lineEnding === '\n';
```

## Dependency Note

**Important**: The `@inquirer/core` peer dependency is now explicitly listed in `package.json` to ensure proper resolution across all platforms. This fixes the module resolution error that occurred on some systems.

## Troubleshooting

### Issue: Tests fail on Windows only

- Check for path separator issues (`/` vs `\`)
- Verify case sensitivity handling
- Check for line ending differences

### Issue: Tests fail on macOS only

- Check for code signing issues
- Verify file permission handling
- Check for environment variable differences

### Issue: Tests fail on Linux only

- Check for case sensitivity in file names
- Verify file permissions
- Check for path length issues

### Module Resolution Errors

If you see errors like `Cannot find package '@inquirer/core'`:

1. Run `npm install` to reinstall dependencies
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and package-lock.json, then reinstall

## Adding New Tests

When adding new features, ensure cross-platform compatibility:

```typescript
import os from 'node:os';
import { sep } from 'node:path';

describe('Feature', () => {
  it('should work on all platforms', () => {
    if (os.platform() === 'win32') {
      // Windows-specific test
    } else {
      // Unix-specific test
    }
  });

  it('should handle path separators correctly', () => {
    const path = `src${sep}components`;
    // Use sep instead of hardcoding / or \
  });
});
```

## Continuous Improvement

The testing infrastructure allows:

- ✅ Early detection of platform-specific bugs
- ✅ Validation of fixes across all platforms
- ✅ Prevention of regressions
- ✅ Confidence in releases

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Project architecture
- [CODE_QUALITY.md](../CODE_QUALITY.md) - Code quality standards
- [RELEASE_GUIDE.md](../RELEASE_GUIDE.md) - Release process
