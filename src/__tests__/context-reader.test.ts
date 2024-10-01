import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { readJSONFile, loadAiCodeGenConfig, gatherProjectConfigFiles } from '../context-reader';
import { logger } from '../utils/logger.util';

vi.mock('fs');
vi.mock('path');
vi.mock('../utils/logger.util');

describe('readJSONFile', () => {
  it('should return parsed JSON object for valid JSON file', () => {
    const mockFilePath = 'valid.json';
    const mockData = '{"key": "value"}';
    vi.spyOn(fs, 'readFileSync').mockReturnValue(mockData);

    const result = readJSONFile(mockFilePath);

    expect(result).toEqual({ key: 'value' });
  });

  it('should return null for non-existent file', () => {
    const mockFilePath = 'non-existent.json';
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('File not found'); });

    const result = readJSONFile(mockFilePath);

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to read or parse'));
  });

  it('should return null for invalid JSON file', () => {
    const mockFilePath = 'invalid.json';
    const mockData = '{"key": "value"';
    vi.spyOn(fs, 'readFileSync').mockReturnValue(mockData);

    const result = readJSONFile(mockFilePath);

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to read or parse'));
  });

  it('should handle empty JSON file gracefully', () => {
    const mockFilePath = 'empty.json';
    const mockData = '';
    vi.spyOn(fs, 'readFileSync').mockReturnValue(mockData);

    const result = readJSONFile(mockFilePath);

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to read or parse'));
  });

  it('should handle null return from readFileSync gracefully', () => {
    const mockFilePath = 'null.json';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    vi.spyOn(fs, 'readFileSync').mockReturnValue(null);

    const result = readJSONFile(mockFilePath);

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to read or parse'));
  });
});

describe('loadAiCodeGenConfig', () => {
  it('should return parsed configuration object if config file exists', () => {
    const baseDir = '/base/dir';
    const mockConfig = '{"key": "value"}';
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(mockConfig);

    const result = loadAiCodeGenConfig(baseDir);

    expect(result).toEqual({ key: 'value' });
  });

  it('should return empty object if config file does not exist', () => {
    const baseDir = '/base/dir';
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    const result = loadAiCodeGenConfig(baseDir);

    expect(result).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Configuration file not found'));
  });

  it('should return empty object if readJSONFile returns null', () => {
    const baseDir = '/base/dir';
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('File not found'); });

    const result = loadAiCodeGenConfig(baseDir);

    expect(result).toEqual({});
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to read or parse'));
  });

  it('should handle empty baseDir gracefully', () => {
    const baseDir = '';
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    const result = loadAiCodeGenConfig(baseDir);

    expect(result).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Configuration file not found'));
  });

  it('should handle null baseDir gracefully', () => {
    const baseDir = null;
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const result = loadAiCodeGenConfig(baseDir);

    expect(result).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Configuration file not found'));
  });
});

describe('gatherProjectConfigFiles', () => {
  it('should handle missing config files gracefully', async () => {
    const baseDir = '/base/dir';
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));

    const result = await gatherProjectConfigFiles(baseDir);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Config file not found'));
  });

  it('should handle empty baseDir gracefully', async () => {
    const baseDir = '';
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));

    const result = await gatherProjectConfigFiles(baseDir);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Config file not found'));
  });
});
