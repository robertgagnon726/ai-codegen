import { getChangedFilesWithContent } from '../get-changed-files-with-content.git';
import { runGitCommand } from '../run-git-command.git';
import { getFileContent } from '../get-file-content.git';
import { getOriginalFileContent } from '../get-original-file-content.git';
import { getContextFilePaths } from '../../manager.config';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../run-git-command.git');
vi.mock('../get-file-content.git');
vi.mock('../get-original-file-content.git');
vi.mock('../../manager.config');

describe('getChangedFilesWithContent', () => {
  it('should return modified files with content', () => {
    (runGitCommand as any).mockReturnValue('M file1.txt\n');
    (getFileContent as any).mockReturnValueOnce('new content');
    (getOriginalFileContent as any).mockReturnValueOnce('old content');
    (getContextFilePaths as any).mockReturnValue([]);

    const result = getChangedFilesWithContent();

    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].path).toBe('file1.txt');
    expect(result.modified[0].content).toBe('new content');
    expect(result.modified[0].originalContent).toBe('old content');
  });

  it('should return added files with content', () => {
    (runGitCommand as any).mockReturnValue('A file2.txt\n');
    (getFileContent as any).mockReturnValueOnce('new file content');
    (getContextFilePaths as any).mockReturnValue([]);

    const result = getChangedFilesWithContent();

    expect(result.added).toHaveLength(1);
    expect(result.added[0].path).toBe('file2.txt');
    expect(result.added[0].content).toBe('new file content');
  });

  it('should return deleted files', () => {
    (runGitCommand as any).mockReturnValue('D file3.txt\n');
    (getContextFilePaths as any).mockReturnValue([]);

    const result = getChangedFilesWithContent();

    expect(result.deleted).toHaveLength(1);
    expect(result.deleted[0].path).toBe('file3.txt');
    expect(result.deleted[0].content).toBeNull();
  });

  it('should return context files with content', () => {
    (runGitCommand as any).mockReturnValue('');
    (getContextFilePaths as any).mockReturnValue(['context1.txt']);
    (getFileContent as any).mockReturnValueOnce('context file content');

    const result = getChangedFilesWithContent();

    expect(result.context).toHaveLength(1);
    expect(result.context[0].path).toBe('context1.txt');
    expect(result.context[0].content).toBe('context file content');
  });

  it('should handle empty git status output', () => {
    (runGitCommand as any).mockReturnValue('');

    const result = getChangedFilesWithContent();

    expect(result.modified).toHaveLength(0);
    expect(result.added).toHaveLength(0);
    expect(result.deleted).toHaveLength(0);
    expect(result.context).toHaveLength(0);
  });

  it('should handle unknown change types', () => {
    (runGitCommand as any).mockReturnValue('X file4.txt\n');

    const result = getChangedFilesWithContent();

    expect(result.modified).toHaveLength(0);
    expect(result.added).toHaveLength(0);
    expect(result.deleted).toHaveLength(0);
    expect(result.context).toHaveLength(0);
  });

  it('should handle errors in file content retrieval', () => {
    (runGitCommand as any).mockReturnValue('M file5.txt\n');
    (getFileContent as any).mockReturnValueOnce(null);
    (getOriginalFileContent as any).mockReturnValueOnce(null);

    const result = getChangedFilesWithContent();

    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].path).toBe('file5.txt');
    expect(result.modified[0].content).toBeNull();
    expect(result.modified[0].originalContent).toBeNull();
  });
});