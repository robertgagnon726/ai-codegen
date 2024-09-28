import fs from 'fs';
import path from 'path';

/**
 * Attempts to resolve the given file path by trying multiple extensions.
 * @param basePath - The base file path without extension.
 * @returns The resolved file path if found, otherwise null.
 */
function resolveFilePath(basePath: string): string | null {
  const extensions: string[] = ['.js', '.jsx', '', 'x'];

  // Check if the base path exists (e.g., exact path specified)
  if (fs.existsSync(basePath) && fs.lstatSync(basePath).isFile()) {
    return basePath;
  }

  // Try appending each extension in priority order
  for (const ext of extensions) {
    const filePathWithExt = `${basePath}${ext}`;
    if (fs.existsSync(filePathWithExt) && fs.lstatSync(filePathWithExt).isFile()) {
      return filePathWithExt;
    }
  }

  // Check if the path is a directory, and look for an index file within
  if (fs.existsSync(basePath) && fs.lstatSync(basePath).isDirectory()) {
    for (const ext of extensions) {
      const indexPath = path.join(basePath, `index${ext}`);
      if (fs.existsSync(indexPath) && fs.lstatSync(indexPath).isFile()) {
        return indexPath;
      }
    }
  }

  return null; // No matching file found
}

export { resolveFilePath };
