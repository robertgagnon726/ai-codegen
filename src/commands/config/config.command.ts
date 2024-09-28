import { program } from "../../bin/cli.js";

export function registerConfigCommand() {
    // Create a parent `config` command
    return program.command('config').description('Manage configuration for the CLI tool');
}