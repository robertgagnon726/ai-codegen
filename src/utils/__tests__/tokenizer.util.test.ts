import { getTokenCount } from '../tokenizer.util';
import ora from 'ora';
import chalk from 'chalk';
import { encode } from 'gpt-3-encoder';

jest.mock('ora', () => require('../../../__mocks__/ora'));


jest.mock('ora', () => {
  const startMock = jest.fn().mockReturnValue({
    succeed: jest.fn(),
    fail: jest.fn(),
  });
  return jest.fn(() => ({ start: startMock }));
});

jest.mock('chalk', () => ({
  cyan: jest.fn((text) => text),
  green: jest.fn((text) => text),
  red: jest.fn((text) => text),
}));
jest.mock('gpt-3-encoder', () => ({
  encode: jest.fn(),
}));

describe('getTokenCount', () => {
  let startMock: jest.Mock;
  let succeedMock: jest.Mock;
  let failMock: jest.Mock;

  beforeEach(() => {
    startMock = jest.fn().mockReturnValue({
      succeed: succeedMock = jest.fn(),
      fail: failMock = jest.fn(),
    });
    (ora as any).mockImplementation(() => ({
      start: startMock,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 0 if content is empty', () => {
    const result = getTokenCount('', 'path/to/file');
    expect(result).toBe(0);
    expect(startMock).not.toHaveBeenCalled();
  });
});
