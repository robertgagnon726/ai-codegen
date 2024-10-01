import chalk from 'chalk';
import { encode } from 'gpt-3-encoder';
import ora from 'ora';

/**
 * Calculate the number of tokens in the given content.
 * @param content - The text content to tokenize.
 * @returns The number of tokens in the content.
 */
function getTokenCount(content: string, path: string, tokensLeft: number): number {
  if (!content) {
    return 0;
  }
  const spinner = ora(chalk.cyan('🤖 Meep merp... Tokenizing your code...')).start();
  try {
    const encoded = encode(content);
    if (encoded.length > tokensLeft) {
      spinner.succeed(chalk.yellow(`${path} exceeds token limit! This file won't be included as context.`));
      return 0;
    }
    spinner.succeed(chalk.green(`✅ ${path} total context tokens to be included: ${encoded.length}`));
    return encoded.length;
  } catch (error) {
    spinner.fail(chalk.red('❌ Merp meep! Error tokenizing your code!'));
    return 0;
  }
}

export { getTokenCount };
