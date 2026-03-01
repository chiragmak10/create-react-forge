import react from '@vitejs/plugin-react';
import { realpathSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const projectRoot = realpathSync(fileURLToPath(new URL('.', import.meta.url)));

// https://vitejs.dev/config/
export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Keep Rollup input anchored to the same canonical root path on Windows.
      // This avoids short-path (RUNNER~1) vs long-path (runneradmin) mismatches.
      input: path.resolve(projectRoot, 'index.html'),
    },
  },
});
