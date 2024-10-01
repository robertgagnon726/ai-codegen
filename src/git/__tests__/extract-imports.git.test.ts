import { describe, it, expect, vi } from 'vitest';
import { extractImports } from '../extract-imports.git';
import path from 'path';
import { resolveFilePath } from '../../utils/resolve-file-path.util';

vi.mock('path', () => ({
    default: {
        resolve: (currentDir: string, importPath: string) => `${currentDir}/${importPath.split('/')[1]}`,
    }
}));

vi.mock('../../utils/resolve-file-path.util', () => ({
  resolveFilePath: (absolutePath: string) => `${absolutePath}.ts`
}));

describe('extractImports', () => {
  it('should extract imports with relative paths', () => {
    const fileContent = `
      import moduleA from './moduleA';
      require('./moduleB');
    `;
    const result = extractImports(fileContent, '/currentDir');
    expect(result).toEqual(['/currentDir/moduleA.ts', '/currentDir/moduleB.ts']);
  });

  it('should handle absolute imports', () => {
    const fileContent = `
      import moduleA from '/absolute/path/moduleA';
    `;
    const result = extractImports(fileContent, '/currentDir');
    expect(result).toEqual([]);
  });

  it('should return an empty array if no imports found', () => {
    const fileContent = `
      const a = 5;
    `;
    const result = extractImports(fileContent, '/currentDir');
    expect(result).toEqual([]);
  });

  it('should handle import statements with no paths', () => {
    const fileContent = `
      import 'some-library';
    `;
    const result = extractImports(fileContent, '/currentDir');
    expect(result).toEqual([]);
  });

  it('should ignore invalid import statements', () => {
    const fileContent = `
      import moduleA from ;
    `;
    const result = extractImports(fileContent, '/currentDir');
    expect(result).toEqual([]);
  });

  it('should handle mixed valid and invalid import statements', () => {
    const fileContent = `
      import moduleA from './moduleA';
      import moduleB from ;
    `;
    const result = extractImports(fileContent, '/currentDir');
    expect(result).toEqual(['/currentDir/moduleA.ts']);
  });

  it('should handle multiple require statements', () => {
    const fileContent = `
      const moduleA = require('./moduleA');
      const moduleB = require('./moduleB');
    `;
    const result = extractImports(fileContent, '/currentDir');
    expect(result).toEqual(['/currentDir/moduleA.ts', '/currentDir/moduleB.ts']);
  });
});
