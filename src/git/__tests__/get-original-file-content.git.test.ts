import { getOriginalFileContent } from '../get-original-file-content.git';
import { runGitCommand } from '../run-git-command.git';
import { logger } from '../../utils/logger.util';
import { describe, it, expect, vi, Mock } from 'vitest';

vi.mock('../run-git-command.git');
vi.mock('../../utils/logger.util');

describe('getOriginalFileContent', () => {
  it('should return the file content from the last commit', () => {
    (runGitCommand as Mock).mockReturnValue('file content');
    const result = getOriginalFileContent('path/to/file.txt');
    expect(result).toBe('file content');
  });

  it('should return null if the file is new or not committed', () => {
    (runGitCommand as Mock).mockImplementation(() => {
      throw new Error('File not found');
    });
    const result = getOriginalFileContent('path/to/newfile.txt');
    expect(result).toBeNull();
  });

  it('should log a warning if the file is new or not committed', () => {
    (runGitCommand as Mock).mockImplementation(() => {
      throw new Error('File not found');
    });
    getOriginalFileContent('path/to/newfile.txt');
    expect(logger.warn).toHaveBeenCalledWith('Could not retrieve original content for path/to/newfile.txt. File may be new or not committed.');
  });

  it('should handle unexpected errors gracefully', () => {
    (runGitCommand as Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    const result = getOriginalFileContent('path/to/file.txt');
    expect(result).toBeNull();
  });

  it('should call runGitCommand with the correct command', () => {
    (runGitCommand as Mock).mockReturnValue('file content');
    getOriginalFileContent('path/to/file.txt');
    expect(runGitCommand).toHaveBeenCalledWith('git show HEAD:path/to/file.txt');
  });
});
