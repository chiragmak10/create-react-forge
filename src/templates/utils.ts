/**
 * Utility functions for template operations
 */

/**
 * Get template path for a configuration
 */
export function getTemplatePathForRuntime(runtime: 'vite' | 'nextjs'): string {
  return `overlays/runtime/${runtime}`;
}

/**
 * Get template path for styling solution
 */
export function getTemplatePathForStyling(styling: string): string {
  return `overlays/features/${styling}`;
}

/**
 * Get template path for state management
 */
export function getTemplatePathForState(state: string): string {
  if (state === 'none') return '';
  return `overlays/features/${state}`;
}

/**
 * Get template path for testing setup
 */
export function getTemplatePathForTesting(runner: string): string {
  return `overlays/testing/${runner}`;
}

/**
 * Get template path for data fetching
 */
export function getTemplatePathForDataFetching(library: string): string {
  if (library === 'none') return '';
  return `overlays/features/${library}`;
}

/**
 * Determine applicable templates based on configuration
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
    templates.push(getTemplatePathForStyling(config.styling));
  }

  if (config.stateManagement && config.stateManagement !== 'none') {
    templates.push(getTemplatePathForState(config.stateManagement));
  }

  if (config.dataFetching?.enabled) {
    templates.push(getTemplatePathForDataFetching('tanstack-query'));
  }

  return templates;
}




