import { describe, it, expect, vi } from 'vitest';
import { Command } from 'commander';
import { registerShowKeyCommand } from '../../../config/show-key/show-key.command';
import { getOpenAIKey } from '../../../../manager.config';
import { logger } from '../../../../utils/logger.util';

vi.mock('../../../../manager.config', () => ({
  getOpenAIKey: vi.fn()
}));

vi.mock('../../../../utils/logger.util', () => ({
  logger: {
    success: vi.fn(),
    warn: vi.fn()
  }
}));

describe('registerShowKeyCommand', () => {
  it('should log success message if OpenAI key is set', () => {
    const mockParentCommand = new Command();
    const key = 'test-key';
    vi.mocked(getOpenAIKey).mockReturnValue(key);

    registerShowKeyCommand(mockParentCommand);
    mockParentCommand.parse(['node', 'test', 'show-key']);

    expect(getOpenAIKey).toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalledWith('OpenAI API key is set.');
  });

  it('should log warning message if OpenAI key is not set', () => {
    const mockParentCommand = new Command();
    vi.mocked(getOpenAIKey).mockReturnValue(null);

    registerShowKeyCommand(mockParentCommand);
    mockParentCommand.parse(['node', 'test', 'show-key']);

    expect(getOpenAIKey).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('No OpenAI API key set. Use `aicodegen config set-key <apiKey>` to set it.');
  });

  it('should correctly register show-key command', () => {
    const mockParentCommand = new Command();
    registerShowKeyCommand(mockParentCommand);

    const subCommand = mockParentCommand.commands.find(cmd => cmd.name() === 'show-key');
    expect(subCommand).toBeDefined();
    expect(subCommand?.description()).toBe('Show the OpenAI API key');
  });
});
