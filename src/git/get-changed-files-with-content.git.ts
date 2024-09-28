import { getContextFilePaths } from "../manager.config.js";
import { getFileContent } from "./get-file-content.git.js";
import { getOriginalFileContent } from "./get-original-file-content.git.js";
import { Changes } from "./git.types.js";
import { runGitCommand } from "./run-git-command.git.js";

/**
 * Get the list of changed files, their content, and differences.
 * @returns An object containing arrays of modified, added, deleted files, and their content.
 */
export function getChangedFilesWithContent(): Changes {
    const gitStatusOutput = runGitCommand('git diff --cached --name-status');
  
    const changes: Changes = {
      modified: [],
      added: [],
      deleted: [],
      context: [],
    };
  
    gitStatusOutput.split('\n').forEach((line) => {
      const changeType = line.substring(0, 2).trim(); 
      const filePath = line.substring(2).trim();   
  
      let fileContent = null;
      let originalContent = null;
  
      if (changeType === 'M') {
        fileContent = getFileContent(filePath);
        originalContent = getOriginalFileContent(filePath);
      }
  
      if (changeType === 'A') {
        fileContent = getFileContent(filePath);
      }
  
      switch (changeType) {
        case 'M':
          changes.modified.push({ path: filePath, originalContent, content: fileContent });
          break;
        case 'A':
          changes.added.push({ path: filePath, content: fileContent });
          break;
        case 'D':
          changes.deleted.push({ path: filePath, content: null });
          break;
        default:
          break;
      }
      
    });
  
    const contextFilePaths = getContextFilePaths();
    contextFilePaths.forEach((contextFilePath) => {
      const content = getFileContent(contextFilePath);
      if (content) {
        changes.context.push({ path: contextFilePath, content });
      }
    });
  
    return changes;
  }