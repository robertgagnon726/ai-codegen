const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const diff = require('diff'); // Import the diff library
const { getContextFilePaths, loadConfig, getPathAliases } = require('./config-manager'); 
const { resolveFilePath } = require('./utils/resolveFilePath');
const { getTokenCount } = require('./utils/tokenizer');

/**
 * Executes a Git command and returns the result as a string.
 * @param {string} command The Git command to run.
 * @returns {string} The command output.
 */
function runGitCommand(command) {
  try {
    return execSync(command).toString().trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`, error.message);
    return '';
  }
}

/**
 * Reads the content of a file using a resolved file path.
 * @param {string} filePath - The path of the file to read.
 * @returns {string|null} - The file content, or null if reading fails.
 */
function getFileContent(filePath) {
  try {
    const resolvedPath = resolveFilePath(filePath);
    if (!resolvedPath) {
      console.warn(`Could not resolve file path: ${filePath}`);
      return null;
    }

    return fs.readFileSync(resolvedPath, 'utf8');
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error.message);
    return null;
  }
}

/**
 * Parses a file and extracts all `import` and `require` statements.
 * @param {string} fileContent - The content of the file to parse.
 * @param {string} currentDir - The directory of the current file to resolve relative paths.
 * @param {Object} pathAliases - An object representing path aliases and their corresponding paths.
 * @returns {Array} - A list of absolute file paths for each imported file.
 */
function extractImports(fileContent, currentDir, pathAliases) {
  const importRegex = /(?:import\s.*?from\s+['"](.*?)['"]|require\(['"](.*?)['"]\))/g;
  const imports = [];
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
 * @param {string} filePath - The path of the current file.
 * @param {number} currentDepth - The current depth of recursion.
 * @param {number} maxDepth - The maximum depth to recurse.
 * @param {Object} pathAliases - The path aliases from configuration.
 * @param {Set} seenFiles - A set of already visited files to prevent infinite loops.
 * @returns {Array} - A list of file objects with path and content.
 */
function getImportedFiles(filePath, currentDepth, maxDepth, pathAliases, seenFiles = new Set()) {
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
 * @param {Array} files - An array of file objects with path and content.
 * @returns {Object} - An object containing files within the token limit and excluded files. 
 */
function limitContextByTokens(files) {
  const config = loadConfig();
  const contextLimit = config.contextLimit || 3000;
  let totalTokens = 0;
  const includedFiles = [];
  const excludedFiles = [];

  files.forEach((file) => {
    const tokenCount = getTokenCount(file.content);

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
 * @param {string} filePath - The path of the file to retrieve from the last commit.
 * @returns {string|null} - The file content at the last commit.
 */
function getOriginalFileContent(filePath) {
  try {
    return runGitCommand(`git show HEAD:${filePath}`);
  } catch (error) {
    console.warn(`Could not retrieve original content for ${filePath}. File may be new or not committed.`);
    return null;
  }
}

/**
 * Get the list of changed files, their content, and differences.
 * @returns {Object} An object containing arrays of modified, added, deleted files, and their content.
 */
function getChangedFilesWithContent() {
  const gitStatusOutput = runGitCommand('git status --porcelain');

  const changes = {
    modified: [],
    added: [],
    deleted: [],
    context: [],
  };

  // Each line in `git status --porcelain` output indicates a file change
  gitStatusOutput.split('\n').forEach((line) => {
    const changeType = line.substring(0, 2).trim(); // Extract status (e.g., M for modified, A for added)
    const filePath = line.substring(3).trim();      // Extract the file path

    let fileContent = null;
    let originalContent = null;

    // For modified files, capture both the current and original content
    if (changeType === 'M') {
      fileContent = getFileContent(filePath);
      originalContent = getOriginalFileContent(filePath);
    }

    // Read content only for added files (no original content available)
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
        changes.deleted.push({ path: filePath, content: null }); // Content not available for deleted files
        break;
      default:
        break;
    }
  });

    // Include manually specified context files
    const contextFilePaths = getContextFilePaths();
    contextFilePaths.forEach((contextFilePath) => {
      const content = getFileContent(contextFilePath);
      if (content) {
        changes.context.push({ path: contextFilePath, content });
      }
    });

  return changes;
}

module.exports = { getChangedFilesWithContent, getFileContent, getImportedFiles, extractImports, limitContextByTokens };
