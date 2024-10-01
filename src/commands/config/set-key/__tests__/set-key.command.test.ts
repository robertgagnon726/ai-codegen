import { describe, it, vi, expect, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerSetKeyCommand } from '../set-key.command';
import { setOpenAIKey } from '../../../../manager.config';

vi.mock('../../../../manager.config', () => ({
  setOpenAIKey: vi.fn(),
}));

describe('registerSetKeyCommand', () => {
  let parentCommand: Command;

  beforeEach(() => {
    parentCommand = new Command();
    registerSetKeyCommand(parentCommand);
  });

  it('should register the set-key command', () => {
    const command = parentCommand.commands.find(cmd => cmd.name() === 'set-key');
    expect(command).toBeDefined();
  });

  it('should have the correct description', () => {
    const command = parentCommand.commands.find(cmd => cmd.name() === 'set-key');
    expect(command?.description()).toBe('Set the OpenAI API key for the CLI');
  });
});
