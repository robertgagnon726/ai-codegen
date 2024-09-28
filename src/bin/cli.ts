#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { registerTestsCommand } from '../commands/tests/tests.command.js';
import { registerConfigCommand } from '../commands/config/config.command.js';
import { registerShowKeyCommand } from '../commands/config/show-key/show-key.command.js';
import { registerSetKeyCommand } from '../commands/config/set-key/set-key.command.js';
import { registerDeleteKeyCommand } from '../commands/config/delete-key/delete-key.command.js';

// Load .env variables
dotenv.config();

export const program = new Command();

// Define the CLI version and description
program.version('1.0.0').description('A CLI tool for generating, analyzing, and testing OpenAI integration');

// Register external command(s)
registerTestsCommand();
const configCommand = registerConfigCommand();
registerShowKeyCommand(configCommand);
registerSetKeyCommand(configCommand);
registerDeleteKeyCommand(configCommand);

// Parse and execute the commands
program.parse(process.argv);
