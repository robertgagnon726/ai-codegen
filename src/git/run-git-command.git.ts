import { execSync } from 'child_process';
import { logger } from '../utils/logger.util';

/**
 * Executes a Git command and returns the result as a string.
 * @param command - The Git command to run.
 * @returns The command output as a string.
 */
export function runGitCommand(command: string): string {
    try {
      return execSync(command).toString().trim();
    } catch (error) {
      logger.error(`Error executing command: ${command}, ${(error as Error).message}`);
      return '';
    }
  }