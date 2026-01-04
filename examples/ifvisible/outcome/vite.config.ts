import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ifvisible',
      fileName: (format) => `ifvisible.js`,
      formats: ['iife'],
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false, // Keep it readable for demo purposes/inspection
  },
});
