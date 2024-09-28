import chalk from 'chalk';
import { encode } from 'gpt-3-encoder';
import ora from 'ora';

/**
 * Calculate the number of tokens in the given content.
 * @param content - The text content to tokenize.
 * @returns The number of tokens in the content.
 */
function getTokenCount(content: string, path: string): number {
  if (!content) {
    return 0;
  }
  const spinner = ora(chalk.cyan('🤖 Meep merp... Tokenizing your code...')).start();
  try {
    const encoded = encode(content);
    spinner.succeed(chalk.green(`✅ Merp meep! Total input tokens for ${path}: ${encoded.length}`));
    return encoded.length;
  } catch (error) {
    spinner.fail(chalk.red('❌ Merp meep! Error tokenizing your code!'));
    return 0;
  }
}

export { getTokenCount };
