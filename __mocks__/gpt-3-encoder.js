export const encode = jest.fn((text) => {
    // Return a token array based on text length for mock purposes
    return Array.from({ length: text.length }, (_, i) => i + 1);
  });
  