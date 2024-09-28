import { Command } from "commander";
import { setOpenAIKey } from "../../../manager.config.js";

export function registerSetKeyCommand(parentCommand: Command) {
  // Subcommand: Set the OpenAI API key
  parentCommand
    .command('set-key <apiKey>')
    .description('Set the OpenAI API key for the CLI')
    .action((apiKey: string) => {
      setOpenAIKey(apiKey);
    });
}