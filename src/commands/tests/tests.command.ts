import { program } from "../../bin/cli";
import { getContextTokenLimit, getOpenAIKey, getOutputFilePath } from "../../manager.config";
import { createTestGenerationPrompt } from "../../utils/prompt-creator.util";
import OpenAIClient from "../../openai.client";
import { logger } from "../../utils/logger.util";
import { processChangedFiles } from "./process-changed-files.exec";
import { writeToFile } from "../../utils/write-file.util";
import { gatherProjectConfigFiles } from "../../context-reader";

export function registerTestsCommand() {
// Define the "test" command to display changed files with highlighted content differences
program
  .command('tests')
  .description('Detect changes in the codebase and generate tests using OpenAI')
  .action(async () => {
    const { includedFiles, totalTokens } = await processChangedFiles();

    if (totalTokens === 0) {
      logger.error("No files found to generate tests.");
      return;
    }

    // Create a prompt for OpenAI to generate tests
    const prompt = createTestGenerationPrompt(includedFiles);

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


// TODO BG - add a retry command if the tests aren't great before closing out the program