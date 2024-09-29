import fs from 'fs';
import path from 'path';
import { resolveFilePath } from '../resolveFilePath.util';
import { mockMethod } from 'src/test-utils';

jest.mock('fs');

const existsSyncMock = mockMethod(fs, 'existsSync');
const lstatSyncMock = mockMethod(fs, 'lstatSync');

describe('resolveFilePath', () => {
  const basePath = 'test/path/file';

  beforeEach(() => {
    jest.clearAllMocks();
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
    existsSyncMock.mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);
    lstatSyncMock.mockReturnValue({ isFile: () => true });
    expect(resolveFilePath(basePath)).toBe(`${basePath}.jsx`);
  });

  it('should return the path with an empty extension if others do not exist', () => {
    existsSyncMock.mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);
    lstatSyncMock.mockReturnValue({ isFile: () => true });
    expect(resolveFilePath(basePath)).toBe(basePath);
  });

  it('should return the path with x extension if all others do not exist', () => {
    existsSyncMock.mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);
    lstatSyncMock.mockReturnValue({ isFile: () => true });
    expect(resolveFilePath(basePath)).toBe(`${basePath}x`);
  });

  it('should return null if no files exist with any extension', () => {
    existsSyncMock.mockReturnValue(false);
    expect(resolveFilePath(basePath)).toBeNull();
  });

//   it('should return the index file from a directory if it exists', () => {
//     existsSyncMock.mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);
//     lstatSyncMock.mockReturnValueOnce({ isFile: () => false })
//       .mockReturnValueOnce({ isFile: () => true });
//     expect(resolveFilePath(basePath)).toBe(path.join(basePath, 'index'));
//   });

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