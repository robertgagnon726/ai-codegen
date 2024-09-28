import OpenAI from 'openai';

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
   * @param options - Additional options for the OpenAI completion.
   * @returns A Promise resolving to the generated response from OpenAI.
   */
  async generateTest(prompt: string, options: OpenAIOptions = {}): Promise<string | null> {
    const systemMessage: Message = {
      role: 'system',
      content: 'You are a highly skilled software test engineer. You will generate comprehensive test cases for given code files.',
    };

    const userMessage: Message = {
      role: 'user',
      content: `${prompt}`,
    };

    // Set default options for the OpenAI completion
    const completionOptions = {
      model: options.model || 'gpt-4o-mini',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 10000,
      messages: [systemMessage, userMessage],
    };

    try {
      const response = await this.client.chat.completions.create(completionOptions);
      return response.choices[0].message.content?.trim() ?? '';
    } catch (error: any) {
      console.error('Error generating test:', error.message);
      return null;
    }
  }
}

export default OpenAIClient;
