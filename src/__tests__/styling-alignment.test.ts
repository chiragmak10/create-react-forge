import { beforeEach, describe, expect, it } from 'vitest';
import { TemplateRegistry } from '../templates/registry.js';

/**
 * Styling Alignment Tests
 * Verifies that styling overlays properly integrate with the app structure
 * by checking file contents for correct imports and usage patterns
 */

describe('Styling Alignment', () => {
  let registry: TemplateRegistry;

  beforeEach(() => {
    registry = new TemplateRegistry();
  });

  describe('Styled Components Overlay', () => {
    it('should have provider.tsx for Vite that includes GlobalStyles', () => {
      const template = registry.loadAndRegister('styling/styled-components', 'vite');
      const providerTsx = template.files.get('src/app/provider.tsx');

      expect(providerTsx).toBeDefined();
      expect(providerTsx).toContain("import { GlobalStyles } from '@/styles/globals'");
      expect(providerTsx).toContain('<GlobalStyles />');
    });

    it('should have providers.tsx for Next.js with StyledComponentsRegistry', () => {
      const template = registry.loadAndRegister('styling/styled-components', 'nextjs');
      const providersTsx = template.files.get('src/app/providers.tsx');

      expect(providersTsx).toBeDefined();
      expect(providersTsx).toContain("import StyledComponentsRegistry from '@/lib/StyledComponentsRegistry'");
      expect(providersTsx).toContain("import { GlobalStyles } from '@/styles/globals'");
      expect(providersTsx).toContain('<StyledComponentsRegistry>');
      expect(providersTsx).toContain('<GlobalStyles />');
    });

    it('should have layout.tsx for Next.js without CSS import', () => {
      const template = registry.loadAndRegister('styling/styled-components', 'nextjs');
      const layoutTsx = template.files.get('src/app/layout.tsx');

      expect(layoutTsx).toBeDefined();
      expect(layoutTsx).not.toContain("import '@/styles/globals.css'");
      expect(layoutTsx).toContain('<Providers>');
    });

    it('should have main.tsx for Vite without CSS import', () => {
      const template = registry.loadAndRegister('styling/styled-components', 'vite');
      const mainTsx = template.files.get('src/main.tsx');

      expect(mainTsx).toBeDefined();
      expect(mainTsx).not.toContain("import '@/styles/globals.css'");
      expect(mainTsx).toContain('<App />');
    });

    it('should have StyledComponentsRegistry.tsx for Next.js SSR', () => {
      const template = registry.loadAndRegister('styling/styled-components', 'nextjs');
      const registryTsx = template.files.get('src/lib/StyledComponentsRegistry.tsx');

      expect(registryTsx).toBeDefined();
      expect(registryTsx).toContain("'use client'");
      expect(registryTsx).toContain('ServerStyleSheet');
      expect(registryTsx).toContain('StyleSheetManager');
      expect(registryTsx).toContain('useServerInsertedHTML');
    });

    it('should have globals.ts with GlobalStyles export', () => {
      const template = registry.loadAndRegister('styling/styled-components');
      const globalsTs = template.files.get('src/styles/globals.ts');

      expect(globalsTs).toBeDefined();
      expect(globalsTs).toContain('createGlobalStyle');
      expect(globalsTs).toContain('export const GlobalStyles');
    });

    it('should have Button.styled.ts with styled component', () => {
      const template = registry.loadAndRegister('styling/styled-components');
      const buttonStyled = template.files.get('src/components/ui/Button.styled.ts');

      expect(buttonStyled).toBeDefined();
      expect(buttonStyled).toContain("import styled from 'styled-components'");
      expect(buttonStyled).toContain('export const StyledButton');
    });

    it('should properly merge with Vite runtime', () => {
      registry.loadTemplatesForConfig({
        runtime: 'vite',
        styling: { solution: 'styled-components' },
        stateManagement: 'none',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      const files = registry.getMergedFiles();

      // provider.tsx should include GlobalStyles
      const providerTsx = files.get('src/app/provider.tsx');
      expect(providerTsx).toContain('<GlobalStyles />');

      // main.tsx should not import CSS
      const mainTsx = files.get('src/main.tsx');
      expect(mainTsx).not.toContain("globals.css");

      // Should have styled-components specific files
      expect(files.has('src/styles/globals.ts')).toBe(true);
      expect(files.has('src/components/ui/Button.styled.ts')).toBe(true);
    });

    it('should properly merge with Next.js runtime', () => {
      registry.loadTemplatesForConfig({
        runtime: 'nextjs',
        styling: { solution: 'styled-components' },
        stateManagement: 'none',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      const files = registry.getMergedFiles();

      // providers.tsx should include StyledComponentsRegistry
      const providersTsx = files.get('src/app/providers.tsx');
      expect(providersTsx).toContain('<StyledComponentsRegistry>');
      expect(providersTsx).toContain('<GlobalStyles />');

      // layout.tsx should not import CSS
      const layoutTsx = files.get('src/app/layout.tsx');
      expect(layoutTsx).not.toContain("globals.css");

      // Should have Next.js specific registry
      expect(files.has('src/lib/StyledComponentsRegistry.tsx')).toBe(true);
    });
  });

  describe('Tailwind Overlay', () => {
    it('should have globals.css with Tailwind directives', () => {
      const template = registry.loadAndRegister('styling/tailwind');
      const globalsCss = template.files.get('src/styles/globals.css');

      expect(globalsCss).toBeDefined();
      expect(globalsCss).toContain('@import');
    });

    it('should have tailwind.config.js', () => {
      const template = registry.loadAndRegister('styling/tailwind');
      const tailwindConfig = template.files.get('tailwind.config.js');

      expect(tailwindConfig).toBeDefined();
      expect(tailwindConfig).toContain('content');
    });

    it('should have postcss.config.js', () => {
      const template = registry.loadAndRegister('styling/tailwind');
      const postcssConfig = template.files.get('postcss.config.js');

      expect(postcssConfig).toBeDefined();
    });

    it('should properly merge with Next.js runtime', () => {
      registry.loadTemplatesForConfig({
        runtime: 'nextjs',
        styling: { solution: 'tailwind' },
        stateManagement: 'none',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      const files = registry.getMergedFiles();

      // Should have Tailwind config files
      expect(files.has('tailwind.config.js')).toBe(true);
      expect(files.has('postcss.config.js')).toBe(true);

      // Should have Tailwind-specific Next.js pages
      const pageTsx = files.get('src/app/page.tsx');
      expect(pageTsx).toContain('className=');
    });
  });

  describe('None Styling Option (Next.js)', () => {
    it('should work without any styling overlay', () => {
      registry.loadTemplatesForConfig({
        runtime: 'nextjs',
        styling: { solution: 'none' },
        stateManagement: 'none',
        testing: { enabled: false, e2e: { enabled: false, runner: 'none' } },
        dataFetching: { enabled: false },
      });

      const files = registry.getMergedFiles();

      // Should have base runtime files
      expect(files.has('src/app/page.tsx')).toBe(true);
      expect(files.has('src/app/layout.tsx')).toBe(true);
      expect(files.has('src/styles/globals.css')).toBe(true);

      // Should NOT have Tailwind config files
      expect(files.has('tailwind.config.js')).toBe(false);
      expect(files.has('postcss.config.js')).toBe(false);

      // Page should use inline styles (not Tailwind classes)
      const pageTsx = files.get('src/app/page.tsx');
      expect(pageTsx).toContain('style=');
    });
  });

  describe('Cross-Styling Compatibility', () => {
    it('Styled Components should not have CSS file imports in Vite files', () => {
      const viteTemplate = registry.loadAndRegister('styling/styled-components', 'vite');
      const providerTsx = viteTemplate.files.get('src/app/provider.tsx');
      const mainTsx = viteTemplate.files.get('src/main.tsx');

      expect(providerTsx).toBeDefined();
      expect(mainTsx).toBeDefined();
      expect(providerTsx).not.toContain('.css');
      expect(mainTsx).not.toContain('.css');
    });
  });
});
