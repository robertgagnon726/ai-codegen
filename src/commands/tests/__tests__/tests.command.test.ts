import { describe, it, expect, vi, beforeAll, Mock } from 'vitest';
import { registerTestsCommand } from '../tests.command';
import { program } from '../../../bin/cli';
import { processChangedFiles } from '../process-changed-files.exec';
import { gatherProjectConfigFiles } from '../../../context-reader';
import { createTestGenerationPrompt } from '../../../utils/prompt-creator.util';
import { getOpenAIKey } from '../../../manager.config';
import OpenAIClient from '../../../openai.client';
import { writeToFile } from '../../../utils/write-file.util';
import { logger } from '../../../utils/logger.util';

vi.mock('../../../bin/cli', () => ({ program: { command: vi.fn().mockReturnThis(), description: vi.fn().mockReturnThis(), action: vi.fn() } }));
vi.mock('../process-changed-files.exec');
vi.mock('../../../context-reader');
vi.mock('../../../utils/prompt-creator.util');
vi.mock('../../../manager.config');
vi.mock('../../../openai.client');
vi.mock('../../../utils/write-file.util');
vi.mock('../../../utils/logger.util');

describe('registerTestsCommand', () => {
  beforeAll(() => {
    registerTestsCommand();
  });

  it('should register the tests command', () => {
    expect(program.command).toHaveBeenCalledWith('tests');
    expect(program.description).toHaveBeenCalledWith('Detect changes in the codebase and generate tests using OpenAI');
  });

  it('should log an error if no files are found to generate tests', async () => {
    (processChangedFiles as Mock).mockResolvedValueOnce({ includedFiles: {}, totalTokens: 0, excludedFiles: [] });
    await vi.mocked(program.action).mock.calls[0][0]();
    expect(logger.error).toHaveBeenCalledWith("No files found to generate tests.");
  });

  it('should log an error if OpenAI API key is not set', async () => {
    (processChangedFiles as Mock).mockResolvedValueOnce({ includedFiles: [], totalTokens: 10 });
    vi.mocked(getOpenAIKey).mockReturnValueOnce(null);
    await vi.mocked(program.action).mock.calls[0][0]();
    expect(logger.error).toHaveBeenCalledWith("OpenAI API key is not set. Please set it using `aicodegen config set-key <apiKey>`.");
  });

  it('should generate tests and write to file', async () => {
    const mockGeneratedTests = 'test cases';
    (processChangedFiles as Mock).mockResolvedValueOnce({ includedFiles: [{ path: 'file1', content: 'content1' }], totalTokens: 10 });
    vi.mocked(gatherProjectConfigFiles).mockResolvedValueOnce([]);
    vi.mocked(createTestGenerationPrompt).mockReturnValueOnce('prompt');
    vi.mocked(getOpenAIKey).mockReturnValueOnce('apiKey');
    vi.mocked(OpenAIClient.prototype.generateTest).mockResolvedValueOnce(mockGeneratedTests);
    await vi.mocked(program.action).mock.calls[0][0]();
    expect(writeToFile).toHaveBeenCalledWith(mockGeneratedTests);
  });
});