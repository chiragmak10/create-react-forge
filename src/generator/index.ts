import chalk from 'chalk';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import ora from 'ora';
import ts from 'typescript';
import { ProjectAssembler } from '../assembler/index.js';
import type { ProjectConfig } from '../config/schema.js';
import { VERSION_REGISTRY } from '../dependencies/resolver.js';
import { generateArchitectureDoc, generateReadme } from '../docs/index.js';
import { TemplateRegistry } from '../templates/registry.js';

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
      const languageAdjustedFiles = this.adjustTemplateFilesForLanguage(mergedFiles);
      this.assembler.addFiles(languageAdjustedFiles);

      // Add Architecture Documentation
      const archDoc = generateArchitectureDoc(this.config);
      this.assembler.addFile('ARCHITECTURE.md', archDoc);

      // Add README Documentation
      const readmeDoc = generateReadme(this.config);
      this.assembler.addFile('README.md', readmeDoc);

      // Step 4: Merge dependencies
      const mergedDeps = this.registry.getMergedDependencies();
      this.assembler.mergeTemplateDeps(this.adjustTemplatePackageDataForLanguage(mergedDeps));

      // Add TypeScript if configured
      if (this.config.language === 'typescript') {
        this.assembler.addDevDependencies({
          typescript: VERSION_REGISTRY.typescript,
        });
      }

      // Add .gitignore before writing files, so it is persisted on disk.
      if (this.config.git.init) {
        this.assembler.addFile('.gitignore', this.getGitignoreContent());
      }

      spinner.succeed(`Assembled ${languageAdjustedFiles.size} files`);

      // Step 5: Write files to disk
      spinner.start('Writing files...');
      const writeResult = this.assembler.writeFiles();
      result.filesWritten = writeResult.filesWritten;

      if (writeResult.errors.length > 0) {
        result.errors.push(...writeResult.errors);
        spinner.warn(
          `Written ${writeResult.filesWritten} files with ${writeResult.errors.length} errors`
        );
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

  private adjustTemplateFilesForLanguage(files: Map<string, string>): Map<string, string> {
    if (this.config.language === 'typescript') {
      return files;
    }

    const adjusted = new Map<string, string>();

    for (const [filePath, content] of files.entries()) {
      const adjustedPath = this.getLanguageAdjustedPath(filePath);
      if (!adjustedPath) {
        continue;
      }

      const adjustedContent = this.getLanguageAdjustedContent(filePath, content);
      if (adjustedContent === null) {
        continue;
      }

      adjusted.set(adjustedPath, adjustedContent);
    }

    return adjusted;
  }

  private getLanguageAdjustedPath(filePath: string): string | null {
    if (this.config.language === 'typescript') {
      return filePath;
    }

    if (this.isTypeScriptOnlyFile(filePath)) {
      return null;
    }

    if (filePath.endsWith('.tsx')) {
      return `${filePath.slice(0, -4)}.jsx`;
    }

    if (filePath.endsWith('.ts')) {
      return `${filePath.slice(0, -3)}.js`;
    }

    return filePath;
  }

  private getLanguageAdjustedContent(filePath: string, content: string): string | null {
    if (content.startsWith('__BINARY__:') || this.config.language === 'typescript') {
      return content;
    }

    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const transpiled = this.transpileTemplateToJavaScript(filePath, content);
      const normalized = this.rewriteTypeScriptFileReferences(transpiled);

      // Type-only template files compile to an empty module in JavaScript projects.
      if (normalized.trim() === 'export {};') {
        return null;
      }

      return normalized;
    }

    return this.rewriteTypeScriptFileReferences(content);
  }

  private transpileTemplateToJavaScript(filePath: string, content: string): string {
    const transpiled = ts.transpileModule(content, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2021,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        jsx: ts.JsxEmit.Preserve,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
      },
      fileName: filePath,
      reportDiagnostics: false,
    });

    return transpiled.outputText;
  }

  private rewriteTypeScriptFileReferences(content: string): string {
    return content.replace(/\.tsx\b/g, '.jsx').replace(/(?<!\.d)\.ts\b/g, '.js');
  }

  private isTypeScriptOnlyFile(filePath: string): boolean {
    return filePath.endsWith('.d.ts') || /(^|\/)tsconfig(\..+)?\.json$/.test(filePath);
  }

  private adjustTemplatePackageDataForLanguage(data: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  }): {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  } {
    if (this.config.language === 'typescript') {
      return data;
    }

    const dependencies = { ...data.dependencies };
    const devDependencies = { ...data.devDependencies };
    const scripts = { ...data.scripts };

    for (const dep of Object.keys(dependencies)) {
      if (this.isTypeScriptOnlyDependency(dep)) {
        delete dependencies[dep];
      }
    }

    for (const dep of Object.keys(devDependencies)) {
      if (this.isTypeScriptOnlyDependency(dep)) {
        delete devDependencies[dep];
      }
    }

    for (const [name, command] of Object.entries(scripts)) {
      scripts[name] = this.rewriteTypeScriptFileReferences(command).replace(
        /^tsc\s+-b\s*&&\s*/,
        ''
      );
    }

    return { dependencies, devDependencies, scripts };
  }

  private isTypeScriptOnlyDependency(packageName: string): boolean {
    return (
      packageName === 'typescript' || packageName === 'ts-jest' || packageName.startsWith('@types/')
    );
  }

  /**
   * Initialize git repository
   */
  private initializeGit(): void {
    execSync('git init', {
      cwd: this.config.path,
      stdio: 'ignore',
    });

    if (this.config.git.initialCommit) {
      try {
        execSync('git add -A', {
          cwd: this.config.path,
          stdio: 'ignore',
        });
        execSync('git commit -m "Initial commit from create-react-forge"', {
          cwd: this.config.path,
          stdio: 'ignore',
        });
      } catch {
        // Git commit may fail if git user is not configured
      }
    }
  }

  private getGitignoreContent(): string {
    return `# Dependencies
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
