import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define mocks directory and moduleNameMapper object
const mocksDir = path.resolve(__dirname, '..', '__mocks__');
const moduleNameMapper = {};

// Read through each file in the __mocks__ directory and create dynamic mappings
fs.readdirSync(mocksDir).forEach(file => {
  const moduleName = file.replace('.js', ''); // Remove .js extension for module name
  moduleNameMapper[`^${moduleName}$`] = `<rootDir>/__mocks__/${file}`;
});

// Export moduleNameMapper as default for ES modules
export default moduleNameMapper;
