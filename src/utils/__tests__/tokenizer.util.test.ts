import { describe, it, expect, vi, Mock, beforeEach } from 'vitest';
import ora from 'ora';
import { encode } from 'gpt-3-encoder';
import { getTokenCount } from '../tokenizer.util';

vi.mock('chalk', () => ({
  default: {
    cyan: vi.fn((text) => text),
    yellow: vi.fn((text) => text),
    green: vi.fn((text) => text),
    red: vi.fn((text) => text),
  }
}));

// Create a mock spinner object with vi.fn() for each method
const mockSpinner = {
  start: vi.fn().mockReturnThis(),
  succeed: vi.fn(),
  fail: vi.fn(),
};

vi.mock('ora', () => {
  return {
    default: () => mockSpinner, // Return the same mock spinner object
  };
});

vi.mock('gpt-3-encoder', () => ({
  encode: vi.fn(),
}));

describe('getTokenCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 0 if content is empty', () => {
    const result = getTokenCount('', 'path/to/file', 100);
    expect(result).toBe(0);
  });

  it('should return the number of tokens if within limit', () => {
    (encode as Mock).mockReturnValue(Array(50).fill('token'));
    const result = getTokenCount('some content', 'path/to/file', 100);
    expect(result).toBe(50);
  });

  it('should return 0 and log a message if tokens exceed limit', () => {
    (encode as Mock).mockReturnValue(Array(150).fill('token'));
    const spinner = ora();
    const result = getTokenCount('some content', 'path/to/file', 100);
    expect(result).toBe(0);
    expect(spinner.succeed).toHaveBeenCalledWith('path/to/file exceeds token limit! This file won\'t be included as context.');
  });

  it('should handle errors during tokenization', () => {
    (encode as Mock).mockImplementation(() => { throw new Error('Encoding error'); });
    const spinner = ora();
    const result = getTokenCount('some content', 'path/to/file', 100);
    expect(result).toBe(0);
    expect(spinner.fail).toHaveBeenCalledWith('❌ Merp meep! Error tokenizing your code!');
  });

  it('should return the correct number of tokens', () => {
    (encode as Mock).mockReturnValue(Array(30).fill('token'));
    const result = getTokenCount('some content', 'path/to/file', 100);
    expect(result).toBe(30);
  });

  it('should not exceed the tokensLeft limit', () => {
    (encode as Mock).mockReturnValue(Array(101).fill('token'));
    const result = getTokenCount('some content', 'path/to/file', 100);
    expect(result).toBe(0);
  });

  it('should log the correct success message when within token limit', () => {
    (encode as Mock).mockReturnValue(Array(80).fill('token'));
    const result = getTokenCount('some content', 'path/to/file', 100);
    
    // Test for the correct result
    expect(result).toBe(80);
    
    // Check if `succeed` was called with the correct message
    expect(mockSpinner.succeed).toHaveBeenCalledWith('✅ path/to/file total context tokens to be included: 80');
  });
});
