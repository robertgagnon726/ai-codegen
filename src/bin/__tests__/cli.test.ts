import { execSync } from 'child_process';
import { describe, it, expect, vi } from 'vitest';
import { Command } from 'commander';
import { program } from '../cli';

vi.mock('child_process');
vi.mock('../../commands/tests/tests.command.js', () => ({
  registerTestsCommand: vi.fn(),
}));
vi.mock('../../commands/config/config.command.js', () => ({
  registerConfigCommand: vi.fn().mockReturnValue(new Command()),
}));
vi.mock('../../commands/config/show-key/show-key.command.js', () => ({
  registerShowKeyCommand: vi.fn(),
}));
vi.mock('../../commands/config/set-key/set-key.command.js', () => ({
  registerSetKeyCommand: vi.fn(),
}));
vi.mock('../../commands/config/delete-key/delete-key.command.js', () => ({
  registerDeleteKeyCommand: vi.fn(),
}));

describe('CLI Program', () => {
    it('should parse and execute the commands', () => {
        // @ts-expect-error
        const mockParse = vi.spyOn(program, 'parse').mockImplementation(() => {});
        program.parse(process.argv);
        expect(mockParse).toHaveBeenCalledWith(process.argv);
      });
});
