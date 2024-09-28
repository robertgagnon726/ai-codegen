import { replaceInFile } from 'replace-in-file';

// Define the options for the replace operation
const options = {
  files: 'dist/**/*.js', // Target all JS files in the dist directory
  from: /(\.\/[^\s]*)(?<!\.js)(?=["'])/g, // Find imports missing .js extensions
  to: '$1.js', // Append .js to the matched import paths
};

// Run the replace operation
try {
  const results = await replaceInFile(options);
  console.log('Replaced file extensions in the following files:');
  results.forEach(result => {
    if (result.hasChanged) {
      console.log(`- ${result.file}`);
    }
  });
} catch (error) {
  console.error('An error occurred while updating the imports:', error);
}