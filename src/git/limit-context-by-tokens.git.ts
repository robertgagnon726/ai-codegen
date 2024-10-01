import { loadConfig } from "../manager.config";
import { getTokenCount } from "../utils/tokenizer.util";
import { FileObject } from "./git.types";

export interface IncludedFiles {
  addedFiles: FileObject[];
  modifiedFiles: FileObject[];
  deletedFiles: FileObject[];
  contextFiles: FileObject[];
  importedFiles: FileObject[];
  configFiles: FileObject[];
}

/**
 * Calculates the total token count and optimizes context based on the contextTokenLimit.
 * @param files - An array of file objects with path and content.
 * @returns An object containing files within the token limit and excluded files.
 */
export function limitContextByTokens(addedFiles: FileObject[], modifiedFiles: FileObject[], deletedFiles: FileObject[], contextFiles: FileObject[], importedFiles: FileObject[], configFiles: FileObject[]): { includedFiles: IncludedFiles, excludedFiles: FileObject[], totalTokens: number } {
    const config = loadConfig();
    const contextTokenLimit = config.contextTokenLimit ?? 3000;
    let totalTokens = 0;
    const includedFiles: IncludedFiles = {
      addedFiles: [],
      modifiedFiles: [],
      deletedFiles: [],
      contextFiles: [],
      importedFiles: [],
      configFiles: [],
    }
    const excludedFiles: FileObject[] = [];
  
    configFiles.forEach((file) => {
      const tokenCount = getTokenCount(file.content ?? '', file.path, contextTokenLimit - totalTokens);
      if (totalTokens + tokenCount <= contextTokenLimit) {
        includedFiles.configFiles.push({ ...file, tokenCount });
        totalTokens += tokenCount;
      } else {
        excludedFiles.push({ ...file, tokenCount });
      }
    });

    contextFiles.forEach((file) => {
      const tokenCount = getTokenCount(file.content ?? '', file.path, contextTokenLimit - totalTokens);
      if (totalTokens + tokenCount <= contextTokenLimit) {
        includedFiles.contextFiles.push({ ...file, tokenCount });
        totalTokens += tokenCount;
      } else {
        excludedFiles.push({ ...file, tokenCount });
      }
    });

    addedFiles.forEach((file) => {
      const tokenCount = getTokenCount(file.content ?? '', file.path, contextTokenLimit - totalTokens);
      if (totalTokens + tokenCount <= contextTokenLimit) {
        includedFiles.addedFiles.push({ ...file, tokenCount });
        totalTokens += tokenCount;
      } else {
        excludedFiles.push({ ...file, tokenCount });
      }
    });

    modifiedFiles.forEach((file) => {
      const tokenCount = getTokenCount(file.content ?? '', file.path, contextTokenLimit - totalTokens);
      if (totalTokens + tokenCount <= contextTokenLimit) {
        includedFiles.modifiedFiles.push({ ...file, tokenCount });
        totalTokens += tokenCount;
      } else {
        excludedFiles.push({ ...file, tokenCount });
      }
    });

    deletedFiles.forEach((file) => {
      const tokenCount = getTokenCount(file.content ?? '', file.path, contextTokenLimit - totalTokens);
      if (totalTokens + tokenCount <= contextTokenLimit) {
        includedFiles.deletedFiles.push({ ...file, tokenCount });
        totalTokens += tokenCount;
      } else {
        excludedFiles.push({ ...file, tokenCount });
      }
    });

    importedFiles.forEach((file) => {
      const tokenCount = getTokenCount(file.content ?? '', file.path, contextTokenLimit - totalTokens);
      if (totalTokens + tokenCount <= contextTokenLimit) {
        includedFiles.importedFiles.push({ ...file, tokenCount });
        totalTokens += tokenCount;
      } else {
        excludedFiles.push({ ...file, tokenCount });
      }
    });
  
    return { includedFiles, excludedFiles, totalTokens };
  }