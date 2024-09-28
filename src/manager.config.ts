import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables from .env file
dotenv.config();

/**
 * Gets the path to the .env file.
 * @returns The absolute path to the .env file.
 */
function getEnvFilePath(): string {
  return path.join(process.cwd(), '.env');
}

/**
 * Reads the OpenAI API key from environment variables or .env file.
 * @returns The OpenAI API key if set, otherwise null.
 */
function getOpenAIKey(): string | null {
  return process.env.AI_CODE_GEN_OPENAI_API_KEY || null;
}

/**
 * Sets the OpenAI API key in the environment.
 * @param apiKey - The API key to set.
 */
function setOpenAIKey(apiKey: string): void {
  const envFilePath = getEnvFilePath();
  if (!fs.existsSync(envFilePath)) {
    fs.writeFileSync(envFilePath, '');
  }

  let envConfig = fs.readFileSync(envFilePath, 'utf8');
  if (envConfig.includes('AI_CODE_GEN_OPENAI_API_KEY')) {
    envConfig = envConfig.replace(/AI_CODE_GEN_OPENAI_API_KEY=.*/g, `AI_CODE_GEN_OPENAI_API_KEY=${apiKey}`);
  } else {
    envConfig += `\nAI_CODE_GEN_OPENAI_API_KEY=${apiKey}`;
  }
  fs.writeFileSync(envFilePath, envConfig);
  chalk.green('OpenAI API key set successfully.');
}

/**
 * Deletes the OpenAI API key from the .env file.
 */
function deleteOpenAIKey(): void {
  const envFilePath = getEnvFilePath();
  if (!fs.existsSync(envFilePath)) {
    chalk.yellow('No .env file found.');
    return;
  }

  let envConfig = fs.readFileSync(envFilePath, 'utf8');
  if (envConfig.includes('AI_CODE_GEN_OPENAI_API_KEY')) {
    envConfig = envConfig.replace(/AI_CODE_GEN_OPENAI_API_KEY=.*/g, '');
    fs.writeFileSync(envFilePath, envConfig.trim());
    chalk.green('OpenAI API key deleted successfully.');
  } else {
    chalk.red('No OpenAI API key found in .env file.');
  }
}

/**
 * Load the configuration from `aicodegen.config.json`.
 * @returns The parsed configuration object.
 */
function loadConfig(): Record<string, any> {
  try {
    const configPath = path.join(process.cwd(), 'aicodegen.config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    chalk.red('Failed to load configuration file.', (error as Error).message);
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
 * Retrieve the contextLimit from the configuration.
 * @returns The maximum number of tokens to include in the context.
 */
function getContextLimit(): number {
  const config = loadConfig();
  return config.contextLimit || 3000;
}

/**
 * Retrieve the context files paths from the configuration.
 * @returns An array of context file paths specified in the config.
 */
function getContextFilePaths(): string[] {
  const config = loadConfig();
  return config.contextFiles || [];
}

export { getOpenAIKey, setOpenAIKey, deleteOpenAIKey, loadConfig, getContextFilePaths, getPathAliases, getMaxImportDepth, getModel, getContextLimit };
