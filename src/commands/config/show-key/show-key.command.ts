import chalk from "chalk";
import { getOpenAIKey } from "../../../manager.config.js";
import { Command } from "commander";

export function registerShowKeyCommand(parentCommand: Command) {
  // Subcommand: Show the current OpenAI API key
  parentCommand
    .command('show-key')
    .description('Show the OpenAI API key')
    .action(() => {
      const key = getOpenAIKey();
      if (key) {
        chalk.green('OpenAI API key is set.');
      } else {
        chalk.yellow('No OpenAI API key set. Use `aicodegen config set-key <apiKey>` to set it.');
      }
    });
}