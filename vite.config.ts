import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    exclude: ['e2e/**'],
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
  },
});
