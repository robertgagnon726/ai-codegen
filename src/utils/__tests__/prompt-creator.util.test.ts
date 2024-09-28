import { formatFileList, createTestGenerationPrompt, FileObject } from '../prompt-creator.util';

describe('formatFileList', () => {
  it('should return formatted string for non-empty file list', () => {
    const title = 'Added Files';
    const files = [{ path: 'src/file1.js', content: 'console.log("Hello World");' }];
    const result = formatFileList(title, files);
    expect(result).toContain('### Added Files:');
    expect(result).toContain('File Name: src/file1.js');
    expect(result).toContain('Content: console.log("Hello World");');
});

  it('should return "(No files)" for empty file list', () => {
    const title = 'Modified Files';
    const files: FileObject[] = [];
    const result = formatFileList(title, files);
    expect(result).toBe(`${title}:\n(No files)\n`);
  });

  it('should handle files with no content', () => {
    const title = 'Modified Files';
    const files = [{ path: 'src/file2.js', content: null }];
    const result = formatFileList(title, files);
    expect(result).toContain('Content: (No content)');
  });

  it('should format multiple files correctly', () => {
    const title = 'Modified Files';
    const files = [
      { path: 'src/file1.js', content: 'console.log("File 1");' },
      { path: 'src/file2.js', content: 'console.log("File 2");' },
    ];
    const result = formatFileList(title, files);
    expect(result).toContain('File Name: src/file1.js');
    expect(result).toContain('File Name: src/file2.js');
  });

  it('should handle undefined files array', () => {
    const title = 'Deleted Files';
    const files = undefined;
    // @ts-ignore
    const result = formatFileList(title, files);
    expect(result).toBe(`${title}:\n(No files)\n`);
  });
});

describe('createTestGenerationPrompt', () => {
  it('should generate prompt with empty arrays', () => {
    const addedFiles: FileObject[] = [];
    const modifiedFiles: FileObject[] = [];
    const deletedFiles: FileObject[] = [];
    const contextFiles: FileObject[] = [];
    const importedFiles: FileObject[] = [];
    const result = createTestGenerationPrompt(addedFiles, modifiedFiles, deletedFiles, contextFiles, importedFiles);
    expect(result).toContain('Added Files:\n(No files)\n');
    expect(result).toContain('Modified Files:\n(No files)\n');
    expect(result).toContain('Deleted Files:\n(No files)\n');
    expect(result).toContain('Context Files:\n(No files)\n');
    expect(result).toContain('Imported Files:\n(No files)\n');
  });

  it('should include added files in the prompt', () => {
    const addedFiles = [{ path: 'src/newFile.js', content: 'console.log("New File");' }];
    const modifiedFiles: FileObject[] = [];
    const result = createTestGenerationPrompt(addedFiles, modifiedFiles, [], [], []);
    expect(result).toContain('### Added Files:\n');
    expect(result).toContain('File Name: src/newFile.js');
  });

  it('should include modified files in the prompt', () => {
    const addedFiles: FileObject[] = [];
    const modifiedFiles = [{ path: 'src/modifiedFile.js', content: 'console.log("Modified File");' }];
    const result = createTestGenerationPrompt(addedFiles, modifiedFiles, [], [], []);
    expect(result).toContain('### Modified Files:\n');
    expect(result).toContain('File Name: src/modifiedFile.js');
  });

  it('should include context files in the prompt', () => {
    const contextFiles = [{ path: 'src/contextFile.js', content: 'console.log("Context File");' }];
    const result = createTestGenerationPrompt([], [], [], contextFiles, []);
    expect(result).toContain('### Context Files:\n');
    expect(result).toContain('File Name: src/contextFile.js');
  });

  it('should handle files with null content in the prompt', () => {
    const addedFiles = [{ path: 'src/fileWithNoContent.js', content: null }];
    const result = createTestGenerationPrompt(addedFiles, [], [], [], []);
    expect(result).toContain('Content: (No content)');
  });
});
