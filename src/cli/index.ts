import chalk from 'chalk';
import { resolve } from 'path';
import { ConfigBuilder } from '../config/builder.js';
import { generateProject } from '../generator/index.js';
import type { PromptAnswers } from './prompts.js';
import { promptForProjectDetails } from './prompts.js';

/**
 * Convert prompt answers to ProjectConfig
 */
export function promptAnswersToConfig(answers: PromptAnswers) {
  const builder = new ConfigBuilder();

  // Resolve project path to absolute path
  const projectPath = resolve(process.cwd(), answers.projectPath);

  builder
    .setName(answers.projectName)
    .setPath(projectPath)
    .setRuntime(answers.runtime)
    .setLanguage(answers.language)
    .setStyling(answers.styling)
    .setStateManagement(answers.stateManagement)
    .setPackageManager(answers.packageManager)
    .setGitInit(answers.git)
    .setDataFetchingEnabled(answers.dataFetching);

  if (answers.testing !== 'none') {
    builder
      .setTestingEnabled(true)
      .setUnitTestRunner(answers.unitRunner)
      .setE2ETestRunner(answers.e2eRunner);
  } else {
    builder.setTestingEnabled(false);
  }

  if (!answers.git) {
    builder.setGitInit(false);
  }

  return builder.build();
}

/**
 * Validate user input
 */
export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: 'Project name is required' };
  }
  if (!/^[a-z0-9-]+$/.test(name)) {
    return { valid: false, error: 'Project name must be lowercase alphanumeric with hyphens' };
  }
  return { valid: true };
}

/**
 * Display project summary
 */
function displayProjectSummary(config: ReturnType<typeof promptAnswersToConfig>) {
  console.log(chalk.cyan('\n📋 Project Configuration:\n'));
  console.log(chalk.gray('  Name:            ') + chalk.white(config.name));
  console.log(chalk.gray('  Path:            ') + chalk.white(config.path));
  console.log(chalk.gray('  Runtime:         ') + chalk.white(config.runtime));
  console.log(chalk.gray('  Language:        ') + chalk.white(config.language));
  console.log(chalk.gray('  Styling:         ') + chalk.white(config.styling.solution));
  console.log(chalk.gray('  State:           ') + chalk.white(config.stateManagement || 'none'));
  console.log(chalk.gray('  Data Fetching:   ') + chalk.white(config.dataFetching.enabled ? 'TanStack Query' : 'none'));
  console.log(chalk.gray('  Testing:         ') + chalk.white(config.testing.enabled ? `${config.testing.unit?.runner}` : 'disabled'));
  if (config.testing.enabled && config.testing.e2e?.enabled) {
    console.log(chalk.gray('  E2E Testing:     ') + chalk.white(config.testing.e2e.runner));
  }
  console.log(chalk.gray('  Package Manager: ') + chalk.white(config.packageManager));
  console.log(chalk.gray('  Git:             ') + chalk.white(config.git.init ? 'yes' : 'no'));
  console.log();
}

/**
 * Main CLI entry point
 */
export async function main(): Promise<void> {
  console.log(chalk.cyan.bold('\n  ⚛️  create-react-forge\n'));
  console.log(chalk.gray('  Production-ready React scaffolder with first-class testing\n'));

  try {
    // Get user input
    const answers = await promptForProjectDetails();

    // Convert to config
    const config = promptAnswersToConfig(answers);

    // Validate
    const validation = new ConfigBuilder(config).validate();
    if (!validation.success) {
      console.error(chalk.red('\n❌ Configuration validation failed:'));
      validation.errors?.forEach((error) => console.error(chalk.red(`  • ${error}`)));
      process.exit(1);
    }

    // Display summary
    displayProjectSummary(config);

    // Generate project
    console.log(chalk.cyan('🚀 Creating project...\n'));
    const result = await generateProject(config);

    if (!result.success) {
      console.error(chalk.red('\n❌ Project generation failed:'));
      result.errors.forEach((error) => console.error(chalk.red(`  • ${error}`)));
      process.exit(1);
    }

    if (result.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      result.warnings.forEach((warning) => console.log(chalk.yellow(`  • ${warning}`)));
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'User force closed the prompt') {
      console.log(chalk.yellow('\n✋ Setup cancelled\n'));
      process.exit(0);
    }
    throw error;
  }
}
