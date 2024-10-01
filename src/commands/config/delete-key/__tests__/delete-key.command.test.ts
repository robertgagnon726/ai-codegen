import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerDeleteKeyCommand } from '../delete-key.command';
import { deleteOpenAIKey } from '../../../../manager.config';

vi.mock('../../../../manager.config');

describe('registerDeleteKeyCommand', () => {
  let parentCommand: Command;

  beforeEach(() => {
    parentCommand = new Command();
    registerDeleteKeyCommand(parentCommand);
  });

  it('should register the delete-key command', () => {
    const command = parentCommand.commands.find(cmd => cmd.name() === 'delete-key');
    expect(command).toBeTruthy();
  });

  it('should set the correct description for the delete-key command', () => {
    const command = parentCommand.commands.find(cmd => cmd.name() === 'delete-key');
    expect(command?.description()).toBe('Delete the OpenAI API key');
  });

  it('should not call deleteOpenAIKey for other commands', () => {
    const otherCommand = new Command('other');
    otherCommand.action(() => {});
    otherCommand.action(() => {});
    expect(deleteOpenAIKey).not.toHaveBeenCalled();
  });
});
