import { FileObject } from "../git-utils";

/**
 * Creates a prompt for generating test cases without explanations.
 * @param addedFiles - Array of added file objects with path and content.
 * @param modifiedFiles - Array of modified file objects with path and content.
 * @param deletedFiles - Array of deleted file objects with path and content.
 * @param contextFiles - Array of context file objects.
 * @param importedFiles - Array of imported file objects.
 * @returns The generated prompt as a string.
 */
function createTestGenerationPrompt(
  addedFiles: FileObject[],
  modifiedFiles: FileObject[],
  deletedFiles: FileObject[],
  contextFiles: FileObject[],
  importedFiles: FileObject[]
): string {
  return `
  You are an expert software test engineer. Your task is to generate **detailed and extensive Jest unit tests** for the following added and modified code files. Do **not** include any explanations or comments—just the raw Jest test cases.

  The files are provided below. Each file should have corresponding test cases that cover:
  1. Normal use cases
  2. Edge cases
  3. Error handling scenarios
  4. Any uncovered lines or complex logic branches.

  Use the context files and imported files only to improve test coverage and create meaningful assertions. **Do not** generate tests for the deleted files.

  ### Added files:
  ${addedFiles.map(file => `File Name: ${file.path} \nContent: ${file.content} \n----------------------`).join('\n')}

  ### Modified files:
  ${modifiedFiles.map(file => `File Name: ${file.path} \nContent: ${file.content} \n----------------------`).join('\n')}

  ### Context Files:
  ${contextFiles.map(file => `File Name: ${file.path} \nContent: ${file.content} \n----------------------`).join('\n')}

  ### Deleted Files:
  ${deletedFiles.map(file => `File Name: ${file.path} \nContent: ${file.content} \n----------------------`).join('\n')}

  ### Imported Files:
  ${importedFiles.map(file => `File Name: ${file.path} \nContent: ${file.content} \n----------------------`).join('\n')}

  **Requirements**:
  1. Create test cases using Jest.
  2. Do **not** include any explanations or comments—just the Jest test cases.
  3. The output should contain comprehensive test coverage for each added or modified function.
  4. Include at least 5-7 unique test cases for each function covering edge cases, error handling, and different parameter inputs.

  **Return only the Jest test cases for each file. Do not include summaries, descriptions, or comments.**
  `;
}

export { createTestGenerationPrompt, FileObject };
