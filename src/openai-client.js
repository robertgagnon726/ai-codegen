const OpenAI = require('openai');

/**
 * OpenAI Client for generating text completions.
 */
class OpenAIClient {
  constructor(apiKey) {
    // Create the OpenAI client using the API key
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Generates a response based on the given prompt and context.
   * @param {string} prompt - The main prompt to send to OpenAI.
   * @param {Object} options - Additional options for the OpenAI completion.
   * @returns {Promise<string>} - The generated response from OpenAI.
   */
  async generateTest(prompt, options = {}) {
    const systemMessage = {
      role: 'system',
      content: 'You are a highly skilled software test engineer. You will generate comprehensive test cases for given code files.',
    };

    const userMessage = {
      role: 'user',
      content: `${prompt}`,
    };

    // Set default options for the OpenAI completion
    const completionOptions = {
      model: options.model || 'gpt-4o-2024-08-06',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 10000,
      messages: [systemMessage, userMessage],
    };

    try {
      const response = await this.client.chat.completions.create(completionOptions);
      console.log(response)
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating test:', error.message);
      return null;
    }
  }
}

module.exports = OpenAIClient;
