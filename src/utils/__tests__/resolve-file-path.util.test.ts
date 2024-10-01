import fs from 'fs';
import path from 'path';
import { resolveFilePath } from '../resolve-file-path.util';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs module using `vi.mock`
vi.mock('fs');

// Utility function for mocking fs methods
function mockMethod(object: any, method: string) {
  const original = object[method];
  const mockFn = vi.fn();
  object[method] = mockFn;
  return mockFn;
}

// Mock specific methods from `fs`
const existsSyncMock = mockMethod(fs, 'existsSync');
const lstatSyncMock = mockMethod(fs, 'lstatSync');

describe('resolveFilePath', () => {
  const basePath = 'test/path/file';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the exact path if it exists', () => {
    existsSyncMock.mockReturnValue(true);
    lstatSyncMock.mockReturnValue({ isFile: () => true });
    expect(resolveFilePath(basePath)).toBe(basePath);
  });

  it('should return the path with .js extension if it exists', () => {
    existsSyncMock.mockReturnValueOnce(false).mockReturnValueOnce(true);
    lstatSyncMock.mockReturnValue({ isFile: () => true });
    expect(resolveFilePath(basePath)).toBe(`${basePath}.js`);
  });

  it('should return the path with .jsx extension if .js does not exist', () => {
    existsSyncMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    lstatSyncMock.mockReturnValue({ isFile: () => true });
    expect(resolveFilePath(basePath)).toBe(`${basePath}.jsx`);
  });

  it('should return the path with .tsx extension if all others do not exist', () => {
    existsSyncMock
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    lstatSyncMock.mockReturnValue({ isFile: () => true });
    expect(resolveFilePath(basePath)).toBe(`${basePath}.tsx`);
  });

  it('should return null if no files exist with any extension', () => {
    existsSyncMock.mockReturnValue(false);
    expect(resolveFilePath(basePath)).toBeNull();
  });

  it('should return null if the base path is a directory and no index file exists', () => {
    existsSyncMock.mockReturnValue(true);
    lstatSyncMock.mockReturnValue({ isFile: () => false, isDirectory: () => true });
    existsSyncMock.mockReturnValue(false);
    expect(resolveFilePath(basePath)).toBeNull();
  });

  it('should handle the case where the base path is invalid', () => {
    existsSyncMock.mockReturnValue(false);
    expect(resolveFilePath('')).toBeNull();
  });
});
