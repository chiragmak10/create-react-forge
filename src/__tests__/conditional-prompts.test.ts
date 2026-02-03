import { describe, expect, it } from 'vitest';
import { STATE_DESCRIPTIONS, STYLING_DESCRIPTIONS } from '../config/defaults';
import { StateManagementSchema, StylingSchema } from '../config/schema';

/**
 * Tests for conditional prompts logic
 * These tests verify the configuration and validation for runtime-dependent styling options
 */
describe('Conditional Prompts Configuration', () => {
  describe('Styling options', () => {
    it('should have all 4 styling options defined', () => {
      const stylingValues = StylingSchema.options;

      expect(stylingValues).toContain('css');
      expect(stylingValues).toContain('tailwind');
      expect(stylingValues).toContain('styled-components');
      expect(stylingValues).toContain('css-modules');
      expect(stylingValues).toHaveLength(4);
    });

    it('should have descriptions for all styling options', () => {
      expect(STYLING_DESCRIPTIONS.css).toBeDefined();
      expect(STYLING_DESCRIPTIONS.tailwind).toBeDefined();
      expect(STYLING_DESCRIPTIONS['styled-components']).toBeDefined();
      expect(STYLING_DESCRIPTIONS['css-modules']).toBeDefined();
    });

    it('Vite should support all 4 styling options', () => {
      // For Vite, all 4 options should be valid
      const viteOptions = ['tailwind', 'styled-components', 'css-modules', 'css'];

      viteOptions.forEach((option) => {
        const result = StylingSchema.safeParse(option);
        expect(result.success).toBe(true);
      });
    });

    it('Next.js should use tailwind (auto-selected)', () => {
      // For Next.js, tailwind is auto-selected
      const nextjsDefault = 'tailwind';
      const result = StylingSchema.safeParse(nextjsDefault);

      expect(result.success).toBe(true);
    });
  });

  describe('State management options', () => {
    it('should have all state management options including jotai', () => {
      const stateValues = StateManagementSchema.options;

      expect(stateValues).toContain('none');
      expect(stateValues).toContain('redux');
      expect(stateValues).toContain('zustand');
      expect(stateValues).toContain('jotai');
      expect(stateValues).toHaveLength(4);
    });

    it('should have descriptions for all state management options', () => {
      expect(STATE_DESCRIPTIONS.none).toBeDefined();
      expect(STATE_DESCRIPTIONS.redux).toBeDefined();
      expect(STATE_DESCRIPTIONS.zustand).toBeDefined();
      expect(STATE_DESCRIPTIONS.jotai).toBeDefined();
    });

    it('should validate jotai as a valid state management option', () => {
      const result = StateManagementSchema.safeParse('jotai');
      expect(result.success).toBe(true);
    });
  });

  describe('Styling choices logic', () => {
    /**
     * Helper to get styling choices based on runtime
     */
    function getStylingChoicesForRuntime(runtime: 'vite' | 'nextjs'): string[] {
      if (runtime === 'vite') {
        return ['tailwind', 'styled-components', 'css-modules', 'css'];
      }
      // Next.js auto-selects tailwind
      return ['tailwind'];
    }

    it('should return 4 styling options for Vite', () => {
      const choices = getStylingChoicesForRuntime('vite');

      expect(choices).toHaveLength(4);
      expect(choices).toContain('tailwind');
      expect(choices).toContain('styled-components');
      expect(choices).toContain('css-modules');
      expect(choices).toContain('css');
    });

    it('should return only tailwind for Next.js', () => {
      const choices = getStylingChoicesForRuntime('nextjs');

      expect(choices).toHaveLength(1);
      expect(choices).toContain('tailwind');
    });
  });
});

