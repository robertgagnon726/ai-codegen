const fs = require('fs');
const path = require('path');

// Read and parse JSON file
function readJSONFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to read or parse ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Load the aitests.config.json configuration file.
 * @param {string} baseDir The base directory where to look for the config file.
 * @returns {Object} The parsed configuration object or an empty object if not found.
 */
function loadAitestsConfig(baseDir) {
  const configPath = path.join(baseDir, 'aitests.config.json');
  if (fs.existsSync(configPath)) {
    return readJSONFile(configPath) || {};
  } else {
    console.warn(`Configuration file not found at: ${configPath}. Using default paths.`);
    return {};
  }
}

/**
 * Gather essential project configurations based on custom or default paths.
 * @param {string} baseDir The base directory where to start searching for config files.
 * @returns {Object} An object containing parsed configuration files.
 */
function gatherProjectConfigs(baseDir = process.cwd()) {
  const defaultConfigPaths = {
    eslintConfig: 'eslint.config.js',
    tsConfig: 'tsconfig.json',
    jestConfig: 'jest.config.js',
    packageJson: 'package.json',
  };

  // Load the custom configuration from aitests.config.json if present
  const customConfig = loadAitestsConfig(baseDir);

  // Merge custom paths with default paths
  const configPaths = { ...defaultConfigPaths, ...customConfig };


  // Create absolute paths for the config files
  const resolvedPaths = Object.entries(configPaths).reduce((acc, [key, relativePath]) => {
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
      // Keep other configurations as is (e.g., contextLimit, maxImportDepth)
      acc[key] = relativePath;
    }
    return acc;
  }, {});

  const configs = {};

  // Iterate through the list of config files and attempt to read them
  for (const [key, filePath] of Object.entries(resolvedPaths)) {
    if (!fs.existsSync(filePath)) {
      console.warn(`Config file not found: ${filePath}`);
      configs[key] = null;
    } else {
      configs[key] =
        filePath.endsWith('.json') ? readJSONFile(filePath) : require(filePath);
    }
  }

  return configs;
}

module.exports = { gatherProjectConfigs };
