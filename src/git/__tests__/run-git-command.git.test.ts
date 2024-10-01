import { describe, it, expect, vi, Mock } from 'vitest';
import { execSync } from 'child_process';
import { runGitCommand } from '../run-git-command.git';
import { logger } from '../../utils/logger.util';

vi.mock('child_process');
vi.mock('../../utils/logger.util');

describe('runGitCommand', () => {
  it('should execute a valid git command and return the output', () => {
    (execSync as Mock).mockReturnValue(Buffer.from('output\n'));
    const result = runGitCommand('git status');
    expect(result).toBe('output');
    expect(execSync).toHaveBeenCalledWith('git status');
  });

  it('should handle empty command gracefully', () => {
    (execSync as Mock).mockReturnValue(Buffer.from(''));
    const result = runGitCommand('');
    expect(result).toBe('');
    expect(execSync).toHaveBeenCalledWith('');
  });

  it('should trim whitespace from the command output', () => {
    (execSync as Mock).mockReturnValue(Buffer.from(' output \n'));
    const result = runGitCommand('git status');
    expect(result).toBe('output');
    expect(execSync).toHaveBeenCalledWith('git status');
  });

  it('should return an empty string and log an error if the command fails', () => {
    const error = new Error('Command failed');
    (execSync as Mock).mockImplementation(() => { throw error; });
    const result = runGitCommand('git invalid-command');
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith('Error executing command: git invalid-command, Command failed');
  });

  it('should log the error message if execSync throws an error', () => {
    const error = new Error('Another error');
    (execSync as Mock).mockImplementation(() => { throw error; });
    runGitCommand('git another-invalid-command');
    expect(logger.error).toHaveBeenCalledWith('Error executing command: git another-invalid-command, Another error');
  });

  it('should handle non-string error messages gracefully', () => {
    const error = { message: undefined };
    (execSync as Mock).mockImplementation(() => { throw error; });
    const result = runGitCommand('git yet-another-invalid-command');
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith('Error executing command: git yet-another-invalid-command, undefined');
  });
});
