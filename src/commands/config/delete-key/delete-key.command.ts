import { Command } from "commander";
import { deleteOpenAIKey } from "../../../manager.config.js";

export function registerDeleteKeyCommand(parentCommand: Command) {
  // Subcommand: Delete the OpenAI API key
  parentCommand
    .command('delete-key')
    .description('Delete the OpenAI API key')
    .action(() => {
      deleteOpenAIKey();
    });
}