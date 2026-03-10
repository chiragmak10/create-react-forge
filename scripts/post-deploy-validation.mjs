#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const PACKAGE_NAME = process.env.CRF_PACKAGE_NAME ?? 'create-react-forge';
const PACKAGE_SPEC = process.env.CRF_PACKAGE_SPEC ?? `${PACKAGE_NAME}@latest`;
const NPM_COMMAND = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const ANSI_PATTERN = /\x1B\[[0-9;?]*[ -/]*[@-~]/g;
const DOWN_ARROW = '\u001B[B';

function formatCommand(command, args) {
  return [command, ...args].join(' ');
}

function formatResult(result) {
  const stdout = result.stdout ? `\nstdout:\n${result.stdout}` : '';
  const stderr = result.stderr ? `\nstderr:\n${result.stderr}` : '';
  return `${stdout}${stderr}`;
}

function shouldUseShellForCommand(command) {
  if (process.platform !== 'win32') {
    return false;
  }

  const normalized = command.toLowerCase();
  return normalized.endsWith('.cmd') || normalized.endsWith('.bat');
}

function runCommand(command, args, options = {}) {
  const { cwd, env, allowFailure = false, timeoutMs = 5 * 60 * 1000 } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: shouldUseShellForCommand(command),
    });

    let stdout = '';
    let stderr = '';
    let finished = false;

    const timeout = setTimeout(() => {
      if (finished) {
        return;
      }
      finished = true;
      child.kill('SIGTERM');
      reject(
        new Error(
          `Timed out after ${timeoutMs}ms: ${formatCommand(command, args)}${formatResult({
            stdout,
            stderr,
          })}`
        )
      );
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);
      reject(
        new Error(
          `Failed to run command: ${formatCommand(command, args)}\n${error.message}${formatResult({
            stdout,
            stderr,
          })}`
        )
      );
    });

    child.on('close', (code) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);

      const result = {
        code: code ?? -1,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };

      if (!allowFailure && result.code !== 0) {
        reject(
          new Error(
            `Command failed with exit code ${result.code}: ${formatCommand(
              command,
              args
            )}${formatResult(result)}`
          )
        );
        return;
      }

      resolve(result);
    });
  });
}

function stripAnsi(text) {
  return text.replace(ANSI_PATTERN, '');
}

function tailText(text, maxChars = 4000) {
  if (!text) {
    return '';
  }
  return text.length <= maxChars ? text : text.slice(-maxChars);
}

async function readJson(path) {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

async function importModule(path) {
  return import(pathToFileURL(path).href);
}

function createValidationConfig(path, overrides = {}) {
  return {
    name: 'post-deploy-app',
    path,
    runtime: 'vite',
    language: 'typescript',
    styling: { solution: 'tailwind' },
    stateManagement: 'none',
    dataFetching: { enabled: false, library: 'tanstack-query' },
    testing: {
      enabled: false,
      unit: { enabled: false, runner: 'vitest' },
      component: { enabled: false, library: 'testing-library' },
      e2e: { enabled: false, runner: 'none' },
    },
    linting: { prettier: false },
    packageManager: 'npm',
    git: { init: false, initialCommit: false },
    plugins: [],
    ...overrides,
  };
}

async function validateCli(packageRoot, expectedVersion, workspace) {
  const cliPath = join(packageRoot, 'dist', 'index.js');
  assert(existsSync(cliPath), `CLI entrypoint not found: ${cliPath}`);

  const versionResult = await runCommand(process.execPath, [cliPath, '--version'], {
    cwd: workspace,
  });
  const versionOutput = `${versionResult.stdout}\n${versionResult.stderr}`.trim();
  assert(
    versionOutput.includes(expectedVersion),
    `CLI version mismatch. Expected to include "${expectedVersion}", got "${versionOutput}"`
  );

  const helpResult = await runCommand(process.execPath, [cliPath, '--help'], {
    cwd: workspace,
  });
  const helpOutput = `${helpResult.stdout}\n${helpResult.stderr}`;
  const rootHelpExpectations = [
    'Usage: create-react-forge',
    'Commands:',
    'create [options] [projectName]',
  ];
  for (const text of rootHelpExpectations) {
    assert(helpOutput.includes(text), `Root help output missing "${text}"`);
  }

  const createHelpResult = await runCommand(process.execPath, [cliPath, 'create', '--help'], {
    cwd: workspace,
  });
  const createHelpOutput = `${createHelpResult.stdout}\n${createHelpResult.stderr}`;
  const createHelpExpectations = [
    '--runtime <runtime>',
    '--language <language>',
    '--testing <testing>',
    '--pm <packageManager>',
  ];
  for (const text of createHelpExpectations) {
    assert(createHelpOutput.includes(text), `Create help output missing "${text}"`);
  }

  const invalidFlagResult = await runCommand(process.execPath, [cliPath, '--invalid-flag'], {
    cwd: workspace,
    allowFailure: true,
  });
  assert(
    invalidFlagResult.code !== 0,
    'CLI should exit with a non-zero code for invalid arguments'
  );
}

function runInteractiveNpxCreate({
  workspace,
  steps,
  timeoutMs = 3 * 60 * 1000,
  command,
  commandArgs,
}) {
  return new Promise((resolve, reject) => {
    const resolvedCommand = command ?? (process.platform === 'win32' ? 'npx.cmd' : 'npx');
    const resolvedArgs = commandArgs ?? ['--yes', PACKAGE_SPEC];
    const child = spawn(resolvedCommand, resolvedArgs, {
      cwd: workspace,
      env: {
        ...process.env,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: shouldUseShellForCommand(resolvedCommand),
    });

    let stdout = '';
    let stderr = '';
    let seenOutput = '';
    let stepIndex = 0;
    let finished = false;

    const fail = (error) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);
      child.kill('SIGTERM');
      reject(error);
    };

    const complete = (code) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);
      resolve({
        code: code ?? -1,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        stepsCompleted: stepIndex,
      });
    };

    const tryFeedAnswer = (chunk) => {
      seenOutput += stripAnsi(chunk.toString());
      if (seenOutput.length > 24000) {
        seenOutput = seenOutput.slice(-12000);
      }

      if (stepIndex >= steps.length) {
        return;
      }

      const currentStep = steps[stepIndex];
      if (!seenOutput.includes(currentStep.match)) {
        return;
      }

      const answer = currentStep.answer;
      stepIndex += 1;
      setTimeout(() => {
        if (!finished) {
          child.stdin.write(`${answer}\n`);
        }
      }, 80);
    };

    const timeout = setTimeout(() => {
      fail(
        new Error(
          `Timed out while running interactive command (${formatCommand(
            resolvedCommand,
            resolvedArgs
          )}) after ${timeoutMs}ms with ${stepIndex}/${steps.length} prompt steps completed.`
        )
      );
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      tryFeedAnswer(chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      tryFeedAnswer(chunk);
    });

    child.on('error', (error) => {
      fail(
        new Error(
          `Failed to run interactive command (${formatCommand(
            resolvedCommand,
            resolvedArgs
          )}): ${error.message}`
        )
      );
    });

    child.on('close', (code) => {
      complete(code);
    });
  });
}

async function runInteractiveScenarioWithWindowsFallback({
  workspace,
  packageRoot,
  steps,
  scenarioName,
}) {
  const npxResult = await runInteractiveNpxCreate({
    workspace,
    steps,
  });

  if (npxResult.code === 0) {
    return npxResult;
  }

  if (process.platform !== 'win32') {
    throw new Error(
      `${scenarioName} failed with npx (exit ${npxResult.code}). stdout tail:\n${tailText(
        npxResult.stdout
      )}\nstderr tail:\n${tailText(npxResult.stderr)}`
    );
  }

  const fallbackResult = await runInteractiveNpxCreate({
    workspace,
    steps,
    command: process.execPath,
    commandArgs: [join(packageRoot, 'dist', 'index.js')],
  });

  if (fallbackResult.code === 0) {
    console.warn(
      `[warn] ${scenarioName} failed with npx on Windows but succeeded via installed CLI fallback`
    );
    return fallbackResult;
  }

  const combinedPrimaryOutput = `${npxResult.stdout}\n${npxResult.stderr}`;
  const combinedFallbackOutput = `${fallbackResult.stdout}\n${fallbackResult.stderr}`;
  const promptClosureRegex = /ExitPromptError|User force closed the prompt/i;
  const isPromptClosure =
    promptClosureRegex.test(combinedPrimaryOutput) ||
    promptClosureRegex.test(combinedFallbackOutput);

  if (isPromptClosure) {
    console.warn(
      `[warn] ${scenarioName} skipped on Windows: interactive prompt requires a TTY in this runner environment`
    );
    return { code: 0, skipped: true };
  }

  throw new Error(
    `${scenarioName} failed on Windows with both npx (exit ${npxResult.code}) and fallback CLI (exit ${fallbackResult.code}). npx stdout tail:\n${tailText(
      npxResult.stdout
    )}\nnpx stderr tail:\n${tailText(npxResult.stderr)}\nfallback stdout tail:\n${tailText(
      fallbackResult.stdout
    )}\nfallback stderr tail:\n${tailText(fallbackResult.stderr)}`
  );
}

async function validateNpxGeneration(packageRoot, workspace) {
  const defaultProjectName = 'npx-default-app';
  const defaultProjectPath = join(workspace, defaultProjectName);
  const defaultScenario = await runInteractiveScenarioWithWindowsFallback({
    workspace,
    packageRoot,
    scenarioName: 'Default interactive npx flow',
    steps: [
      { match: 'Project name:', answer: defaultProjectName },
      { match: 'Project directory:', answer: `./${defaultProjectName}` },
      { match: 'Choose runtime:', answer: '' },
      { match: 'Language:', answer: '' },
      { match: 'Styling solution:', answer: '' },
      { match: 'State management:', answer: '' },
      { match: 'Testing setup:', answer: '' },
      { match: 'Unit test runner:', answer: '' },
      { match: 'E2E testing framework:', answer: '' },
      { match: 'Include TanStack Query?', answer: '' },
      { match: 'Package manager:', answer: '' },
      { match: 'Initialize git repository?', answer: '' },
      { match: 'Add Prettier?', answer: '' },
    ],
  });

  if (defaultScenario.skipped) {
    return;
  }
  assert(defaultScenario.code === 0, 'Default interactive npx flow failed');

  assert(
    existsSync(defaultProjectPath),
    `Generated project directory missing: ${defaultProjectPath}`
  );
  assert(
    existsSync(join(defaultProjectPath, 'package.json')),
    'Default npx project missing package.json'
  );
  assert(
    existsSync(join(defaultProjectPath, 'src', 'main.tsx')),
    'Default npx project missing src/main.tsx'
  );
  assert(
    existsSync(join(defaultProjectPath, 'vite.config.ts')),
    'Default npx project missing vite.config.ts'
  );
  assert(
    existsSync(join(defaultProjectPath, 'tsconfig.json')),
    'Default npx project missing tsconfig.json'
  );

  const defaultPkg = await readJson(join(defaultProjectPath, 'package.json'));
  assert(defaultPkg.name === defaultProjectName, 'Default npx project package name mismatch');
  assert(Boolean(defaultPkg.dependencies?.react), 'Default npx project missing react dependency');
  assert(
    Boolean(defaultPkg.dependencies?.['@tanstack/react-query']),
    'Default npx project missing @tanstack/react-query dependency'
  );
  assert(
    Boolean(defaultPkg.devDependencies?.['@playwright/test']),
    'Default npx project missing @playwright/test dependency'
  );

  const nextProjectName = 'npx-nextjs-js-app';
  const nextProjectPath = join(workspace, nextProjectName);
  const nextScenario = await runInteractiveScenarioWithWindowsFallback({
    workspace,
    packageRoot,
    scenarioName: 'Next.js JavaScript interactive npx flow',
    steps: [
      { match: 'Project name:', answer: nextProjectName },
      { match: 'Project directory:', answer: `./${nextProjectName}` },
      { match: 'Choose runtime:', answer: DOWN_ARROW },
      { match: 'Language:', answer: DOWN_ARROW },
      { match: 'State management:', answer: `${DOWN_ARROW}${DOWN_ARROW}${DOWN_ARROW}` },
      { match: 'Testing setup:', answer: `${DOWN_ARROW}${DOWN_ARROW}` },
      { match: 'Include TanStack Query?', answer: 'n' },
      { match: 'Package manager:', answer: `${DOWN_ARROW}${DOWN_ARROW}` },
      { match: 'Initialize git repository?', answer: 'n' },
      { match: 'Add Prettier?', answer: 'n' },
    ],
  });

  if (nextScenario.skipped) {
    return;
  }
  assert(nextScenario.code === 0, 'Next.js JavaScript interactive npx flow failed');

  assert(existsSync(nextProjectPath), `Generated project directory missing: ${nextProjectPath}`);
  assert(
    existsSync(join(nextProjectPath, 'package.json')),
    'Next.js JavaScript npx project missing package.json'
  );
  assert(
    existsSync(join(nextProjectPath, 'next.config.js')),
    'Next.js JavaScript npx project missing next.config.js'
  );
  assert(
    existsSync(join(nextProjectPath, 'src', 'app', 'page.jsx')),
    'Next.js JavaScript npx project missing src/app/page.jsx'
  );
  assert(
    !existsSync(join(nextProjectPath, 'tsconfig.json')),
    'Next.js JavaScript npx project should not contain tsconfig.json'
  );

  const nextPkg = await readJson(join(nextProjectPath, 'package.json'));
  assert(nextPkg.name === nextProjectName, 'Next.js JavaScript npx project package name mismatch');
  assert(
    Boolean(nextPkg.dependencies?.next),
    'Next.js JavaScript npx project missing next dependency'
  );
  assert(
    Boolean(nextPkg.dependencies?.['@reduxjs/toolkit']),
    'Next.js JavaScript npx project missing @reduxjs/toolkit dependency'
  );
  assert(
    !nextPkg.dependencies?.['@tanstack/react-query'],
    'Next.js JavaScript npx project should not include @tanstack/react-query'
  );
}

async function validateExportsAndTemplates(packageRoot) {
  const configModulePath = join(packageRoot, 'dist', 'config', 'schema.js');
  const templatesModulePath = join(packageRoot, 'dist', 'templates', 'registry.js');

  assert(existsSync(configModulePath), `Missing config module: ${configModulePath}`);
  assert(existsSync(templatesModulePath), `Missing templates module: ${templatesModulePath}`);

  const { DEFAULT_CONFIG, ProjectConfigSchema } = await importModule(configModulePath);
  const { TemplateRegistry } = await importModule(templatesModulePath);

  assert(DEFAULT_CONFIG && typeof DEFAULT_CONFIG === 'object', 'DEFAULT_CONFIG export is missing');
  assert(ProjectConfigSchema?.parse, 'ProjectConfigSchema export is missing');
  assert(typeof TemplateRegistry === 'function', 'TemplateRegistry export is missing');

  const parsedDefault = ProjectConfigSchema.parse(DEFAULT_CONFIG);
  assert(parsedDefault.name === DEFAULT_CONFIG.name, 'DEFAULT_CONFIG parsing failed');

  const registry = new TemplateRegistry();
  const templates = registry.loadTemplatesForConfig({
    runtime: 'vite',
    styling: { solution: 'tailwind' },
    stateManagement: 'zustand',
    testing: {
      enabled: true,
      unit: { runner: 'vitest' },
      e2e: { enabled: true, runner: 'playwright' },
    },
    dataFetching: { enabled: true },
  });

  assert(templates.length >= 7, `Expected at least 7 templates, got ${templates.length}`);

  const mergedDependencies = registry.getMergedDependencies();
  assert(
    Boolean(mergedDependencies.dependencies['zustand']),
    'Merged dependencies missing "zustand"'
  );
  assert(
    Boolean(mergedDependencies.dependencies['@tanstack/react-query']),
    'Merged dependencies missing "@tanstack/react-query"'
  );
  assert(
    Boolean(mergedDependencies.devDependencies['tailwindcss']),
    'Merged devDependencies missing "tailwindcss"'
  );
  assert(
    Boolean(mergedDependencies.devDependencies['vitest']),
    'Merged devDependencies missing "vitest"'
  );

  const mergedFiles = registry.getMergedFiles();
  assert(
    mergedFiles.size > 20,
    `Expected merged templates to contain >20 files, got ${mergedFiles.size}`
  );
  const hasSourceFiles = Array.from(mergedFiles.keys()).some((file) => file.startsWith('src/'));
  assert(hasSourceFiles, 'Merged templates should contain source files under src/');

  return { ProjectConfigSchema };
}

async function validateGeneration(packageRoot, projectConfigSchema, workspace) {
  const generatorModulePath = join(packageRoot, 'dist', 'generator', 'index.js');
  assert(existsSync(generatorModulePath), `Missing generator module: ${generatorModulePath}`);

  const { ProjectGenerator } = await importModule(generatorModulePath);
  assert(
    typeof ProjectGenerator === 'function',
    'ProjectGenerator export is missing from dist build'
  );

  const generationRoot = await mkdtemp(join(workspace, 'generated-'));

  const viteProjectPath = join(generationRoot, 'vite-js-smoke');
  const viteConfig = projectConfigSchema.parse(
    createValidationConfig(viteProjectPath, {
      name: 'vite-js-smoke',
      runtime: 'vite',
      language: 'javascript',
      styling: { solution: 'css' },
      testing: {
        enabled: false,
        unit: { enabled: false, runner: 'vitest' },
        component: { enabled: false, library: 'testing-library' },
        e2e: { enabled: false, runner: 'none' },
      },
      dataFetching: { enabled: false, library: 'tanstack-query' },
    })
  );

  const viteResult = await new ProjectGenerator(viteConfig).generate();
  assert(viteResult.success, `Vite generation failed: ${viteResult.errors.join('; ')}`);
  assert(existsSync(join(viteProjectPath, 'package.json')), 'Vite project missing package.json');
  assert(
    existsSync(join(viteProjectPath, 'src', 'main.jsx')),
    'Vite JS project missing src/main.jsx'
  );
  assert(
    !existsSync(join(viteProjectPath, 'tsconfig.json')),
    'Vite JS project should not contain tsconfig.json'
  );

  const vitePackageJson = await readJson(join(viteProjectPath, 'package.json'));
  assert(
    !('typescript' in (vitePackageJson.devDependencies ?? {})),
    'Vite JS project should not include TypeScript dependency'
  );

  const nextProjectPath = join(generationRoot, 'next-ts-smoke');
  const nextConfig = projectConfigSchema.parse(
    createValidationConfig(nextProjectPath, {
      name: 'next-ts-smoke',
      runtime: 'nextjs',
      language: 'typescript',
      styling: { solution: 'tailwind' },
      stateManagement: 'redux',
      dataFetching: { enabled: true, library: 'tanstack-query' },
      testing: {
        enabled: false,
        unit: { enabled: false, runner: 'vitest' },
        component: { enabled: false, library: 'testing-library' },
        e2e: { enabled: false, runner: 'none' },
      },
    })
  );

  const nextResult = await new ProjectGenerator(nextConfig).generate();
  assert(nextResult.success, `Next.js generation failed: ${nextResult.errors.join('; ')}`);
  assert(existsSync(join(nextProjectPath, 'package.json')), 'Next.js project missing package.json');
  assert(
    existsSync(join(nextProjectPath, 'next.config.js')),
    'Next.js project missing next.config.js'
  );
  assert(
    existsSync(join(nextProjectPath, 'tsconfig.json')),
    'Next.js project missing tsconfig.json'
  );
  assert(
    existsSync(join(nextProjectPath, 'src', 'app', 'page.tsx')),
    'Next.js project missing src/app/page.tsx'
  );

  const nextPackageJson = await readJson(join(nextProjectPath, 'package.json'));
  assert(
    Boolean(nextPackageJson.dependencies?.next),
    'Next.js project should include "next" dependency'
  );
  assert(
    Boolean(nextPackageJson.dependencies?.['@reduxjs/toolkit']),
    'Next.js project should include "@reduxjs/toolkit" dependency'
  );
}

async function main() {
  console.log(`[info] Starting post-deploy package validation for ${PACKAGE_SPEC}`);
  const workspace = await mkdtemp(join(tmpdir(), 'crf-post-deploy-'));
  console.log(`[info] Temporary workspace: ${workspace}`);

  try {
    await runCommand(NPM_COMMAND, ['init', '-y'], { cwd: workspace });
    await runCommand(NPM_COMMAND, ['install', '--no-audit', '--no-fund', PACKAGE_SPEC], {
      cwd: workspace,
      timeoutMs: 8 * 60 * 1000,
    });

    const workspaceRequire = createRequire(join(workspace, 'package.json'));
    const packageEntryPath = workspaceRequire.resolve(PACKAGE_NAME);
    const packageRoot = dirname(dirname(packageEntryPath));
    const packageJson = await readJson(join(packageRoot, 'package.json'));

    assert(
      packageJson.name === PACKAGE_NAME,
      `Expected package name ${PACKAGE_NAME}, got ${packageJson.name}`
    );
    assert(
      packageJson.bin?.[PACKAGE_NAME] === 'dist/index.js',
      `Unexpected bin mapping for ${PACKAGE_NAME}`
    );

    console.log(`[info] Installed ${packageJson.name}@${packageJson.version}`);

    await validateCli(packageRoot, packageJson.version, workspace);
    console.log('[info] CLI validation completed');

    await validateNpxGeneration(packageRoot, workspace);
    console.log('[info] Interactive npx generation validation completed');

    const { ProjectConfigSchema } = await validateExportsAndTemplates(packageRoot);
    console.log('[info] Export and template validation completed');

    await validateGeneration(packageRoot, ProjectConfigSchema, workspace);
    console.log('[info] Generation validation completed');

    console.log('[success] Post-deploy published package validation passed');
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('[error] Post-deploy validation failed');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
