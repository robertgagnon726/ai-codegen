const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Gets the path to the .env file.
 * @returns {string} The absolute path to the .env file.
 */
function getEnvFilePath() {
  return path.join(process.cwd(), '.env');
}

/**
 * Reads the OpenAI API key from environment variables or .env file.
 * @returns {string|null} The OpenAI API key if set, otherwise null.
 */
function getOpenAIKey() {
  return process.env.AITESTS_OPENAI_API_KEY || null;
}

/**
 * Sets the OpenAI API key in the environment.
 * @param {string} apiKey - The API key to set.
 */
function setOpenAIKey(apiKey) {
  const envFilePath = getEnvFilePath();
  if (!fs.existsSync(envFilePath)) {
    fs.writeFileSync(envFilePath, '');
  }

  let envConfig = fs.readFileSync(envFilePath, 'utf8');
  if (envConfig.includes('AITESTS_OPENAI_API_KEY')) {
    envConfig = envConfig.replace(/AITESTS_OPENAI_API_KEY=.*/g, `AITESTS_OPENAI_API_KEY=${apiKey}`);
  } else {
    envConfig += `\nAITESTS_OPENAI_API_KEY=${apiKey}`;
  }
  fs.writeFileSync(envFilePath, envConfig);
  console.log('OpenAI API key set successfully.');
}

/**
 * Deletes the OpenAI API key from the .env file.
 */
function deleteOpenAIKey() {
  const envFilePath = getEnvFilePath();
  if (!fs.existsSync(envFilePath)) {
    console.warn('No .env file found.');
    return;
  }

  let envConfig = fs.readFileSync(envFilePath, 'utf8');
  if (envConfig.includes('AITESTS_OPENAI_API_KEY')) {
    envConfig = envConfig.replace(/AITESTS_OPENAI_API_KEY=.*/g, '');
    fs.writeFileSync(envFilePath, envConfig.trim());
    console.log('OpenAI API key deleted successfully.');
  } else {
    console.warn('No OpenAI API key found in .env file.');
  }
}

/**
 * Load the configuration from `aitests.config.json`.
 * @returns {Object} - The parsed configuration object.
 */
function loadConfig() {
  try {
    const configPath = path.join(process.cwd(), 'aitests.config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load configuration file.', error.message);
    return {};
  }
}

/**
 * Retrieve the maximum depth of imports from the configuration.
 * @returns {number} - The maximum depth of imports to include.
 */
function getMaxImportDepth() {
  const config = loadConfig();
  return config.maxImportDepth || 1;
}

/**
 * Retrieve the path aliases from the configuration.
 * @returns {Object} - An object representing path aliases and their corresponding paths.
 */
function getPathAliases() {
  const config = loadConfig();
  return config.pathAliases || {};
}

/**
 * Retrieve the context files paths from the configuration.
 * @returns {Array} - An array of context file paths specified in the config.
 */
function getContextFilePaths() {
  const config = loadConfig();
  return config.contextFiles || [];
}

module.exports = { getOpenAIKey, setOpenAIKey, deleteOpenAIKey, loadConfig, getContextFilePaths, getPathAliases, getMaxImportDepth };
