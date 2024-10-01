import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { limitContextByTokens } from '../limit-context-by-tokens.git';
import { loadConfig } from '../../manager.config';
import { getTokenCount } from '../../utils/tokenizer.util';
import { FileObject } from '../git.types';

vi.mock('../../manager.config', () => ({
  loadConfig: vi.fn(),
}));

vi.mock('../../utils/tokenizer.util', () => ({
  getTokenCount: vi.fn(),
}));

describe('limitContextByTokens', () => {
  const mockConfig = { contextTokenLimit: 3000 };
  const mockFiles: FileObject[] = [
    { path: 'file1.txt', content: 'content1' },
    { path: 'file2.txt', content: 'content2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (loadConfig as Mock).mockReturnValue(mockConfig);
    (getTokenCount as Mock).mockImplementation((content, path, tokensLeft) => content.length);
  });

  it('should include files within the token limit', () => {
    const result = limitContextByTokens(mockFiles, [], [], [], [], []);
    expect(result.includedFiles.addedFiles).toHaveLength(2);
    expect(result.excludedFiles).toHaveLength(0);
    expect(result.totalTokens).toBe(16);
  });

  it('should exclude files exceeding the token limit', () => {
    (getTokenCount as Mock).mockReturnValueOnce(2999).mockReturnValueOnce(100);
    const result = limitContextByTokens(mockFiles, [], [], [], [], []);
    expect(result.includedFiles.addedFiles).toHaveLength(1);
    expect(result.excludedFiles).toHaveLength(1);
    expect(result.totalTokens).toBe(2999);
  });

  it('should handle empty file lists', () => {
    const result = limitContextByTokens([], [], [], [], [], []);
    expect(result.includedFiles.addedFiles).toHaveLength(0);
    expect(result.excludedFiles).toHaveLength(0);
    expect(result.totalTokens).toBe(0);
  });

  it('should include files from different categories based on token limit', () => {
    const result = limitContextByTokens(mockFiles, mockFiles, mockFiles, mockFiles, mockFiles, mockFiles);
    expect(result.includedFiles.addedFiles).toHaveLength(2);
    expect(result.includedFiles.modifiedFiles).toHaveLength(2);
    expect(result.includedFiles.deletedFiles).toHaveLength(2);
    expect(result.includedFiles.contextFiles).toHaveLength(2);
    expect(result.includedFiles.importedFiles).toHaveLength(2);
    expect(result.includedFiles.configFiles).toHaveLength(2);
  });
});
