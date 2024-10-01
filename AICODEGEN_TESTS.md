# Testing Instructions

1. Mocking
When writing mocks, make sure to utilize the vitest export `Mock`.
In this line: `runGitCommand.mockReturnValue('M file1.txt\n');`. If we're mocking `runGitCommand`, the syntax should look like `(runGitCommand as Mock).mockReturnValue('M file1.txt\n');`

2. Test Locations
All tests should be in a `__tests__` directory in the same directory where the file being tested is located. This is a visual representation of this structure:
project-root/
├── src/
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── __tests__/
│   │   │   └── formatDate.test.ts
│   │   └── calculateSum.ts
│   │       └── __tests__/
│   │           └── calculateSum.test.ts
