import path from 'path';
import { resolveFilePath } from '../utils/resolveFilePath.util';

/**
 * Parses a file and extracts all `import` and `require` statements.
 * @param fileContent - The content of the file to parse.
 * @param currentDir - The directory of the current file to resolve relative paths.
 * @param pathAliases - An object representing path aliases and their corresponding paths.
 * @returns An array of absolute file paths for each imported file.
 */
export function extractImports(fileContent: string, currentDir: string, pathAliases: Record<string, string>): string[] {
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