import { describe, it, expect, vi, Mock } from 'vitest';
import fs from 'fs';
import { resolveFilePath } from '../resolve-file-path.util';

vi.mock('fs');
vi.mock('path');

describe('resolveFilePath', () => {
  it('should return the base path if it exists as a file', () => {
    (fs.existsSync as Mock).mockReturnValueOnce(true);
    (fs.lstatSync as Mock).mockReturnValueOnce({ isFile: () => true });

    const result = resolveFilePath('/path/to/file');
    expect(result).toBe('/path/to/file');
  });

  it('should return null if the base path does not exist', () => {
    (fs.existsSync as Mock).mockReturnValueOnce(false);

    const result = resolveFilePath('/path/to/nonexistent');
    expect(result).toBeNull();
  });

  it('should return null if no matching file or index is found', () => {
    (fs.existsSync as Mock).mockReturnValue(false);

    const result = resolveFilePath('/path/to/nowhere');
    expect(result).toBeNull();
  });

  it('should prioritize file extensions in the given order', () => {
    (fs.existsSync as Mock).mockReturnValueOnce(false);
    (fs.existsSync as Mock).mockReturnValueOnce(true);
    (fs.lstatSync as Mock).mockReturnValueOnce({ isFile: () => true });

    const result = resolveFilePath('/path/to/file');
    expect(result).toBe('/path/to/file.js');
  });
});
