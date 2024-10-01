// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      exclude: ['internals', 'dist'],
      provider: 'istanbul', // Ensures Istanbul is used for coverage
      reporter: ['text', 'lcov'],
      all: true, // Include all files, even those not tested
      thresholds: {
        statements: 90,
        branches: 70,
        functions: 90,
        lines: 90,
      }
    },
  },
});