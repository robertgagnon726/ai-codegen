import chalk from "chalk";
import { getOpenAIKey } from "../../../manager.config";
import { Command } from "commander";
import { logger } from "../../../utils/logger.util";

export function registerShowKeyCommand(parentCommand: Command) {
  // Subcommand: Show the current OpenAI API key
  parentCommand
    .command('show-key')
    .description('Show the OpenAI API key')
    .action(() => {
      const key = getOpenAIKey();
      if (key) {
        logger.success('OpenAI API key is set.');
      } else {
        logger.warn('No OpenAI API key set. Use `aicodegen config set-key <apiKey>` to set it.');
      }
    });
}