import { readFileSync } from 'fs';

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
  files?: Record<string, string>;
}

/**
 * Template registry - manages template discovery and loading
 */
export class TemplateRegistry {
  private loadedTemplates: Map<string, TemplateOverlay> = new Map();

  constructor() {
    // Template registry for managing overlays
  }

  /**
   * Load a template manifest
   */
  loadManifest(name: string, manifestPath: string): TemplateManifest {
    try {
      const content = readFileSync(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load manifest for template '${name}': ${error}`);
    }
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
      t.path.includes(`/${category}/`)
    );
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
}




