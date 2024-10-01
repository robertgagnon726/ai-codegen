import { describe, it, expect, vi, MockedFunction } from 'vitest';
import { getImportedFiles } from '../get-imported-files.git';
import * as getFileContentModule from '../get-file-content.git';
import * as extractImportsModule from '../extract-imports.git';

vi.mock('../get-file-content.git');
vi.mock('../extract-imports.git');

describe('getImportedFiles', () => {
  const { getFileContent } = getFileContentModule as {
    getFileContent: MockedFunction<typeof getFileContentModule.getFileContent>;
  };
  const { extractImports } = extractImportsModule as {
    extractImports: MockedFunction<typeof extractImportsModule.extractImports>;
  };

  it('should return an empty array if currentDepth exceeds maxDepth', () => {
    expect(getImportedFiles('file.ts', 2, 1)).toEqual([]);
  });

  it('should return an empty array if file is already seen', () => {
    const seenFiles = new Set(['file.ts']);
    expect(getImportedFiles('file.ts', 1, 2, seenFiles)).toEqual([]);
  });

  it('should return an empty array if file content is null', () => {
    getFileContent.mockReturnValueOnce(null);
    expect(getImportedFiles('file.ts', 1, 2)).toEqual([]);
  });

  it('should skip imports from node_modules', () => {
    getFileContent.mockReturnValueOnce('import something from "node_modules/package";');
    extractImports.mockReturnValueOnce(['node_modules/package']);
    expect(getImportedFiles('file.ts', 1, 2)).toEqual([]);
  });

  it('should return file objects for valid imports', () => {
    getFileContent
      .mockReturnValueOnce('import something from "./imported.ts";')
      .mockReturnValueOnce('file content');
    extractImports.mockReturnValueOnce(['imported.ts']);
    expect(getImportedFiles('file.ts', 1, 2)).toEqual([
      { path: 'imported.ts', content: 'file content' }
    ]);
  });

  it('should handle circular dependencies gracefully', () => {
    getFileContent
      .mockReturnValueOnce('import something from "./imported.ts";')
      .mockReturnValueOnce('import back from "./file.ts";');
    extractImports
      .mockReturnValueOnce(['imported.ts'])
      .mockReturnValueOnce(['file.ts']);
    expect(getImportedFiles('file.ts', 1, 2)).toEqual([
      { path: 'imported.ts', content: 'import back from "./file.ts";' }
    ]);
  });

  it('should handle files that fail to read', () => {
    getFileContent
      .mockReturnValueOnce('import something from "./imported.ts";')
      .mockReturnValueOnce(null);
    extractImports.mockReturnValueOnce(['imported.ts']);
    expect(getImportedFiles('file.ts', 1, 2)).toEqual([]);
  });
});
