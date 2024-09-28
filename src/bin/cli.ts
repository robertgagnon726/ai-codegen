#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { getChangedFilesWithContent, getImportedFiles, limitContextByTokens } from '../git-utils';
import { gatherProjectConfigs } from '../context-reader';
import { getOpenAIKey, setOpenAIKey, deleteOpenAIKey, getMaxImportDepth, getPathAliases } from '../config-manager';
import OpenAIClient from '../openai-client';
import { createTestGenerationPrompt } from '../utils/prompt-creator';
import dotenv from 'dotenv';

// Load .env variables
dotenv.config();

const program = new Command();

// Define the CLI version and description
program.version('1.0.0').description('A CLI tool for generating, analyzing, and testing OpenAI integration');

// Define the "detect-changes" command to display changed files with highlighted content differences
program
  .command('detect-changes')
  .description('Detect and display categorized Git changes with file content and highlights')
  .action(async (options) => {
    const changes = getChangedFilesWithContent();
    const maxDepth = getMaxImportDepth();
    const pathAliases = getPathAliases();

    const configs = gatherProjectConfigs();

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
      console.error('No files found to generate tests.');
      return;
    }
    if (totalTokens > configs.contextLimit * 0.9) {
      console.warn(`Total tokens (${totalTokens}) exceed the context limit (${configs.contextLimit}).`);
    }

    if (excludedFiles.length > 0) {
      console.log(`\nExcluded Files (Exceeded Context Limit):`);
      excludedFiles.forEach((file) => {
        console.log(`File: ${file.path} excluded (Tokens: ${file.tokenCount})`);
      });
    }

    // Create a prompt for OpenAI to generate tests
    const prompt = createTestGenerationPrompt(changes.added, changes.modified, changes.deleted, changes.context, importedFiles);

    // Retrieve OpenAI API key from config
    const openAIKey = getOpenAIKey();
    if (!openAIKey) {
      console.error('OpenAI API key is not set. Please set it using `aitests config set-key <apiKey>`.');
      return;
    }

    // Create an OpenAI client instance with GPT-4 model
    const openaiClient = new OpenAIClient(openAIKey);

    // Generate tests using GPT-4 with the context
    const generatedTests = await openaiClient.generateTest(prompt, { model: 'gpt-4o-mini', max_tokens: configs.maxTokens });

    if (generatedTests) {
      // Determine output file path
      const outputFilePath = options.output || path.join(process.cwd(), 'generated-tests.js');

      // Write generated tests to the output file
      try {
        fs.writeFileSync(outputFilePath, generatedTests);
        console.log(`\nGenerated tests have been saved to: ${outputFilePath}`);
      } catch (error) {
        console.error(`Failed to write to file: ${outputFilePath}`, error);
      }
    } else {
      console.error('Failed to generate tests');
    }
  });

// Define the "context" command to gather project configurations
program
  .command('context')
  .description('Gather and display essential project configurations')
  .action(() => {
    const configs = gatherProjectConfigs();
    console.log('Parsed Project Configurations:');
    console.log(JSON.stringify(configs, null, 2));
  });

// Create a parent `config` command
const configCommand = program.command('config').description('Manage configuration for the CLI tool');

// Subcommand: Set the OpenAI API key
configCommand
  .command('set-key <apiKey>')
  .description('Set the OpenAI API key for the CLI')
  .action((apiKey: string) => {
    setOpenAIKey(apiKey);
  });

// Subcommand: Show the current OpenAI API key
configCommand
  .command('show-key')
  .description('Show the OpenAI API key')
  .action(() => {
    const key = getOpenAIKey();
    if (key) {
      console.log(`Current OpenAI API key: ${key}`);
    } else {
      console.warn('No OpenAI API key set. Use `aitests config set-key <apiKey>` to set it.');
    }
  });

// Subcommand: Delete the OpenAI API key
configCommand
  .command('delete-key')
  .description('Delete the OpenAI API key')
  .action(() => {
    deleteOpenAIKey();
  });

// Parse and execute the commands
program.parse(process.argv);