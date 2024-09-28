import chalk from "chalk";

export const logger = {
  info: (message: any) => {
    console.log(chalk.blue(`${message}`));
  },
  success: (message: any) => {
    console.log(chalk.green(`${message}`));
  },
  warn: (message: any) => {
    console.log(chalk.yellow(`${message}`));
  },
  error: (message: any) => {
    console.log(chalk.red(`${message}`));
  },
  debug: (message: any) => {
    console.log(chalk.magenta(`${message}`));
  }
};

