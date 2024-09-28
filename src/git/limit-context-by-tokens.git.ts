import { loadConfig } from "../manager.config";
import { getTokenCount } from "../utils/tokenizer.util";
import { FileObject } from "./git.types";

/**
 * Calculates the total token count and optimizes context based on the contextTokenLimit.
 * @param files - An array of file objects with path and content.
 * @returns An object containing files within the token limit and excluded files.
 */
export function limitContextByTokens(files: FileObject[]): { includedFiles: FileObject[], excludedFiles: FileObject[], totalTokens: number } {
    const config = loadConfig();
    const contextTokenLimit = config.contextTokenLimit || 3000;
    let totalTokens = 0;
    const includedFiles: FileObject[] = [];
    const excludedFiles: FileObject[] = [];
  
    files.forEach((file) => {
      const tokenCount = getTokenCount(file.content || '', file.path);
      if (totalTokens + tokenCount <= contextTokenLimit) {
        includedFiles.push({ ...file, tokenCount });
        totalTokens += tokenCount;
      } else {
        excludedFiles.push({ ...file, tokenCount });
      }
    });
  
    return { includedFiles, excludedFiles, totalTokens };
  }