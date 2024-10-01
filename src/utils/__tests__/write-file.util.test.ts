import { describe, test, expect, vi } from 'vitest';
import fs from 'fs';
import { writeToFile } from '../write-file.util';
import { logger } from '../logger.util';
import { getOutputFilePath, addToGitignore } from '../../manager.config';

// Mocking the required modules using `vitest`
vi.mock('fs');
vi.mock('../logger.util', () => ({
  logger: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../../manager.config', () => ({
  getOutputFilePath: vi.fn(),
  addToGitignore: vi.fn(),
}));

describe('writeToFile', () => {
  const mockContent = 'Test content';
  const mockFilePath = 'mocked-path/generated-tests.md';

  beforeEach(() => {
    vi.clearAllMocks();
    (getOutputFilePath as jest.Mock).mockReturnValue(mockFilePath);
  });

  test('should successfully write content to file and add to gitignore', () => {
    writeToFile(mockContent);
    expect(fs.writeFileSync).toHaveBeenCalledWith(mockFilePath, mockContent);
    expect(addToGitignore).toHaveBeenCalledWith(mockFilePath);
    expect(logger.success).toHaveBeenCalledWith(`\nGenerated tests have been saved to: ${mockFilePath}`);
  });

  test('should log error when content is null', () => {
    writeToFile(null);
    expect(logger.error).toHaveBeenCalledWith('Failed to generate tests');
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  test('should log error when fs.writeFileSync throws an error', () => {
    const errorMessage = 'File system error';
    (fs.writeFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    writeToFile(mockContent);
    expect(logger.error).toHaveBeenCalledWith(`Failed to write to file: ${mockFilePath} Error: ${errorMessage}`);
  });

  test('should handle empty string content', () => {
    writeToFile('');
    expect(logger.error).toHaveBeenCalledWith('Failed to generate tests');
  });

  test('should call addToGitignore with correct file path', () => {
    writeToFile(mockContent);
    expect(addToGitignore).toHaveBeenCalledWith(mockFilePath);
  });

  test('should call logger.error when content is not provided', () => {
    writeToFile(null);
    expect(logger.error).toHaveBeenCalledWith('Failed to generate tests');
  });
});
