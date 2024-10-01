import { describe, it, expect, vi } from 'vitest';
import { getFileContent } from '../get-file-content.git';
import * as loggerUtil from '../../utils/logger.util';
import * as resolveFilePathUtil from '../../utils/resolve-file-path.util';
import fs from 'fs';

vi.mock('fs');
vi.mock('../../utils/logger.util');
vi.mock('../../utils/resolve-file-path.util');

describe('getFileContent', () => {
  it('should return file content if file exists', () => {
    const mockFilePath = 'mockPath';
    const resolvedPath = 'resolvedPath';
    const fileContent = 'file content';
    vi.spyOn(resolveFilePathUtil, 'resolveFilePath').mockReturnValue(resolvedPath);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(fileContent);
    
    const result = getFileContent(mockFilePath);
    expect(result).toBe(fileContent);
  });

  it('should return null if resolveFilePath returns null', () => {
    const mockFilePath = 'mockPath';
    vi.spyOn(resolveFilePathUtil, 'resolveFilePath').mockReturnValue(null);
    const warnSpy = vi.spyOn(loggerUtil.logger, 'warn');
    
    const result = getFileContent(mockFilePath);
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(`Could not resolve file path: ${mockFilePath}`);
  });

  it('should return null if fs.readFileSync throws an error', () => {
    const mockFilePath = 'mockPath';
    const resolvedPath = 'resolvedPath';
    vi.spyOn(resolveFilePathUtil, 'resolveFilePath').mockReturnValue(resolvedPath);
    const errorMessage = 'read error';
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error(errorMessage);
    });
    const errorSpy = vi.spyOn(loggerUtil.logger, 'error');

    const result = getFileContent(mockFilePath);
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(`Failed to read file: ${mockFilePath} ${errorMessage}`);
  });

  it('should handle empty file path input', () => {
    const mockFilePath = '';
    vi.spyOn(resolveFilePathUtil, 'resolveFilePath').mockReturnValue(null);
    const warnSpy = vi.spyOn(loggerUtil.logger, 'warn');

    const result = getFileContent(mockFilePath);
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(`Could not resolve file path: ${mockFilePath}`);
  });

  it('should handle file path with special characters', () => {
    const mockFilePath = 'mock@#$%Path';
    const resolvedPath = 'resolvedPathWithSpecialChars';
    const fileContent = 'file content';
    vi.spyOn(resolveFilePathUtil, 'resolveFilePath').mockReturnValue(resolvedPath);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(fileContent);

    const result = getFileContent(mockFilePath);
    expect(result).toBe(fileContent);
  });

  it('should log error message correctly when fs.readFileSync throws an error', () => {
    const mockFilePath = 'mockPath';
    const resolvedPath = 'resolvedPath';
    const errorMessage = 'read error';
    vi.spyOn(resolveFilePathUtil, 'resolveFilePath').mockReturnValue(resolvedPath);
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error(errorMessage);
    });
    const errorSpy = vi.spyOn(loggerUtil.logger, 'error');

    getFileContent(mockFilePath);
    expect(errorSpy).toHaveBeenCalledWith(`Failed to read file: ${mockFilePath} ${errorMessage}`);
  });

  it('should handle non-string file path input', () => {
    const mockFilePath = 123 as any;
    vi.spyOn(resolveFilePathUtil, 'resolveFilePath').mockReturnValue(null);
    const warnSpy = vi.spyOn(loggerUtil.logger, 'warn');

    const result = getFileContent(mockFilePath);
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(`Could not resolve file path: ${mockFilePath}`);
  });
});
