const start = jest.fn().mockReturnValue({
    succeed: jest.fn(),
    fail: jest.fn(),
  });
  
  const ora = jest.fn(() => ({
    start,
  }));
  
  export default ora;