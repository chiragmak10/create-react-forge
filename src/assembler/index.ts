import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import type { ProjectConfig } from '../config/schema.js';

/**
 * Manages assembly of generated project files
 */
export class ProjectAssembler {
  private projectPath: string;
  private config: ProjectConfig;
  private fileMap: Map<string, string> = new Map();
  private packageJson: Record<string, unknown> = {};

  constructor(projectPath: string, config: ProjectConfig) {
    this.projectPath = projectPath;
    this.config = config;
  }

  /**
   * Add a file to the project
   */
  addFile(filePath: string, content: string): void {
    this.fileMap.set(filePath, content);
  }

  /**
   * Get all registered files
   */
  getFiles(): Map<string, string> {
    return new Map(this.fileMap);
  }

  /**
   * Set package.json content
   */
  setPackageJson(pkg: Record<string, unknown>): void {
    this.packageJson = { ...pkg };
  }

  /**
   * Get package.json
   */
  getPackageJson(): Record<string, unknown> {
    return this.packageJson;
  }

  /**
   * Create project directory
   */
  async createProjectDirectory(): Promise<void> {
    await mkdir(this.projectPath, { recursive: true });
  }

  /**
   * Write all files to disk
   */
  async writeFiles(): Promise<void> {
    await this.createProjectDirectory();

    for (const [filePath, content] of this.fileMap.entries()) {
      const fullPath = join(this.projectPath, filePath);
      const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));

      await mkdir(dir, { recursive: true });
      await writeFile(fullPath, content, 'utf-8');
    }

    // Write package.json
    if (Object.keys(this.packageJson).length > 0) {
      const pkgPath = join(this.projectPath, 'package.json');
      await writeFile(pkgPath, JSON.stringify(this.packageJson, null, 2), 'utf-8');
    }
  }

  /**
   * Get configuration
   */
  getConfig(): ProjectConfig {
    return this.config;
  }
}
