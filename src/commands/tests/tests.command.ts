import { program } from "../../bin/cli.js";
import { getContextTokenLimit, getOpenAIKey, getOutputFilePath } from "../../manager.config.js";
import { createTestGenerationPrompt } from "../../utils/prompt-creator.util.js";
import OpenAIClient from "../../openai.client.js";
import { logger } from "../../utils/logger.util.js";
import { processChangedFiles } from "./process-changed-files.exec.js";
import { writeToFile } from "../../utils/write-file.util.js";

export function registerTestsCommand() {
// Define the "test" command to display changed files with highlighted content differences
program
  .command('tests')
  .description('Detect changes in the codebase and generate tests using OpenAI')
  .action(async () => {
    const { includedFiles, excludedFiles, totalTokens, changes, importedFiles } = processChangedFiles();

    if (totalTokens === 0) {
      logger.error("No files found to generate tests.");
      return;
    }

    const contextTokenLimit = getContextTokenLimit();
    if (totalTokens > contextTokenLimit) {
      logger.warn(`Total tokens (${totalTokens}) exceed the context limit (${contextTokenLimit}).`);
    }

    if (excludedFiles.length > 0) {
      logger.info("Excluded Files (Exceeded Context Limit):");
      excludedFiles.forEach((file) => {
        logger.info(`File: ${file.path} excluded (Tokens: ${file.tokenCount})`);
      });
    }

    // Create a prompt for OpenAI to generate tests
    const prompt = createTestGenerationPrompt(changes.added, changes.modified, changes.deleted, changes.context, importedFiles);

    // Retrieve OpenAI API key from config
    const openAIKey = getOpenAIKey();
    if (!openAIKey) {
      logger.error("OpenAI API key is not set. Please set it using `aicodegen config set-key <apiKey>`.");
      return;
    }

    // Create an OpenAI client instance with GPT-4 model
    const openaiClient = new OpenAIClient(openAIKey);

    // Generate tests using GPT-4 with the context
    const generatedTests = await openaiClient.generateTest(prompt);

    writeToFile(generatedTests)
  });
}