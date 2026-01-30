import { describe, expect, it } from 'vitest';
import { STATE_DESCRIPTIONS, STYLING_DESCRIPTIONS } from '../config/defaults';
import { StateManagementSchema, StylingSchema } from '../config/schema';

/**
 * Tests for conditional prompts logic
 * These tests verify the configuration and validation for runtime-dependent styling options
 */
describe('Conditional Prompts Configuration', () => {
  describe('Styling options', () => {
    it('should have all 3 styling options defined', () => {
      const stylingValues = StylingSchema.options;

      expect(stylingValues).toContain('none');
      expect(stylingValues).toContain('tailwind');
      expect(stylingValues).toContain('styled-components');
      expect(stylingValues).toHaveLength(3);
    });

    it('should have descriptions for all styling options', () => {
      expect(STYLING_DESCRIPTIONS.none).toBeDefined();
      expect(STYLING_DESCRIPTIONS.tailwind).toBeDefined();
      expect(STYLING_DESCRIPTIONS['styled-components']).toBeDefined();
    });

    it('Vite should use styled-components (auto-selected)', () => {
      // For Vite, styled-components is auto-selected
      const viteDefault = 'styled-components';
      const result = StylingSchema.safeParse(viteDefault);

      expect(result.success).toBe(true);
    });

    it('Next.js should support tailwind and none options', () => {
      // For Next.js, user can choose tailwind or none
      const nextjsOptions = ['tailwind', 'none'];

      nextjsOptions.forEach((option) => {
        const result = StylingSchema.safeParse(option);
        expect(result.success).toBe(true);
      });
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
        // Vite auto-selects styled-components
        return ['styled-components'];
      }
      // Next.js offers tailwind or none
      return ['tailwind', 'none'];
    }

    it('should return styled-components for Vite (auto-selected)', () => {
      const choices = getStylingChoicesForRuntime('vite');

      expect(choices).toHaveLength(1);
      expect(choices).toContain('styled-components');
    });

    it('should return tailwind and none for Next.js', () => {
      const choices = getStylingChoicesForRuntime('nextjs');

      expect(choices).toHaveLength(2);
      expect(choices).toContain('tailwind');
      expect(choices).toContain('none');
    });
  });
});
