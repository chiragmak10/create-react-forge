import type { ProjectConfig } from '../config/schema.js';

/**
 * Utility functions for template operations
 */

/**
 * Get template path for a configuration
 */
export function getTemplatePathForRuntime(runtime: 'vite' | 'nextjs'): string {
  return `runtime/${runtime}`;
}

/**
 * Get template path for styling solution
 */
export function getTemplatePathForStyling(styling: string): string {
  if (styling === 'css') return '';
  if (styling === 'tailwind') return 'styling/tailwind';
  if (styling === 'css-modules') return 'styling/css-modules';
  return `styling/${styling}`;
}

/**
 * Get template path for state management
 */
export function getTemplatePathForState(state: string): string {
  if (state === 'none') return '';
  return `state/${state}`;
}

/**
 * Get template path for testing setup
 */
export function getTemplatePathForTesting(runner: string): string {
  if (runner === 'none') return '';
  return `testing/${runner}`;
}

/**
 * Get template path for data fetching
 */
export function getTemplatePathForDataFetching(library: string): string {
  if (library === 'none') return '';
  return 'features/tanstack-query';
}

/**
 * Determine applicable template paths based on configuration
 */
export function getApplicableTemplatePaths(config: ProjectConfig): string[] {
  const templates: string[] = [];

  // Always include base template
  templates.push('base');

  // Runtime template
  templates.push(getTemplatePathForRuntime(config.runtime));

  // Styling template
  const stylingPath = getTemplatePathForStyling(config.styling.solution);
  if (stylingPath) {
    templates.push(stylingPath);
  }

  // State management template
  const statePath = getTemplatePathForState(config.stateManagement);
  if (statePath) {
    templates.push(statePath);
  }

  // Testing templates
  if (config.testing.enabled) {
    if (config.testing.unit?.enabled) {
      const unitPath = getTemplatePathForTesting(config.testing.unit.runner);
      if (unitPath) templates.push(unitPath);
    }
    if (config.testing.e2e?.enabled && config.testing.e2e.runner !== 'none') {
      const e2ePath = getTemplatePathForTesting(config.testing.e2e.runner);
      if (e2ePath) templates.push(e2ePath);
    }
  }

  // Data fetching template
  if (config.dataFetching.enabled) {
    templates.push(getTemplatePathForDataFetching('tanstack-query'));
  }

  return templates;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getApplicableTemplatePaths instead
 */
export function getApplicableTemplates(config: {
  runtime: string;
  styling: string;
  stateManagement: string;
  testing: { unit?: { enabled?: boolean }; e2e?: { enabled?: boolean } };
  dataFetching?: { enabled?: boolean };
}): string[] {
  const templates = ['base', getTemplatePathForRuntime(config.runtime as 'vite' | 'nextjs')];

  if (config.styling && config.styling !== 'css') {
    const stylingPath = getTemplatePathForStyling(config.styling);
    if (stylingPath) templates.push(stylingPath);
  }

  if (config.stateManagement && config.stateManagement !== 'none') {
    templates.push(getTemplatePathForState(config.stateManagement));
  }

  if (config.dataFetching?.enabled) {
    templates.push(getTemplatePathForDataFetching('tanstack-query'));
  }

  return templates;
}
