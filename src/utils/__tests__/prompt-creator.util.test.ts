
import { describe, it, expect } from 'vitest';
import { formatFileList, createTestGenerationPrompt } from '../prompt-creator.util';
import { IncludedFiles } from '../../git/limit-context-by-tokens.git';

describe('formatFileList', () => {
  it('should return formatted string for empty file list', () => {
    const result = formatFileList('Modified Files', []);
    expect(result).toBe('Modified Files:\n(No files)\n');
  });

  it('should return formatted string for non-empty file list', () => {
    const files = [{ path: 'file1.ts', content: 'content1' }, { path: 'file2.ts', content: null }];
    const result = formatFileList('Added Files', files);
    expect(result).toContain('File Name: file1.ts \nContent: content1 \n----------------------');
    expect(result).toContain('File Name: file2.ts \nContent: (No content) \n----------------------');
  });

  it('should handle undefined content gracefully', () => {
    const files = [{ path: 'file1.ts', content: null }];
    const result = formatFileList('Added Files', files);
    expect(result).toContain('File Name: file1.ts \nContent: (No content) \n----------------------');
  });

  it('should handle a large number of files', () => {
    const files = Array(1000).fill({ path: 'file.ts', content: 'content' });
    const result = formatFileList('Many Files', files);
    expect(result.split('File Name').length).toBe(1001);
  });

  it('should handle files with special characters in content', () => {
    const files = [{ path: 'file1.ts', content: 'content with special chars !@#$%^&*()' }];
    const result = formatFileList('Special Files', files);
    expect(result).toContain('content with special chars !@#$%^&*()');
  });
});

describe('createTestGenerationPrompt', () => {
  it('should generate prompt with given files', () => {
    const includedFiles: IncludedFiles = {
      addedFiles: [{ path: 'addedFile.ts', content: 'added content' }],
      modifiedFiles: [{ path: 'modifiedFile.ts', content: 'modified content' }],
      deletedFiles: [],
      contextFiles: [],
      importedFiles: [],
      configFiles: []
    };
    const result = createTestGenerationPrompt(includedFiles);
    expect(result).toContain('addedFile.ts');
    expect(result).toContain('modifiedFile.ts');
  });

  it('should handle empty includedFiles object', () => {
    const includedFiles: IncludedFiles = {
      addedFiles: [],
      modifiedFiles: [],
      deletedFiles: [],
      contextFiles: [],
      importedFiles: [],
      configFiles: []
    };
    const result = createTestGenerationPrompt(includedFiles);
    expect(result).toContain('Added Files:\n(No files)\n');
    expect(result).toContain('Modified Files:\n(No files)\n');
  });

  it('should include the correct test framework', () => {
    const includedFiles: IncludedFiles = {
      addedFiles: [],
      modifiedFiles: [],
      deletedFiles: [],
      contextFiles: [],
      importedFiles: [],
      configFiles: []
    };
    const result = createTestGenerationPrompt(includedFiles);
    expect(result).toContain('vitest');
  });

  it('should handle files with null content', () => {
    const includedFiles: IncludedFiles = {
      addedFiles: [{ path: 'file.ts', content: null }],
      modifiedFiles: [],
      deletedFiles: [],
      contextFiles: [],
      importedFiles: [],
      configFiles: []
    };
    const result = createTestGenerationPrompt(includedFiles);
    expect(result).toContain('Content: (No content)');
  });

  it('should handle very large content in files', () => {
    const largeContent = 'a'.repeat(10000);
    const includedFiles: IncludedFiles = {
      addedFiles: [{ path: 'largeFile.ts', content: largeContent }],
      modifiedFiles: [],
      deletedFiles: [],
      contextFiles: [],
      importedFiles: [],
      configFiles: []
    };
    const result = createTestGenerationPrompt(includedFiles);
    expect(result).toContain(largeContent);
  });
});
