import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { resolveFilePath } from './utils/resolveFilePath.js';
import { getContextFilePaths, loadConfig } from './config-manager.js';
import { getTokenCount } from './utils/tokenizer.js';

/**
 * Represents a file object with a path and content.
 */
export interface FileObject {
  path: string;
  content: string | null;
  originalContent?: string | null;
  tokenCount?: number;
}

/**
 * Represents the changes in the repository.
 */
interface Changes {
  modified: FileObject[];
  added: FileObject[];
  deleted: FileObject[];
  context: FileObject[];
}

/**
 * Executes a Git command and returns the result as a string.
 * @param command - The Git command to run.
 * @returns The command output as a string.
 */
function runGitCommand(command: string): string {
  try {
    return execSync(command).toString().trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`, (error as Error).message);
    return '';
  }
}

/**
 * Reads the content of a file using a resolved file path.
 * @param filePath - The path of the file to read.
 * @returns The file content as a string, or null if reading fails.
 */
function getFileContent(filePath: string): string | null {
  try {
    const resolvedPath = resolveFilePath(filePath);
    if (!resolvedPath) {
      console.warn(`Could not resolve file path: ${filePath}`);
      return null;
    }
    return fs.readFileSync(resolvedPath, 'utf8');
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, (error as Error).message);
    return null;
  }
}

/**
 * Parses a file and extracts all `import` and `require` statements.
 * @param fileContent - The content of the file to parse.
 * @param currentDir - The directory of the current file to resolve relative paths.
 * @param pathAliases - An object representing path aliases and their corresponding paths.
 * @returns An array of absolute file paths for each imported file.
 */
function extractImports(fileContent: string, currentDir: string, pathAliases: Record<string, string>): string[] {
  const importRegex = /(?:import\s.*?from\s+['"](.*?)['"]|require\(['"](.*?)['"]\))/g;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(fileContent)) !== null) {
    let importPath = match[1] || match[2];

    if (importPath.startsWith('.')) {
      // Resolve relative path imports
      const absolutePath = path.resolve(currentDir, importPath);
      const resolvedPath = resolveFilePath(absolutePath); // Use the resolveFilePath utility
      if (resolvedPath) imports.push(resolvedPath);
    } else if (importPath.startsWith('@')) {
      // Resolve path aliases
      const alias = Object.keys(pathAliases).find((key) => importPath.startsWith(key));
      if (alias) {
        const relativePath = importPath.replace(alias, pathAliases[alias]);
        const absolutePath = path.resolve(currentDir, relativePath);
        const resolvedPath = resolveFilePath(absolutePath);
        if (resolvedPath) imports.push(resolvedPath);
      }
    }
  }

  return imports;
}

/**
 * Recursively retrieves content for imported files based on the specified depth.
 * @param filePath - The path of the current file.
 * @param currentDepth - The current depth of recursion.
 * @param maxDepth - The maximum depth to recurse.
 * @param pathAliases - The path aliases from configuration.
 * @param seenFiles - A set of already visited files to prevent infinite loops.
 * @returns An array of file objects with path and content.
 */
function getImportedFiles(filePath: string, currentDepth: number, maxDepth: number, pathAliases: Record<string, string>, seenFiles: Set<string> = new Set()): FileObject[] {
  if (currentDepth > maxDepth || seenFiles.has(filePath)) {
    return [];
  }

  seenFiles.add(filePath);
  const fileContent = getFileContent(filePath);
  if (!fileContent) return [];

  const currentDir = path.dirname(filePath);
  const importedPaths = extractImports(fileContent, currentDir, pathAliases);

  // Recurse into each imported file
  return importedPaths.flatMap((importPath) => {
    if (importPath.includes('node_modules')) return []; // Skip node_modules
    const content = getFileContent(importPath);
    if (content) {
      return [{ path: importPath, content }, ...getImportedFiles(importPath, currentDepth + 1, maxDepth, pathAliases, seenFiles)];
    }
    return [];
  });
}

/**
 * Calculates the total token count and optimizes context based on the contextLimit.
 * @param files - An array of file objects with path and content.
 * @returns An object containing files within the token limit and excluded files.
 */
function limitContextByTokens(files: FileObject[]): { includedFiles: FileObject[], excludedFiles: FileObject[], totalTokens: number } {
  const config = loadConfig();
  const contextLimit = config.contextLimit || 3000;
  let totalTokens = 0;
  const includedFiles: FileObject[] = [];
  const excludedFiles: FileObject[] = [];

  files.forEach((file) => {
    const tokenCount = getTokenCount(file.content || '');
    if (totalTokens + tokenCount <= contextLimit) {
      includedFiles.push({ ...file, tokenCount });
      totalTokens += tokenCount;
    } else {
      excludedFiles.push({ ...file, tokenCount });
    }
  });

  return { includedFiles, excludedFiles, totalTokens };
}

/**
 * Get the original content of a file from the last commit.
 * @param filePath - The path of the file to retrieve from the last commit.
 * @returns The file content at the last commit.
 */
function getOriginalFileContent(filePath: string): string | null {
  try {
    return runGitCommand(`git show HEAD:${filePath}`);
  } catch (error) {
    console.warn(`Could not retrieve original content for ${filePath}. File may be new or not committed.`);
    return null;
  }
}

/**
 * Get the list of changed files, their content, and differences.
 * @returns An object containing arrays of modified, added, deleted files, and their content.
 */
function getChangedFilesWithContent(): Changes {
  const gitStatusOutput = runGitCommand('git status --porcelain');

  const changes: Changes = {
    modified: [],
    added: [],
    deleted: [],
    context: [],
  };

  gitStatusOutput.split('\n').forEach((line) => {
    const changeType = line.substring(0, 2).trim(); 
    const filePath = line.substring(3).trim();      

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

export { getChangedFilesWithContent, getFileContent, getImportedFiles, extractImports, limitContextByTokens };
