import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger.util';
import { FileObject } from './git/git.types';
import { Config } from './manager.config';

/**
 * Reads and parses a JSON file.
 * @param filePath - The path to the JSON file.
 * @returns The parsed JSON object or null if the file cannot be read or parsed.
 */
function readJSONFile(filePath: string): JSON | null {
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
function loadAiCodeGenConfig(baseDir: string): Config | null{
  const configPath = path.join(baseDir, 'aicodegen.config.json');
  if (fs.existsSync(configPath)) {
    return readJSONFile(configPath) as Config;
  } else {
    logger.warn(`Configuration file not found at: ${configPath}. Using default paths.`);
    return null
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
  const customConfig = loadAiCodeGenConfig(baseDir);

  if (!customConfig) return [];

  // Merge custom paths with default paths
  const configPaths: Config = { ...defaultConfigPaths };
  if (customConfig.eslintConfig) configPaths.eslintConfig = customConfig.eslintConfig;
  if (customConfig.tsConfig) configPaths.tsConfig = customConfig.tsConfig;
  if (customConfig.testConfig) configPaths.testConfig = customConfig.testConfig;
  // TODO BG - add docs for the test instructions
  if (customConfig.testInstructions) configPaths.testInstructions = customConfig.testInstructions;  

  // Create absolute paths for the config files
  const resolvedPaths: Record<string, string | string[]> = Object.entries(configPaths).reduce((acc: Record<string, string | string[]>, [key, relativePath]) => {
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
  }, {} as Record<string, string | string[]>);
  

  const configs: FileObject[] = [];

  // Iterate through the list of config files and attempt to read them
  for (const [, filePath] of Object.entries(resolvedPaths)) {
    if (Array.isArray(filePath)) {
      for (const file of filePath) {
        if (!fs.existsSync(file)) {
          logger.warn(`Config file not found: ${file}`);
        } else {
          configs.push({
            path: file,
            content: fs.readFileSync(file, 'utf-8')
          })
        }
      }
    } else if (!fs.existsSync(filePath)) {
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
