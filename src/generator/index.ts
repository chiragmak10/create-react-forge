import { execSync } from 'child_process';
import { existsSync } from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import type { ProjectConfig } from '../config/schema.js';
import { ProjectAssembler } from '../assembler/index.js';
import { TemplateRegistry } from '../templates/registry.js';
import { generateArchitectureDoc } from '../docs/architecture-generator.js';

/**
 * Project generation result
 */
export interface GenerationResult {
  success: boolean;
  projectPath: string;
  filesWritten: number;
  errors: string[];
  warnings: string[];
}

/**
 * Project generator - orchestrates the entire generation flow
 */
export class ProjectGenerator {
  private config: ProjectConfig;
  private registry: TemplateRegistry;
  private assembler: ProjectAssembler;

  constructor(config: ProjectConfig) {
    this.config = config;
    this.registry = new TemplateRegistry();
    this.assembler = new ProjectAssembler(config.path, config);
  }

  /**
   * Generate the project
   */
  async generate(): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: false,
      projectPath: this.config.path,
      filesWritten: 0,
      errors: [],
      warnings: [],
    };

    const spinner = ora();

    try {
      // Step 1: Check if directory already exists
      if (existsSync(this.config.path)) {
        result.errors.push(`Directory already exists: ${this.config.path}`);
        return result;
      }

      // Step 2: Load templates
      spinner.start('Loading templates...');
      const templates = this.registry.loadTemplatesForConfig({
        runtime: this.config.runtime,
        styling: this.config.styling,
        stateManagement: this.config.stateManagement,
        testing: {
          enabled: this.config.testing.enabled,
          unit: this.config.testing.unit,
          e2e: this.config.testing.e2e,
        },
        dataFetching: this.config.dataFetching,
      });
      spinner.succeed(`Loaded ${templates.length} templates`);

      // Step 3: Merge all template files
      spinner.start('Assembling project files...');
      const mergedFiles = this.registry.getMergedFiles();
      this.assembler.addFiles(mergedFiles);

      // Add Architecture Documentation
      const archDoc = generateArchitectureDoc(this.config);
      this.assembler.addFile('ARCHITECTURE.md', archDoc);

      // Step 4: Merge dependencies
      const { dependencies, devDependencies, scripts } = this.registry.getMergedDependencies();
      this.assembler.mergeTemplateDeps({ dependencies, devDependencies, scripts });

      // Add TypeScript if configured
      if (this.config.language === 'typescript') {
        this.assembler.addDevDependencies({
          'typescript': '^5.3.0',
        });
      }

      spinner.succeed(`Assembled ${mergedFiles.size} files`);

      // Step 5: Write files to disk
      spinner.start('Writing files...');
      const writeResult = this.assembler.writeFiles();
      result.filesWritten = writeResult.filesWritten;

      if (writeResult.errors.length > 0) {
        result.errors.push(...writeResult.errors);
        spinner.warn(`Written ${writeResult.filesWritten} files with ${writeResult.errors.length} errors`);
      } else {
        spinner.succeed(`Written ${writeResult.filesWritten} files`);
      }

      // Step 6: Initialize git if configured
      if (this.config.git.init) {
        spinner.start('Initializing git repository...');
        try {
          this.initializeGit();
          spinner.succeed('Git repository initialized');
        } catch (error) {
          result.warnings.push(`Git initialization failed: ${error}`);
          spinner.warn('Git initialization failed');
        }
      }

      // Step 7: Install dependencies if user confirms
      // (We'll skip automatic installation for now and let user do it)
      console.log();
      console.log(chalk.green('✓ Project created successfully!'));
      console.log();
      console.log(chalk.cyan('Next steps:'));
      console.log(chalk.gray(`  cd ${this.config.name}`));
      console.log(chalk.gray(`  ${this.getInstallCommand()}`));
      console.log(chalk.gray(`  ${this.getDevCommand()}`));
      console.log();

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      spinner.fail('Generation failed');
      result.errors.push(`Generation error: ${error}`);
      return result;
    }
  }

  /**
   * Initialize git repository
   */
  private initializeGit(): void {
    execSync('git init', {
      cwd: this.config.path,
      stdio: 'ignore',
    });

    // Create .gitignore if it doesn't exist
    const gitignoreContent = `# Dependencies
node_modules/

# Build output
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Playwright
test-results/
playwright-report/
`;

    this.assembler.addFile('.gitignore', gitignoreContent);

    if (this.config.git.initialCommit) {
      try {
        execSync('git add -A', {
          cwd: this.config.path,
          stdio: 'ignore',
        });
        execSync('git commit -m "Initial commit from react-setup"', {
          cwd: this.config.path,
          stdio: 'ignore',
        });
      } catch {
        // Git commit may fail if git user is not configured
      }
    }
  }

  /**
   * Get the install command based on package manager
   */
  private getInstallCommand(): string {
    const commands: Record<string, string> = {
      npm: 'npm install',
      yarn: 'yarn',
      pnpm: 'pnpm install',
    };
    return commands[this.config.packageManager] || 'npm install';
  }

  /**
   * Get the dev command based on package manager
   */
  private getDevCommand(): string {
    const commands: Record<string, string> = {
      npm: 'npm run dev',
      yarn: 'yarn dev',
      pnpm: 'pnpm dev',
    };
    return commands[this.config.packageManager] || 'npm run dev';
  }
}

/**
 * Generate a project from configuration
 */
export async function generateProject(config: ProjectConfig): Promise<GenerationResult> {
  const generator = new ProjectGenerator(config);
  return generator.generate();
}

