import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify('1.0.0-polish-1'),
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
