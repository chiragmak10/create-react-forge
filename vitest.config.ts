import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.{test,spec}.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      'src/templates/overlays/**/*',
    ],
    coverage: {
      provider: 'v8',
      // `json-summary` is used by CI to generate a readable coverage table in the job summary.
      reporter: ['text', 'text-summary', 'json-summary', 'html', 'lcov'],
      exclude: ['node_modules/', 'dist/', 'src/templates/overlays/'],
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});




