import { logger } from "../utils/logger.util.js";
import { runGitCommand } from "./run-git-command.git.js";

/**
 * Get the original content of a file from the last commit.
 * @param filePath - The path of the file to retrieve from the last commit.
 * @returns The file content at the last commit.
 */
export function getOriginalFileContent(filePath: string): string | null {
    try {
      return runGitCommand(`git show HEAD:${filePath}`);
    } catch (error) {
      logger.warn(`Could not retrieve original content for ${filePath}. File may be new or not committed.`);
      return null;
    }
  }