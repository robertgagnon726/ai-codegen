import chalk from "chalk";
import { program } from "../../bin/cli.js";
import { getContextLimit, getMaxImportDepth, getOpenAIKey, getPathAliases } from "../../manager.config.js";
import { createTestGenerationPrompt } from "../../utils/prompt-creator.util.js";
import OpenAIClient from "../../openai.client.js";
import fs from 'fs';
import path from 'path';
import { logger } from "../../utils/logger.util.js";
import { getChangedFilesWithContent } from "../../git/get-changed-files-with-content.git.js";
import { getImportedFiles } from "../../git/get-imported-files.git.js";
import { limitContextByTokens } from "../../git/limit-context-by-tokens.git.js";

// TODO BG - clean up this file

export function registerTestsCommand() {
// Define the "test" command to display changed files with highlighted content differences
program
  .command('tests')
  .description('Detect changes in the codebase and generate tests using OpenAI')
  .action(async (options) => {
    const changes = getChangedFilesWithContent();
    const pathAliases = getPathAliases();
    const maxDepth = getMaxImportDepth();
    
    const importedFiles: { path: string; content: string | null }[] = [];
    
    if (changes.modified.length) {
      changes.modified.forEach((file) => {
        if (file.originalContent && file.content) {
          // Include imported files content
          const _importedFiles = getImportedFiles(file.path, 1, maxDepth, pathAliases);
          importedFiles.push(..._importedFiles);
        }
      });
    }

    if (changes.added.length) {
      changes.added.forEach((file) => {
        // Include imported files content
        const _importedFiles = getImportedFiles(file.path, 1, maxDepth, pathAliases);
        importedFiles.push(..._importedFiles);
      });
    }

    const files = [...changes.context, ...changes.modified, ...changes.added, ...importedFiles];

    const { includedFiles, excludedFiles, totalTokens } = limitContextByTokens(files);

    if (totalTokens === 0) {
      logger.error('No files found to generate tests.');
      return;
    }
    const contextLimit = getContextLimit()

    if (totalTokens > contextLimit) {
      logger.warn(`Total tokens (${totalTokens}) exceed the context limit (${contextLimit}).`);
    }

    if (excludedFiles.length > 0) {
      logger.info('Excluded Files (Exceeded Context Limit):');
      excludedFiles.forEach((file) => {
        logger.info(`File: ${file.path} excluded (Tokens: ${file.tokenCount})`);
      });
    }

    // Create a prompt for OpenAI to generate tests
    const prompt = createTestGenerationPrompt(changes.added, changes.modified, changes.deleted, changes.context, importedFiles);

    // Retrieve OpenAI API key from config
    const openAIKey = getOpenAIKey();
    if (!openAIKey) {
      logger.error('OpenAI API key is not set. Please set it using `aicodegen config set-key <apiKey>`.');
      return;
    }

    // Create an OpenAI client instance with GPT-4 model
    const openaiClient = new OpenAIClient(openAIKey);

    // Generate tests using GPT-4 with the context
    const generatedTests = await openaiClient.generateTest(prompt);

    if (generatedTests) {
      // Determine output file path
      const outputFilePath = options.output || path.join(process.cwd(), 'generated-tests.md');

      // Write generated tests to the output file
      try {
        fs.writeFileSync(outputFilePath, generatedTests);
        logger.success(`\nGenerated tests have been saved to: ${outputFilePath}`);
      } catch (error) {
        logger.error(`Failed to write to file: ${outputFilePath} ${error}`);
      }
    } else {
      logger.error('Failed to generate tests');
    }
  });
}