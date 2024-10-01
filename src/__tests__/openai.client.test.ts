import { describe, it, expect, vi, beforeEach } from 'vitest';
import OpenAIClient from '../openai.client';

vi.mock('openai');
vi.mock('ora');
vi.mock('../manager.config');

describe('OpenAIClient', () => {
  let openAIClient: OpenAIClient;

  beforeEach(() => {
    openAIClient = new OpenAIClient('test-api-key');
  });

  it('should initialize the OpenAI client with the provided API key', () => {
    expect(openAIClient).toBeInstanceOf(OpenAIClient);
  });
});
