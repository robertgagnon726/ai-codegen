import { pathsToModuleNameMapper } from 'ts-jest';
import fs from 'fs';
import path from 'path';
import dyanmicModuleNameMapper from './internals/jest-mocks.js';

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
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/__tests__/**/*.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: ['/node_modules/(?!ora)'],
  moduleNameMapper: dyanmicModuleNameMapper,
  moduleDirectories: ['node_modules', 'src'],
};
