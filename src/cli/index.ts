import chalk from 'chalk';
import { ConfigBuilder } from '../config/builder.js';
import type { PromptAnswers } from './prompts.js';
import { promptForProjectDetails } from './prompts.js';

/**
 * Convert prompt answers to ProjectConfig
 */
export function promptAnswersToConfig(answers: PromptAnswers) {
  const builder = new ConfigBuilder();

  builder
    .setName(answers.projectName)
    .setPath(answers.projectPath)
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
 * Main CLI entry point
 */
export async function main(): Promise<void> {
  console.log(chalk.cyan.bold('\n  ⚛️  react-setup\n'));
  console.log(chalk.gray('Production-ready React scaffolder with first-class testing\n'));

  try {
    // Get user input
    const answers = await promptForProjectDetails();

    // Convert to config
    const config = promptAnswersToConfig(answers);

    // Validate
    const validation = new ConfigBuilder(config).validate();
    if (!validation.success) {
      console.error(chalk.red('❌ Configuration validation failed:'));
      validation.errors?.forEach((error) => console.error(chalk.red(`  • ${error}`)));
      process.exit(1);
    }

    console.log(chalk.green('\n✅ Configuration valid\n'));
    console.log(chalk.cyan('Project summary:'));
    console.log(chalk.gray(`  Name: ${config.name}`));
    console.log(chalk.gray(`  Path: ${config.path}`));
    console.log(chalk.gray(`  Runtime: ${config.runtime}`));
    console.log(chalk.gray(`  Language: ${config.language}`));
    console.log(chalk.gray(`  Styling: ${config.styling.solution}`));
    console.log();

    // TODO: Pass config to assembler and lifecycle
    console.log(chalk.yellow('Note: Project generation not yet implemented\n'));
  } catch (error) {
    if (error instanceof Error && error.message === 'User force closed the prompt') {
      console.log(chalk.yellow('\n✋ Setup cancelled\n'));
      process.exit(0);
    }
    throw error;
  }
}




