import { getTestFramework } from "../manager.config";
import { FileObject } from "../git/git.types";
import { IncludedFiles } from "../git/limit-context-by-tokens.git";


/**
 * Utility function to format file objects into a structured string for use in prompts.
 * @param title - The title indicating the type of files (e.g., "Added Files", "Modified Files").
 * @param files - Array of file objects to format.
 * @returns A formatted string representing the file objects.
 */
export function formatFileList(title: string, files: FileObject[]): string {
  if (!files || files.length === 0) return `${title}:\n(No files)\n`;

  return `
    ### ${title}:
    ${files
    .map(file => `File Name: ${file.path} \nContent: ${file.content ?? '(No content)'} \n----------------------`)
    .join('\n')}

    \n----------------------
  `;
}

/**
 * Creates a prompt for generating test cases without explanations.
 * @param includedFiles - An object containing arrays of added, modified, context, deleted, and imported files.
 * @returns The generated prompt as a string.
 */
function createTestGenerationPrompt(
  includedFiles: IncludedFiles,
): string {
  const testFramework = getTestFramework();
  return `
  You are an expert software test engineer. Your task is to generate **detailed and extensive ${testFramework} unit tests** for the following added and modified code files. Do **not** include any explanations or comments—just the raw ${testFramework} test cases.

  The files are provided below. Each file should have corresponding test cases that cover:
  1. Normal use cases
  2. Edge cases
  3. Error handling scenarios
  4. Any uncovered lines or complex logic branches.

  Use the context files and imported files only to improve test coverage and create meaningful assertions. **Do not** generate tests for the deleted files.

  ${formatFileList('Added Files', includedFiles.addedFiles)}
  ${formatFileList('Modified Files', includedFiles.modifiedFiles)}
  ${formatFileList('Context Files', includedFiles.contextFiles)}
  ${formatFileList('Deleted Files', includedFiles.deletedFiles)}
  ${formatFileList('Config Files', includedFiles.configFiles)}
  ${formatFileList('Imported Files', includedFiles.importedFiles)}

  **Requirements**:
  1. Create test cases using ${testFramework}.
  2. Do **not** include any explanations or comments—just the ${testFramework} test cases.
  3. The output should contain comprehensive test coverage for each added or modified function.
  4. Include at least 5-7 unique test cases for each function covering edge cases, error handling, and different parameter inputs.

  **Return only the ${testFramework} test cases for each file. Do not include summaries, descriptions, or comments.**
  `;
}

export { createTestGenerationPrompt, FileObject };
