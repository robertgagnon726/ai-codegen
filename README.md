# AI Test Generation Tool

AI Test Generation Tool is a command-line interface (CLI) application that leverages OpenAI's models to generate comprehensive unit tests for your code. The tool helps streamline the testing process by automating the creation of Jest test cases based on your code changes, saving you time and reducing manual effort.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Setup](#setup)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Options](#options)
7. [Advanced Features](#advanced-features)
8. [Troubleshooting](#troubleshooting)
9. [Roadmap](#roadmap)

---

## Overview

The AI Test Generation Tool automatically creates test cases for added or modified files in your project, using a variety of context files and OpenAI models. It supports custom configuration through a dedicated configuration file, `aicodegen.config.json`.

### Key Features
- Generates Jest test cases based on added or modified code files.
- Uses context files to improve the quality and relevance of the generated tests.
- Supports import resolution to include context from imported files.
- Allows for easy integration with CI/CD to automate test generation.
- Provides customizable configuration through the `aicodegen.config.json` file.

## Installation

To install the AI Test Generation Tool globally, use npm:
```
npm install -g aicodegen
```

This command installs the `aicodegen` CLI globally, making it available to use in any of your projects.

### Prerequisites

You must have Node.js installed on your machine. The tool requires Node.js version 14 or higher.

## Setup

Before running the tool, ensure that all changes you want to generate tests for are staged in Git. This is a requirement for the tool to detect file modifications and generate context-aware tests.

### Important:
- **Stage Your Changes**: Ensure that the files you want to generate tests for are staged using `git add`. The tool will only consider staged files for generating tests.

```
git add .
```

- **Configuration File**: Place a configuration file named `aicodegen.config.json` in the root of your project to customize the locations and file names of your configuration files. See the Configuration section for details.

### Setting Up Your OpenAI API Key

Before you can generate tests, you need to set up your OpenAI API key:

```
aicodegen config set-key <YOUR_OPENAI_API_KEY>
```

Replace `<YOUR_OPENAI_API_KEY>` with your actual OpenAI API key. The tool will store this key locally for future requests.

## Configuration

The AI Test Generation Tool uses a JSON configuration file named `aicodegen.config.json` in the root of your project. This configuration file allows you to define custom paths for ESLint, TypeScript, Jest, and other important context files.

### Example Configuration (`aicodegen.config.json`):

```
{ 
    "eslintConfig": "eslint.config.js", 
    "tsConfig": "tsconfig.json", 
    "jestConfig": "jest.config.js", 
    "packageJson": "package.json", 
    "contextFiles": [ "./src/utils/testSetup.js", "./src/helpers/testUtils.js", "./src/config/globalConfig.js" ], 
    "contextLimit": 20000, 
    "maxImportDepth": 1 
}
```

### Configuration Options:

- **eslintConfig**: Path to your ESLint configuration file.
- **tsConfig**: Path to your TypeScript configuration file.
- **jestConfig**: Path to your Jest configuration file.
- **packageJson**: Path to your `package.json` file.
- **contextFiles**: Array of file paths to use as additional context for test generation.
- **contextLimit**: Maximum number of tokens to include in the context for a single request.
- **maxImportDepth**: Maximum depth to follow relative imports for context files.
- **pathAliases**: Object defining path aliases and their corresponding directories in the project.

## Usage

### Basic Command

To generate tests for staged changes, run the following command:

```
aicodegen tests --output <outputFile>
```

This command will generate Jest test cases for all added and modified files that are currently staged and save them to the specified `<outputFile>`.

### Usage Example:

If you want to generate tests for staged changes and save them to `generated-tests.md`:

```
aicodegen tests --output generated-tests.md
```

### Additional Commands

1. **Set OpenAI API Key**:

```
aicodegen config set-key <YOUR_OPENAI_API_KEY>
```


Sets your OpenAI API key for the tool.

2. **View Current Configuration**:

```
aicodegen config view
```

Displays the current configuration, including paths to context files, ESLint, Jest, and TypeScript configurations.

3. **Delete OpenAI API Key**:

```
aicodegen config delete-key
```

Removes your OpenAI API key from the local configuration.

## Options

### `tests` Options:
- **`--output <filePath>`**: Specify the file path to save the generated test cases.
- **`--model <model>`**: Specify the OpenAI model to use (e.g., `gpt-3.5-turbo`, `gpt-4`).

## Advanced Features

1. **Path Aliases**:
The tool supports path aliases defined in your configuration file (`aicodegen.config.json`). This allows the tool to resolve and include files imported using custom path aliases, providing better context for test generation.

2. **Import Resolution**:
The tool can follow relative imports up to a specified depth (`maxImportDepth`) to gather more context for complex codebases.

3. **Custom Context Files**:
You can specify additional context files (e.g., utility functions, constants, or mock data) to improve the quality of the generated test cases.

## Troubleshooting

### Tests Are Cut Off or Incomplete
If generated tests are being cut off, try increasing the `max_tokens` limit in the OpenAI request or reducing the size of your context files.

### Missing OpenAI Key
If you see an error indicating that your OpenAI API key is missing, ensure that you have set it using:

```
aicodegen config set-key <YOUR_OPENAI_API_KEY>
```

### Not Generating Tests for All Files
Ensure that all files you want to generate tests for are staged using `git add` before running the command.

## Roadmap

- [ ] Use a custom file the the env. Create a script to set this up and add it to the .gitignore
- [ ] Filter out files to ensure only js and ts files are included in context
- [ ] Add support for TypeScript type inference.
- [ ] Setup ESLint and Prettier for consistent code formatting.
- [ ] Support for additional testing frameworks.
- [ ] Add export references to the context for enhanced test generation.
- [ ] Support for detecting existing related tests and using them as context.
- [ ] Add more keywords to the package.json

---