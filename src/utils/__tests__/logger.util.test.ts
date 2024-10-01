import { logger } from '../logger.util';
import chalk from 'chalk';
import { describe, test, beforeEach, afterEach, expect, vi } from 'vitest';

describe('Logger Utility', () => {
  beforeEach(() => {
    // Mock `console.log` using `vi.fn()`
    console.log = vi.fn();
  });

  afterEach(() => {
    // Clear all mock data
    vi.clearAllMocks();
  });

  test('info should log message in blue', () => {
    logger.info('This is an info message');
    expect(console.log).toHaveBeenCalledWith(chalk.blue('This is an info message'));
  });

  test('success should log message in green', () => {
    logger.success('This is a success message');
    expect(console.log).toHaveBeenCalledWith(chalk.green('This is a success message'));
  });

  test('warn should log message in yellow', () => {
    logger.warn('This is a warning message');
    expect(console.log).toHaveBeenCalledWith(chalk.yellow('This is a warning message'));
  });

  test('error should log message in red', () => {
    logger.error('This is an error message');
    expect(console.log).toHaveBeenCalledWith(chalk.red('This is an error message'));
  });

  test('debug should log message in magenta', () => {
    logger.debug('This is a debug message');
    expect(console.log).toHaveBeenCalledWith(chalk.magenta('This is a debug message'));
  });

  test('info should handle empty message', () => {
    logger.info('');
    expect(console.log).toHaveBeenCalledWith(chalk.blue(''));
  });

  test('success should handle undefined message', () => {
    logger.success(undefined);
    expect(console.log).toHaveBeenCalledWith(chalk.green('undefined'));
  });

  test('warn should handle null message', () => {
    logger.warn(null);
    expect(console.log).toHaveBeenCalledWith(chalk.yellow('null'));
  });

  test('error should handle numeric message', () => {
    logger.error(404);
    expect(console.log).toHaveBeenCalledWith(chalk.red('404'));
  });

  test('debug should handle boolean message', () => {
    logger.debug(true);
    expect(console.log).toHaveBeenCalledWith(chalk.magenta('true'));
  });
});
