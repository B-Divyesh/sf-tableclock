import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify('1.1.0-polish-2'),
  },
  test: {
    exclude: ['e2e/**'],
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
  },
});
