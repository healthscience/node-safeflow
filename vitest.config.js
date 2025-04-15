import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/systems/test-compute-engine.mock.js'],
    include: ['**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    root: __dirname,
    coverage: {
      provider: 'v8'
    },
    alias: {
      '/@/': new URL('./src/', import.meta.url).pathname
    }
  }
});