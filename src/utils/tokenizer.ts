import { encode } from 'gpt-3-encoder';

/**
 * Calculate the number of tokens in the given content.
 * @param content - The text content to tokenize.
 * @returns The number of tokens in the content.
 */
function getTokenCount(content: string): number {
  if (!content) {
    return 0;
  }
  try {
    return encode(content).length;
  } catch (error) {
    console.error('Error tokenizing content:', error);
    return 0;
  }
}

export { getTokenCount };
