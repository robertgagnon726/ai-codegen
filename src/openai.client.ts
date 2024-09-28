import chalk from 'chalk';
import OpenAI from 'openai';
import ora from 'ora';
import { getContextLimit, getModel } from './manager.config.js';

interface OpenAIOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface Message {
  role: 'system' | 'user';
  content: string;
}

/**
 * OpenAI Client for generating text completions.
 */
class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    // Create the OpenAI client using the API key
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Generates a response based on the given prompt and context.
   * @param prompt - The main prompt to send to OpenAI.
   * @returns A Promise resolving to the generated response from OpenAI.
   */
  async generateTest(prompt: string): Promise<string | null> {
    const systemMessage: Message = {
      role: 'system',
      content: 'You are a highly skilled software test engineer. You will generate comprehensive test cases for given code files.',
    };

    const userMessage: Message = {
      role: 'user',
      content: `${prompt}`,
    };

    const model = getModel();
    const maxTokens = getContextLimit();

    // Set default options for the OpenAI completion
    const completionOptions = {
      model: model,
      temperature: 0.7,
      max_tokens: maxTokens,
      messages: [systemMessage, userMessage],
    };

    const spinner = ora(chalk.cyan('🤖 Meep merp... Seeing if OpenAI would like to help us...')).start();

    try {
      const response = await this.client.chat.completions.create(completionOptions);
      spinner.succeed(chalk.green('✅ Merp meep! OpenAI hooked us up!'));

      return response.choices[0].message.content?.trim() ?? '';
    } catch (error: any) {
      spinner.fail(chalk.red(`❌ Merp merp... OpenAI failed! Here's the error: "${error?.message}"`, ));
      return null;
    }
  }
}

export default OpenAIClient;
