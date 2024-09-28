import { pathsToModuleNameMapper } from 'ts-jest';
import fs from 'fs';
import path from 'path';

// Dynamically read tsconfig.json to get compilerOptions
const tsconfig = JSON.parse(fs.readFileSync(path.resolve('./tsconfig.json'), 'utf8'));
const { compilerOptions } = tsconfig;

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: './tsconfig.json', useESM: true }],
    '^.+\\.js$': 'babel-jest'
  },
  extensionsToTreatAsEsm: ['.ts'],
  verbose: true,
  collectCoverage: true,
  setupFiles: ['<rootDir>/jest.setup.mjs'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/__tests__/**/*.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: ['/node_modules/(?!ora)'],
  moduleNameMapper: pathsToModuleNameMapper(
    compilerOptions.paths || {}, 
    {
      prefix: '<rootDir>/', // Ensure the prefix matches your src directory structure
    }
  ),
  moduleDirectories: ['node_modules', 'src'],
};
