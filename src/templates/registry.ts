import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

/**
 * Template manifest - metadata for each template overlay
 */
export interface TemplateManifest {
  name: string;
  version: string;
  description?: string;
  compatibleWith?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  filePatterns?: {
    include?: string[];
    exclude?: string[];
  };
}

/**
 * Template overlay - a composable set of files and configuration
 */
export interface TemplateOverlay {
  name: string;
  path: string;
  manifest: TemplateManifest;
  files: Map<string, string>;
}

/**
 * Get the templates directory path
 */
function getTemplatesDir(): string {
  // Handle both ESM and compiled scenarios
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);
  
  // Check if we're in dist or src
  if (currentDir.includes('/dist/')) {
    // Running from compiled dist, templates are in src
    return join(currentDir, '../../src/templates/overlays');
  }
  
  return join(currentDir, 'overlays');
}

/**
 * Binary file extensions to skip
 */
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.wav', '.ogg', '.webm',
  '.zip', '.tar', '.gz', '.rar',
  '.pdf', '.doc', '.docx',
]);

/**
 * Check if a file is binary based on extension
 */
function isBinaryFile(filePath: string): boolean {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

/**
 * Recursively read all files in a directory
 */
function readDirectoryRecursively(
  dirPath: string,
  basePath: string = dirPath,
  exclude: string[] = ['manifest.json']
): Map<string, string> {
  const files = new Map<string, string>();

  if (!existsSync(dirPath)) {
    return files;
  }

  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const relativePath = relative(basePath, fullPath);

    // Skip excluded files
    if (exclude.includes(entry) || exclude.includes(relativePath)) {
      continue;
    }

    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively read subdirectory
      const subFiles = readDirectoryRecursively(fullPath, basePath, exclude);
      subFiles.forEach((content, path) => files.set(path, content));
    } else if (stat.isFile()) {
      // Read file content (skip binary files)
      if (!isBinaryFile(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          files.set(relativePath, content);
        } catch {
          // Skip files that can't be read as text
        }
      } else {
        // For binary files, store a marker to copy them
        files.set(relativePath, `__BINARY__:${fullPath}`);
      }
    }
  }

  return files;
}

/**
 * Template registry - manages template discovery and loading
 */
export class TemplateRegistry {
  private loadedTemplates: Map<string, TemplateOverlay> = new Map();
  private templatesDir: string;

  constructor(templatesDir?: string) {
    this.templatesDir = templatesDir || getTemplatesDir();
  }

  /**
   * Load a template manifest from path
   */
  loadManifest(manifestPath: string): TemplateManifest {
    try {
      const content = readFileSync(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load manifest from '${manifestPath}': ${error}`);
    }
  }

  /**
   * Load a template overlay from a directory
   */
  loadTemplate(templatePath: string): TemplateOverlay {
    const fullPath = join(this.templatesDir, templatePath);
    const manifestPath = join(fullPath, 'manifest.json');

    if (!existsSync(manifestPath)) {
      throw new Error(`Template manifest not found: ${manifestPath}`);
    }

    const manifest = this.loadManifest(manifestPath);
    const exclude = ['manifest.json', ...(manifest.filePatterns?.exclude || [])];
    const files = readDirectoryRecursively(fullPath, fullPath, exclude);

    const overlay: TemplateOverlay = {
      name: manifest.name,
      path: templatePath,
      manifest,
      files,
    };

    return overlay;
  }

  /**
   * Load and register a template
   */
  loadAndRegister(templatePath: string): TemplateOverlay {
    const overlay = this.loadTemplate(templatePath);
    this.loadedTemplates.set(templatePath, overlay);
    return overlay;
  }

  /**
   * Register a template overlay
   */
  register(name: string, overlay: TemplateOverlay): void {
    this.loadedTemplates.set(name, overlay);
  }

  /**
   * Get a loaded template
   */
  get(name: string): TemplateOverlay | undefined {
    return this.loadedTemplates.get(name);
  }

  /**
   * List all loaded templates
   */
  list(): TemplateOverlay[] {
    return Array.from(this.loadedTemplates.values());
  }

  /**
   * Get templates by category
   */
  getByCategory(category: 'base' | 'runtime' | 'feature' | 'testing'): TemplateOverlay[] {
    return Array.from(this.loadedTemplates.values()).filter((t) =>
      t.path.includes(`/${category}/`) || t.path.startsWith(`${category}/`) || t.path === category
    );
  }

  /**
   * Load multiple templates for a project configuration
   */
  loadTemplatesForConfig(config: {
    runtime: 'vite' | 'nextjs';
    styling: { solution: string };
    stateManagement: string;
    testing: { enabled: boolean; unit?: { runner: string }; e2e?: { enabled: boolean; runner: string } };
    dataFetching: { enabled: boolean };
  }): TemplateOverlay[] {
    const templates: TemplateOverlay[] = [];

    // Always load base template
    templates.push(this.loadAndRegister('base'));

    // Load runtime template
    templates.push(this.loadAndRegister(`runtime/${config.runtime}`));

    // Load styling template
    if (config.styling.solution === 'tailwind') {
      templates.push(this.loadAndRegister('styling/tailwind'));
    } else if (config.styling.solution === 'css-modules') {
      templates.push(this.loadAndRegister('styling/css-modules'));
    }

    // Load state management template
    if (config.stateManagement && config.stateManagement !== 'none') {
      templates.push(this.loadAndRegister(`state/${config.stateManagement}`));
    }

    // Load testing templates
    if (config.testing.enabled) {
      if (config.testing.unit?.runner) {
        templates.push(this.loadAndRegister(`testing/${config.testing.unit.runner}`));
      }
      if (config.testing.e2e?.enabled && config.testing.e2e.runner && config.testing.e2e.runner !== 'none') {
        templates.push(this.loadAndRegister(`testing/${config.testing.e2e.runner}`));
      }
    }

    // Load data fetching template
    if (config.dataFetching.enabled) {
      templates.push(this.loadAndRegister('features/tanstack-query'));
    }

    return templates;
  }

  /**
   * Get all dependencies from a set of templates
   */
  getDependencies(templateNames: string[]): {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  } {
    const deps: Record<string, string> = {};
    const devDeps: Record<string, string> = {};

    for (const name of templateNames) {
      const template = this.get(name);
      if (!template) continue;

      Object.assign(deps, template.manifest.dependencies || {});
      Object.assign(devDeps, template.manifest.devDependencies || {});
    }

    return { dependencies: deps, devDependencies: devDeps };
  }

  /**
   * Get merged scripts from templates
   */
  getScripts(templateNames: string[]): Record<string, string> {
    const scripts: Record<string, string> = {};

    for (const name of templateNames) {
      const template = this.get(name);
      if (!template) continue;

      Object.assign(scripts, template.manifest.scripts || {});
    }

    return scripts;
  }

  /**
   * Get all files from loaded templates merged together
   */
  getMergedFiles(): Map<string, string> {
    const mergedFiles = new Map<string, string>();

    for (const template of this.loadedTemplates.values()) {
      template.files.forEach((content, path) => {
        mergedFiles.set(path, content);
      });
    }

    return mergedFiles;
  }

  /**
   * Get merged dependencies from all loaded templates
   */
  getMergedDependencies(): {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
  } {
    const deps: Record<string, string> = {};
    const devDeps: Record<string, string> = {};
    const scripts: Record<string, string> = {};

    for (const template of this.loadedTemplates.values()) {
      Object.assign(deps, template.manifest.dependencies || {});
      Object.assign(devDeps, template.manifest.devDependencies || {});
      Object.assign(scripts, template.manifest.scripts || {});
    }

    return { dependencies: deps, devDependencies: devDeps, scripts };
  }
}
