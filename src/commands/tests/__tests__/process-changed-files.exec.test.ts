import { gatherProjectConfigFiles } from '../../../context-reader';
import { getChangedFilesWithContent } from '../../../git/get-changed-files-with-content.git';
import { getImportedFiles } from '../../../git/get-imported-files.git';
import { limitContextByTokens } from '../../../git/limit-context-by-tokens.git';
import { getMaxImportDepth } from '../../../manager.config';
import { processChangedFiles } from '../process-changed-files.exec';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../context-reader', () => ({
  gatherProjectConfigFiles: vi.fn()
}));
vi.mock('../../../git/get-changed-files-with-content.git', () => ({
  getChangedFilesWithContent: vi.fn()
}));
vi.mock('../../../git/get-imported-files.git', () => ({
  getImportedFiles: vi.fn()
}));
vi.mock('../../../git/limit-context-by-tokens.git', () => ({
  limitContextByTokens: vi.fn()
}));
vi.mock('../../../manager.config', () => ({
  getMaxImportDepth: vi.fn()
}));

describe('processChangedFiles', () => {
  it('should process files correctly', async () => {
    const changes = {
      modified: [{ path: 'file1.ts', originalContent: 'old', content: 'new' }],
      added: [{ path: 'file2.ts', content: 'new' }],
      deleted: [],
      context: []
    };
    const importedFiles = [{ path: 'file3.ts', content: 'imported' }];
    const configFiles = [{ path: 'file4.ts', content: 'config' }];
    const limitedContext = {
      includedFiles: { addedFiles: [], modifiedFiles: [], deletedFiles: [], contextFiles: [], importedFiles: [], configFiles: [] },
      excludedFiles: [],
      totalTokens: 100
    };
    vi.mocked(getChangedFilesWithContent).mockReturnValue(changes);
    vi.mocked(getImportedFiles).mockReturnValue(importedFiles);
    vi.mocked(gatherProjectConfigFiles).mockResolvedValue(configFiles);
    vi.mocked(limitContextByTokens).mockReturnValue(limitedContext);
    vi.mocked(getMaxImportDepth).mockReturnValue(1);

    const result = await processChangedFiles();
    expect(result).toEqual(limitedContext);
  });

  it('should handle empty changes and config files', async () => {
    const changes = { modified: [], added: [], deleted: [], context: [] };
    const configFiles: any[] = [];
    const limitedContext = {
      includedFiles: { addedFiles: [], modifiedFiles: [], deletedFiles: [], contextFiles: [], importedFiles: [], configFiles: [] },
      excludedFiles: [],
      totalTokens: 0
    };
    vi.mocked(getChangedFilesWithContent).mockReturnValue(changes);
    vi.mocked(gatherProjectConfigFiles).mockResolvedValue(configFiles);
    vi.mocked(limitContextByTokens).mockReturnValue(limitedContext);
    vi.mocked(getMaxImportDepth).mockReturnValue(1);

    const result = await processChangedFiles();
    expect(result).toEqual(limitedContext);
  });

  it('should handle error in gatherProjectConfigFiles', async () => {
    const changes = { modified: [], added: [], deleted: [], context: [] };
    vi.mocked(getChangedFilesWithContent).mockReturnValue(changes);
    vi.mocked(gatherProjectConfigFiles).mockRejectedValue(new Error('Config error'));
    vi.mocked(getMaxImportDepth).mockReturnValue(1);

    await expect(processChangedFiles()).rejects.toThrow('Config error');
  });

  it('should handle error in limitContextByTokens', async () => {
    const changes = { modified: [], added: [], deleted: [], context: [] };
    const configFiles: any[] = [];
    vi.mocked(getChangedFilesWithContent).mockReturnValue(changes);
    vi.mocked(gatherProjectConfigFiles).mockResolvedValue(configFiles);
    vi.mocked(limitContextByTokens).mockImplementation(() => {
      throw new Error('Token limit error');
    });
    vi.mocked(getMaxImportDepth).mockReturnValue(1);

    await expect(processChangedFiles()).rejects.toThrow('Token limit error');
  });
});
