import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger.util';
import { FileObject } from './git/git.types';

/**
 * Reads and parses a JSON file.
 * @param filePath - The path to the JSON file.
 * @returns The parsed JSON object or null if the file cannot be read or parsed.
 */
function readJSONFile(filePath: string): Record<string, any> | null {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Failed to read or parse ${filePath}: ${(error as Error).message}`);
    return null;
  }
}

/**
 * Load the `aicodegen.config.json` configuration file.
 * @param baseDir - The base directory where to look for the config file.
 * @returns The parsed configuration object or an empty object if not found.
 */
function loadAiCodeGenConfig(baseDir: string): Record<string, any> {
  const configPath = path.join(baseDir, 'aicodegen.config.json');
  if (fs.existsSync(configPath)) {
    return readJSONFile(configPath) || {};
  } else {
    logger.warn(`Configuration file not found at: ${configPath}. Using default paths.`);
    return {};
  }
}

/**
 * Gather essential project configurations based on custom or default paths.
 * @param baseDir - The base directory where to start searching for config files.
 * @returns An object containing parsed configuration files.
 */
async function gatherProjectConfigFiles(baseDir: string = process.cwd()): Promise<FileObject[]> {
  const defaultConfigPaths: Record<string, string> = {
    // eslintConfig: 'eslint.config.js',
    // tsConfig: 'tsconfig.json',
    // testConfig: 'jest.config.js',
    packageJson: 'package.json',
  };

  // Load the custom configuration from aicodegen.config.json if present
  const customConfig: Record<string, any> = loadAiCodeGenConfig(baseDir);

  // Merge custom paths with default paths
  const configPaths: Record<string, any> = { ...defaultConfigPaths };
  if (customConfig.eslintConfig) configPaths.eslintConfig = customConfig.eslintConfig;
  if (customConfig.tsConfig) configPaths.tsConfig = customConfig.tsConfig;
  if (customConfig.testConfig) configPaths.testConfig = customConfig.testConfig;
  // TODO BG - add docs for the test instructions
  if (customConfig.testInstructions) configPaths.testInstructions = customConfig.testInstructions;  

  // Create absolute paths for the config files
  const resolvedPaths: Record<string, any> = Object.entries(configPaths).reduce((acc: Record<string, any>, [key, relativePath]) => {
    if (typeof relativePath === 'number') {
      return acc;
    } else if (Array.isArray(relativePath)) {
      // If the value is an array (e.g., contextFiles), resolve each path in the array
      acc[key] = relativePath.map((filePath) =>
        path.isAbsolute(filePath) ? filePath : path.join(baseDir, filePath)
      );
    } else if (typeof relativePath === 'string') {
      // Resolve individual file paths
      acc[key] = path.isAbsolute(relativePath) ? relativePath : path.join(baseDir, relativePath);
    } else {
      // Keep other configurations as is (e.g., contextTokenLimit, maxImportDepth)
      acc[key] = relativePath;
    }
    return acc;
  }, {} as Record<string, any>);
  

  const configs: FileObject[] = [];

  // Iterate through the list of config files and attempt to read them
  for (const [key, filePath] of Object.entries(resolvedPaths)) {
    if (!fs.existsSync(filePath)) {
      logger.warn(`Config file not found: ${filePath}`);
    } else {
      configs.push({
        path: filePath,
        content: fs.readFileSync(filePath, 'utf-8')
      })
    }
  }

  return configs;
}

export { readJSONFile, loadAiCodeGenConfig, gatherProjectConfigFiles };
