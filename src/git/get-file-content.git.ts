import { logger } from "../utils/logger.util";
import { resolveFilePath } from "../utils/resolveFilePath.util";
import fs from 'fs';

/**
 * Reads the content of a file using a resolved file path.
 * @param filePath - The path of the file to read.
 * @returns The file content as a string, or null if reading fails.
 */
export function getFileContent(filePath: string): string | null {
    try {
      const resolvedPath = resolveFilePath(filePath);
      if (!resolvedPath) {
        logger.warn(`Could not resolve file path: ${filePath}`);
        return null;
      }
      return fs.readFileSync(resolvedPath, 'utf8');
    } catch (error) {
      logger.error(`Failed to read file: ${filePath} ${(error as Error)?.message}`, );
      return null;
    }
  }