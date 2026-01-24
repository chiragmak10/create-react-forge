import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import type { ProjectConfig } from '../config/schema.js';

/**
 * Template variable substitution patterns
 */
const TEMPLATE_VARIABLES: Record<string, (config: ProjectConfig) => string> = {
  '{{PROJECT_NAME}}': (config) => config.name,
  '{{PROJECT_DESCRIPTION}}': () => 'A production-ready React application',
  '{{AUTHOR}}': () => '',
  '{{LICENSE}}': () => 'MIT',
};

/**
 * Apply template variable substitution to content
 */
function applyTemplateVariables(content: string, config: ProjectConfig): string {
  let result = content;
  
  for (const [pattern, getValue] of Object.entries(TEMPLATE_VARIABLES)) {
    result = result.replaceAll(pattern, getValue(config));
  }
  
  return result;
}

/**
 * Manages assembly of generated project files
 */
export class ProjectAssembler {
  private projectPath: string;
  private config: ProjectConfig;
  private fileMap: Map<string, string> = new Map();
  private packageJson: PackageJson;

  constructor(projectPath: string, config: ProjectConfig) {
    this.projectPath = projectPath;
    this.config = config;
    this.packageJson = this.createBasePackageJson();
  }

  /**
   * Create base package.json structure
   */
  private createBasePackageJson(): PackageJson {
    return {
      name: this.config.name,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {},
      dependencies: {},
      devDependencies: {},
    };
  }

  /**
   * Add a file to the project
   */
  addFile(filePath: string, content: string): void {
    // Apply template variable substitution
    const processedContent = applyTemplateVariables(content, this.config);
    this.fileMap.set(filePath, processedContent);
  }

  /**
   * Add multiple files from a Map
   */
  addFiles(files: Map<string, string>): void {
    files.forEach((content, path) => {
      this.addFile(path, content);
    });
  }

  /**
   * Get all registered files
   */
  getFiles(): Map<string, string> {
    return new Map(this.fileMap);
  }

  /**
   * Add dependencies to package.json
   */
  addDependencies(deps: Record<string, string>): void {
    this.packageJson.dependencies = {
      ...this.packageJson.dependencies,
      ...deps,
    };
  }

  /**
   * Add dev dependencies to package.json
   */
  addDevDependencies(devDeps: Record<string, string>): void {
    this.packageJson.devDependencies = {
      ...this.packageJson.devDependencies,
      ...devDeps,
    };
  }

  /**
   * Add scripts to package.json
   */
  addScripts(scripts: Record<string, string>): void {
    this.packageJson.scripts = {
      ...this.packageJson.scripts,
      ...scripts,
    };
  }

  /**
   * Merge template dependencies and scripts
   */
  mergeTemplateDeps(data: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  }): void {
    this.addDependencies(data.dependencies);
    this.addDevDependencies(data.devDependencies);
    this.addScripts(data.scripts);
  }

  /**
   * Set package.json content
   */
  setPackageJson(pkg: PackageJson): void {
    this.packageJson = { ...pkg };
  }

  /**
   * Get package.json
   */
  getPackageJson(): PackageJson {
    return this.packageJson;
  }

  /**
   * Sort dependencies alphabetically
   */
  private sortDependencies(deps: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(deps).sort(([a], [b]) => a.localeCompare(b))
    );
  }

  /**
   * Finalize package.json with sorted dependencies
   */
  private finalizePackageJson(): PackageJson {
    return {
      ...this.packageJson,
      dependencies: this.sortDependencies(this.packageJson.dependencies || {}),
      devDependencies: this.sortDependencies(this.packageJson.devDependencies || {}),
    };
  }

  /**
   * Create project directory
   */
  createProjectDirectory(): void {
    if (!existsSync(this.projectPath)) {
      mkdirSync(this.projectPath, { recursive: true });
    }
  }

  /**
   * Write a single file to disk
   */
  private writeFile(relativePath: string, content: string): void {
    const fullPath = join(this.projectPath, relativePath);
    const dir = dirname(fullPath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Handle binary files (marked with __BINARY__:)
    if (content.startsWith('__BINARY__:')) {
      const sourcePath = content.replace('__BINARY__:', '');
      copyFileSync(sourcePath, fullPath);
    } else {
      writeFileSync(fullPath, content, 'utf-8');
    }
  }

  /**
   * Write all files to disk
   */
  writeFiles(): { filesWritten: number; errors: string[] } {
    const errors: string[] = [];
    let filesWritten = 0;

    this.createProjectDirectory();

    for (const [filePath, content] of this.fileMap.entries()) {
      try {
        this.writeFile(filePath, content);
        filesWritten++;
      } catch (error) {
        errors.push(`Failed to write ${filePath}: ${error}`);
      }
    }

    // Write package.json
    try {
      const pkgPath = join(this.projectPath, 'package.json');
      const finalPkg = this.finalizePackageJson();
      writeFileSync(pkgPath, JSON.stringify(finalPkg, null, 2) + '\n', 'utf-8');
      filesWritten++;
    } catch (error) {
      errors.push(`Failed to write package.json: ${error}`);
    }

    return { filesWritten, errors };
  }

  /**
   * Get configuration
   */
  getConfig(): ProjectConfig {
    return this.config;
  }

  /**
   * Get project path
   */
  getProjectPath(): string {
    return this.projectPath;
  }
}

/**
 * Package.json structure
 */
export interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}
