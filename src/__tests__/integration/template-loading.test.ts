import { beforeEach, describe, expect, it } from 'vitest';
import { TemplateRegistry } from '../../templates/registry.js';

/**
 * Integration tests for template loading and merging
 * Ensures templates load correctly and merge properly
 */

describe('TemplateRegistry', () => {
  let registry: TemplateRegistry;

  beforeEach(() => {
    registry = new TemplateRegistry();
  });

  describe('Template Loading', () => {
    it('should load base template', () => {
      const template = registry.loadAndRegister('base');
      
      expect(template).toBeDefined();
      expect(template.name).toBe('base');
      expect(template.manifest).toBeDefined();
      expect(template.files.size).toBeGreaterThan(0);
    });

    it('should load vite runtime template', () => {
      const template = registry.loadAndRegister('runtime/vite');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.files.size).toBeGreaterThan(0);
    });

    it('should load nextjs runtime template', () => {
      const template = registry.loadAndRegister('runtime/nextjs');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.files.size).toBeGreaterThan(0);
    });

    it('should load tailwind styling template', () => {
      const template = registry.loadAndRegister('styling/tailwind');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.manifest.devDependencies).toHaveProperty('tailwindcss');
    });

    it('should load zustand state template', () => {
      const template = registry.loadAndRegister('state/zustand');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.manifest.dependencies).toHaveProperty('zustand');
    });

    it('should load redux state template', () => {
      const template = registry.loadAndRegister('state/redux');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.manifest.dependencies).toHaveProperty('@reduxjs/toolkit');
    });

    it('should load jotai state template', () => {
      const template = registry.loadAndRegister('state/jotai');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.manifest.dependencies).toHaveProperty('jotai');
    });

    it('should load styled-components styling template', () => {
      const template = registry.loadAndRegister('styling/styled-components');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.manifest.dependencies).toHaveProperty('styled-components');
    });

    it('should load vitest testing template', () => {
      const template = registry.loadAndRegister('testing/vitest');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.manifest.devDependencies).toHaveProperty('vitest');
    });

    it('should load jest testing template', () => {
      const template = registry.loadAndRegister('testing/jest');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.manifest.devDependencies).toHaveProperty('jest');
    });

    it('should load playwright testing template', () => {
      const template = registry.loadAndRegister('testing/playwright');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.manifest.devDependencies).toHaveProperty('@playwright/test');
    });

    it('should load tanstack-query feature template', () => {
      const template = registry.loadAndRegister('features/tanstack-query');
      
      expect(template).toBeDefined();
      expect(template.manifest).toBeDefined();
      expect(template.manifest.dependencies).toHaveProperty('@tanstack/react-query');
    });

    it('should throw error for non-existent template', () => {
      expect(() => registry.loadAndRegister('non-existent')).toThrow();
    });
  });

  describe('loadTemplatesForConfig', () => {
    it('should load templates for minimal Vite config with styled-components', () => {
      const templates = registry.loadTemplatesForConfig({
        runtime: 'vite',
        styling: { solution: 'styled-components' },
        stateManagement: 'none',
        testing: {
          enabled: false,
          unit: { runner: 'vitest' },
          e2e: { enabled: false, runner: 'none' },
        },
        dataFetching: { enabled: false },
      });

      // Should have base, runtime, and styled-components
      expect(templates.length).toBeGreaterThanOrEqual(3);
      expect(templates.some(t => t.name === 'base')).toBe(true);
      expect(templates.some(t => t.path === 'styling/styled-components')).toBe(true);
    });

    it('should load templates for Next.js + Tailwind config', () => {
      const templates = registry.loadTemplatesForConfig({
        runtime: 'nextjs',
        styling: { solution: 'tailwind' },
        stateManagement: 'none',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      expect(templates.some(t => t.path === 'styling/tailwind')).toBe(true);
    });

    it('should load templates for Next.js + None styling config', () => {
      const templates = registry.loadTemplatesForConfig({
        runtime: 'nextjs',
        styling: { solution: 'none' },
        stateManagement: 'none',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      // Should NOT load any styling template for 'none'
      expect(templates.some(t => t.path === 'styling/tailwind')).toBe(false);
      expect(templates.some(t => t.path === 'styling/styled-components')).toBe(false);
    });

    it('should load templates for Next.js + Redux config', () => {
      const templates = registry.loadTemplatesForConfig({
        runtime: 'nextjs',
        styling: { solution: 'none' },
        stateManagement: 'redux',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      expect(templates.some(t => t.path === 'runtime/nextjs')).toBe(true);
      expect(templates.some(t => t.path === 'state/redux')).toBe(true);
    });

    it('should load templates for Vite + Jotai config', () => {
      const templates = registry.loadTemplatesForConfig({
        runtime: 'vite',
        styling: { solution: 'styled-components' },
        stateManagement: 'jotai',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      expect(templates.some(t => t.path === 'runtime/vite')).toBe(true);
      expect(templates.some(t => t.path === 'state/jotai')).toBe(true);
      expect(templates.some(t => t.path === 'styling/styled-components')).toBe(true);
    });

    it('should load testing templates when testing is enabled', () => {
      const templates = registry.loadTemplatesForConfig({
        runtime: 'vite',
        styling: { solution: 'styled-components' },
        stateManagement: 'none',
        testing: {
          enabled: true,
          unit: { runner: 'vitest' },
          e2e: { enabled: true, runner: 'playwright' },
        },
        dataFetching: { enabled: false },
      });

      expect(templates.some(t => t.path === 'testing/vitest')).toBe(true);
      expect(templates.some(t => t.path === 'testing/playwright')).toBe(true);
    });

    it('should load tanstack-query template when dataFetching enabled', () => {
      const templates = registry.loadTemplatesForConfig({
        runtime: 'vite',
        styling: { solution: 'styled-components' },
        stateManagement: 'none',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: true },
      });

      expect(templates.some(t => t.path === 'features/tanstack-query')).toBe(true);
    });
  });

  describe('Merged Dependencies', () => {
    it('should merge dependencies from multiple templates', () => {
      registry.loadTemplatesForConfig({
        runtime: 'nextjs',
        styling: { solution: 'tailwind' },
        stateManagement: 'zustand',
        testing: {
          enabled: true,
          unit: { runner: 'vitest' },
          e2e: { enabled: true, runner: 'playwright' },
        },
        dataFetching: { enabled: true },
      });

      const { dependencies, devDependencies } = registry.getMergedDependencies();

      // Check deps from different templates
      expect(dependencies).toHaveProperty('zustand'); // from zustand
      expect(dependencies).toHaveProperty('@tanstack/react-query'); // from tanstack-query
      expect(devDependencies).toHaveProperty('tailwindcss'); // from tailwind
      expect(devDependencies).toHaveProperty('vitest'); // from vitest
      expect(devDependencies).toHaveProperty('@playwright/test'); // from playwright
    });

    it('should include scripts from templates', () => {
      registry.loadTemplatesForConfig({
        runtime: 'vite',
        styling: { solution: 'styled-components' },
        stateManagement: 'none',
        testing: {
          enabled: true,
          unit: { runner: 'vitest' },
          e2e: { enabled: false, runner: 'none' },
        },
        dataFetching: { enabled: false },
      });

      const { scripts } = registry.getMergedDependencies();

      expect(scripts).toHaveProperty('test');
    });
  });

  describe('Merged Files', () => {
    it('should merge files from multiple templates', () => {
      registry.loadTemplatesForConfig({
        runtime: 'nextjs',
        styling: { solution: 'tailwind' },
        stateManagement: 'zustand',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      const files = registry.getMergedFiles();

      expect(files.size).toBeGreaterThan(0);
      
      // Check for store files from zustand
      const hasStoreFiles = Array.from(files.keys()).some(
        path => path.includes('stores')
      );
      expect(hasStoreFiles).toBe(true);
    });

    it('should override base files with runtime-specific files', () => {
      // Load base first, then runtime
      registry.loadTemplatesForConfig({
        runtime: 'vite',
        styling: { solution: 'styled-components' },
        stateManagement: 'none',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      const files = registry.getMergedFiles();

      // Should have runtime-specific App.tsx, not base
      const appFiles = Array.from(files.keys()).filter(
        path => path.includes('App.tsx')
      );
      expect(appFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Template Manifest Validation', () => {
    it('should have valid manifest for all templates', () => {
      const templatePaths = [
        'base',
        'runtime/vite',
        'runtime/nextjs',
        'styling/tailwind',
        'styling/styled-components',
        'state/zustand',
        'state/redux',
        'state/jotai',
        'testing/vitest',
        'testing/jest',
        'testing/playwright',
        'features/tanstack-query',
      ];

      for (const path of templatePaths) {
        const template = registry.loadTemplate(path);
        
        expect(template.manifest, `Manifest missing for ${path}`).toBeDefined();
        expect(template.manifest.name, `Name missing for ${path}`).toBeDefined();
        expect(template.manifest.version, `Version missing for ${path}`).toBeDefined();
      }
    });

    it('should have valid dependency versions in manifests', () => {
      const templatePaths = [
        'state/zustand',
        'state/redux',
        'state/jotai',
        'styling/styled-components',
        'testing/vitest',
        'testing/playwright',
        'features/tanstack-query',
      ];

      const semverPattern = /^[\^~>=<]*\d+\.\d+\.\d+(-[\w.]+)?$/;

      for (const path of templatePaths) {
        const template = registry.loadTemplate(path);
        const allDeps = {
          ...template.manifest.dependencies,
          ...template.manifest.devDependencies,
        };

        for (const [name, version] of Object.entries(allDeps)) {
          expect(
            version,
            `Invalid version for ${name} in ${path}: ${version}`
          ).toMatch(semverPattern);
        }
      }
    });
  });
});
