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
- Provides customizable configuration through the `aicodegen.config.json` file.

## Installation

To install the AI Code Generation Tool, use npm:
```
npm i -D aicodegen
```

### Prerequisites

You must have Node.js installed on your machine. The tool requires Node.js version 14 or higher.

## Setup

Before running the tool, ensure that all changes you want to generate tests for are staged in Git. This is a requirement for the tool to detect file modifications and generate context-aware tests.

### Creating an OpenAI Key

To get an OpenAI API Key, go [here](https://platform.openai.com/api-keys). You'll need to create an OpenAI account. With a free account, you can still use this tool, however the quality of codegen will be limited. The best model available in a free account is `gpt-3.5-turbo`. Personally, I'd recommend a minimum of `gpt-4o-mini`. However `gpt-3.5-turbo` will work great for demonstration purposes while you evaluate the usefulness of the tool.

### Setting Up Your OpenAI API Key

Before you can generate code, you need to set up your OpenAI API key:

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
    "contextFiles": [ 
        "./src/utils/testSetup.js", 
        "./src/helpers/testUtils.js", 
        "./src/config/globalConfig.js" 
        ], 
    "contextTokenLimit": 20000, 
    "maxImportDepth": 1,
    "model": "gpt-4o-mini",
    "outputFilePath": "generated-tests.md",
}
```

### Important:
- **Stage Your Changes**: Ensure that the files you want to generate tests for are staged using `git add`. The tool will only consider staged files for generating tests.

```
git add .
```

- **Configuration File**: Place a configuration file named `aicodegen.config.json` in the root of your project to customize the locations and file names of your configuration files. See the Configuration section for details.

### Configuration Options:

- **eslintConfig**: Path to your ESLint configuration file.
- **tsConfig**: Path to your TypeScript configuration file.
- **jestConfig**: Path to your Jest configuration file.
- **packageJson**: Path to your `package.json` file.
- **contextFiles**: Array of file paths to use as additional context for test generation.
- **contextTokenLimit**: Maximum number of tokens to include in the context for a single request.
- **maxImportDepth**: Maximum depth to follow relative imports for context files.
- **model**: The OpenAI model that you'd like to use. You can find a list of models available [here](https://platform.openai.com/docs/guides/rate-limits). You'll notice the are different models available for different tiers. You can find which tier your account is [here](https://platform.openai.com/settings/organization/limits)
- **outputFilePath**: The filepath you'd like your generated file to show. The default is `generated-tests.md`. Make sure you add this path to your `.gitignore`.

## Usage

### Basic Command

To generate tests for staged changes, run the following command:

```
aicodegen tests
```

This command will generate Jest test cases for all added and modified files that are currently staged and save them to the specified `outputFilePath`

### Additional Commands

1. **Set OpenAI API Key**:

```
aicodegen config set-key <YOUR_OPENAI_API_KEY>
```


Sets your OpenAI API key for the tool.

2. **View Current Key**:

```
aicodegen config show-key
```

Displays the current API Key you have set

3. **Delete OpenAI API Key**:

```
aicodegen config delete-key
```

Removes your OpenAI API key from the local configuration.

## Troubleshooting

### Tests Are Cut Off or Incomplete
If generated tests are being cut off, you have a couple options: 
1. Reduce the size of your files that you have staged.
2. Limit the number of files you're generating code for. If you can't resolve this issue, try just running the command with one staged file.

### Missing OpenAI Key
If you see an error indicating that your OpenAI API key is missing, ensure that you have set it using:

```
aicodegen config set-key <YOUR_OPENAI_API_KEY>
```

### Not Generating Tests for All Files
Ensure that the file you want to generate tests for are staged using `git add` before running the command.

## Roadmap

- [ ] Make config integration smarter
- [ ] Use a custom file the the env. Create a script to set this up and add it to the .gitignore
- [ ] Create a setup script that adds the api key, adds a script to package.json, adds the secret file to .gitignore(or create .gitignore if it doesn't exist)
- [ ] Filter out files to ensure only js and ts files are included in context
- [ ] Setup ESLint and Prettier for consistent code formatting.
- [ ] Support for additional testing frameworks.
- [ ] Detect existing tests for the current file. If there's a test file, make sure to provide that/those as context and ask OpenAI to update the existing instead of creating a new file
- [ ] Improve support for TypeScript in the test file generation. There's a current issue where Mocks aren't being correctly typed which makes more for editing than is ideal
- [ ] Add export references to the context for enhanced test generation.
- [ ] Support for detecting existing related tests and using them as context.
- [ ] Add more keywords to the package.json
- [ ] Allow for custom config file location
- [ ] Add support for Claude
- [ ] Add support for windows
---