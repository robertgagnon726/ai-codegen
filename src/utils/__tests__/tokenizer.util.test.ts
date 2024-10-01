import { getTokenCount } from '../tokenizer.util';
import ora from 'ora';
import chalk from 'chalk';
import { encode } from 'gpt-3-encoder';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocking the required modules using `vitest`
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnValue({
      succeed: vi.fn(),
      fail: vi.fn(),
    }),
  })),
}));

vi.mock('chalk', () => ({
  cyan: vi.fn((text) => text),
  green: vi.fn((text) => text),
  red: vi.fn((text) => text),
}));

vi.mock('gpt-3-encoder', () => ({
  encode: vi.fn(),
}));

describe('getTokenCount', () => {
  let startMock: ReturnType<typeof vi.fn>;
  let succeedMock: ReturnType<typeof vi.fn>;
  let failMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    succeedMock = vi.fn();
    failMock = vi.fn();
    startMock = vi.fn().mockReturnValue({
      succeed: succeedMock,
      fail: failMock,
    });

    (ora as any).mockImplementation(() => ({
      start: startMock,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should return 0 if content is empty', () => {
    const result = getTokenCount('', 'path/to/file');
    expect(result).toBe(0);
    expect(startMock).not.toHaveBeenCalled();
  });
});
