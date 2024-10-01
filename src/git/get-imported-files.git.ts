import { getFileContent } from "./get-file-content.git";
import path from 'path';
import { extractImports } from "./extract-imports.git";
import { FileObject } from "./git.types";

/**
 * Recursively retrieves content for imported files based on the specified depth.
 * @param filePath - The path of the current file.
 * @param currentDepth - The current depth of recursion.
 * @param maxDepth - The maximum depth to recurse.
 * @param seenFiles - A set of already visited files to prevent infinite loops.
 * @returns An array of file objects with path and content.
 */
export function getImportedFiles(filePath: string, currentDepth: number, maxDepth: number, seenFiles: Set<string> = new Set()): FileObject[] {
    if (currentDepth > maxDepth || seenFiles.has(filePath)) {
      return [];
    }
  
    seenFiles.add(filePath);
    const fileContent = getFileContent(filePath);
    if (!fileContent) return [];
  
    const currentDir = path.dirname(filePath);
    const importedPaths = extractImports(fileContent, currentDir);
  
    // Recurse into each imported file
    return importedPaths.flatMap((importPath) => {
      if (importPath.includes('node_modules')) return []; // Skip node_modules
      const content = getFileContent(importPath);
      if (content) {
        return [{ path: importPath, content }, ...getImportedFiles(importPath, currentDepth + 1, maxDepth, seenFiles)];
      }
      return [];
    });
  }