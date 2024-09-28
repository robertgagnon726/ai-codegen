import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger.util.js';

const CONFIG_FILE_NAME = '.aicodegenrc';
const GITIGNORE_FILE_NAME = '.gitignore';

/**
 * Gets the path to the .aicodegenrc file.
 * @returns The absolute path to the .aicodegenrc file.
 */
function getRcFilePath(): string {
  return path.join(process.cwd(), CONFIG_FILE_NAME);
}

/**
 * Gets the path to the .gitignore file.
 * @returns The absolute path to the .gitignore file.
 */
function getGitignoreFilePath(): string {
  return path.join(process.cwd(), GITIGNORE_FILE_NAME);
}

/**
 * Sets the OpenAI API key in the .aicodegenrc file.
 * @param apiKey - The API key to set.
 */
function setOpenAIKey(apiKey: string): void {
  const rcFilePath = getRcFilePath();
  // Create the .aicodegenrc file if it doesn't exist
  if (!fs.existsSync(rcFilePath)) {
    fs.writeFileSync(rcFilePath, '');
  }

  // Read the existing content or create a new one
  let rcConfig = fs.readFileSync(rcFilePath, 'utf8');
  if (rcConfig.includes('AI_CODE_GEN_OPENAI_API_KEY')) {
    // Replace existing key if present
    rcConfig = rcConfig.replace(/AI_CODE_GEN_OPENAI_API_KEY=.*/g, `AI_CODE_GEN_OPENAI_API_KEY=${apiKey}`);
  } else {
    // Append new key if not present
    rcConfig += `\nAI_CODE_GEN_OPENAI_API_KEY=${apiKey}`;
  }
  fs.writeFileSync(rcFilePath, rcConfig.trim());
  
  // Add .aicodegenrc to .gitignore
  addToGitignore(CONFIG_FILE_NAME);

  logger.success('OpenAI API key set successfully in .aicodegenrc.');
}

/**
 * Deletes the OpenAI API key from the .aicodegenrc file.
 */
function deleteOpenAIKey(): void {
  const rcFilePath = getRcFilePath();
  if (!fs.existsSync(rcFilePath)) {
    logger.warn('No .aicodegenrc file found.');
    return;
  }

  let rcConfig = fs.readFileSync(rcFilePath, 'utf8');
  if (rcConfig.includes('AI_CODE_GEN_OPENAI_API_KEY')) {
    rcConfig = rcConfig.replace(/AI_CODE_GEN_OPENAI_API_KEY=.*/g, '');
    fs.writeFileSync(rcFilePath, rcConfig.trim());
    logger.success('OpenAI API key deleted successfully from .aicodegenrc.');
  } else {
    logger.error('No OpenAI API key found in .aicodegenrc file.');
  }
}

/**
 * Reads the OpenAI API key from the .aicodegenrc file.
 * @returns The OpenAI API key if set, otherwise null.
 */
function getOpenAIKey(): string | null {
  const rcFilePath = getRcFilePath();
  if (!fs.existsSync(rcFilePath)) {
    return null;
  }

  const rcConfig = fs.readFileSync(rcFilePath, 'utf8');
  const match = rcConfig.match(/AI_CODE_GEN_OPENAI_API_KEY=(.*)/);
  return match ? match[1] : null;
}

/**
 * Adds the specified filename to .gitignore if not already present.
 * @param filename - The name of the file to add to .gitignore.
 */
function addToGitignore(filename: string): void {
  const gitignoreFilePath = getGitignoreFilePath();
  let gitignoreContent = '';

  // If .gitignore exists, read its content
  if (fs.existsSync(gitignoreFilePath)) {
    gitignoreContent = fs.readFileSync(gitignoreFilePath, 'utf8');
  }

  // Add the filename to .gitignore if not present
  if (!gitignoreContent.includes(filename)) {
    if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
      gitignoreContent += '\n';
    }
    gitignoreContent += `${filename}\n`;
    fs.writeFileSync(gitignoreFilePath, gitignoreContent);
    logger.success(`Added ${filename} to .gitignore.`);
  } else {
    logger.info(`${filename} is already present in .gitignore.`);
  }
}


// Configs

/**
 * Load the configuration from `aicodegen.config.json`.
 * @returns The parsed configuration object.
 */
function loadConfig(): Record<string, any> {
  try {
    const configPath = path.join(process.cwd(), 'aicodegen.config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    logger.error(`Failed to load configuration file. ${(error as Error)?.message}`, );
    return {};
  }
}

/**
 * Retrieve the maximum depth of imports from the configuration.
 * @returns The maximum depth of imports to include.
 */
function getMaxImportDepth(): number {
  const config = loadConfig();
  return config.maxImportDepth || 1;
}

/**
 * Retrieve the path aliases from the configuration.
 * @returns An object representing path aliases and their corresponding paths.
 */
function getPathAliases(): Record<string, string> {
  const config = loadConfig();
  return config.pathAliases || {};
}

/**
 * Retrieve the model from the configuration.
 * @returns A string representing the model to use for OpenAI completions.
 */
function getModel(): string {
  const config = loadConfig();
  return config.model || 'gpt-4o';
}

/**
 * Retrieve the contextTokenLimit from the configuration.
 * @returns The maximum number of tokens to include in the context.
 */
function getContextTokenLimit(): number {
  const config = loadConfig();
  return config.contextTokenLimit || 3000;
}

/**
 * Retrieve the context files paths from the configuration.
 * @returns An array of context file paths specified in the config.
 */
function getContextFilePaths(): string[] {
  const config = loadConfig();
  return config.contextFiles || [];
}

/**
 * Retrieve the output file path from the configuration.
 * @returns 
 */
function getOutputFilePath(): string {
  const config = loadConfig();
  return config.outputFilePath || 'generated-tests.md';
}

export { getOpenAIKey, setOpenAIKey, deleteOpenAIKey, loadConfig, getOutputFilePath, getContextFilePaths, getPathAliases, getMaxImportDepth, getModel, getContextTokenLimit, addToGitignore };
