import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import { getOpenAIKey, setOpenAIKey, deleteOpenAIKey, loadConfig, getOutputFilePath, getContextFilePaths, getMaxImportDepth, getModel, getContextTokenLimit, addToGitignore, getTestFramework } from '../manager.config';
import { logger } from '../utils/logger.util';

vi.mock('fs');
vi.mock('path');
vi.mock('../utils/logger.util');

describe('manager.config.ts', () => {
  describe('getOpenAIKey', () => {
    it('should return the OpenAI key if present', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue('AI_CODE_GEN_OPENAI_API_KEY=test_key');
      expect(getOpenAIKey()).toBe('test_key');
    });

    it('should return null if the .aicodegenrc file does not exist', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      expect(getOpenAIKey()).toBeNull();
    });

    it('should return null if the key is not present in the file', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue('');
      expect(getOpenAIKey()).toBeNull();
    });
  });

  describe('setOpenAIKey', () => {
    it('should create .aicodegenrc file if it does not exist', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      const writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync');
      setOpenAIKey('new_key');
      expect(writeFileSyncSpy).toHaveBeenCalled();
    });
  });

  describe('deleteOpenAIKey', () => {
    it('should log warning if .aicodegenrc does not exist', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      deleteOpenAIKey();
      expect(logger.warn).toHaveBeenCalledWith('No .aicodegenrc file found.');
    });

    it('should log error if key is not found', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue('');
      deleteOpenAIKey();
      expect(logger.error).toHaveBeenCalledWith('No OpenAI API key found in .aicodegenrc file.');
    });
  });

  describe('loadConfig', () => {
    it('should return parsed config object', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{"key": "value"}');
      expect(loadConfig()).toEqual({ key: 'value' });
    });

    it('should return an empty object if config file is not found', () => {
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('File not found'); });
      expect(loadConfig()).toEqual({});
    });

    it('should log error if reading the config file fails', () => {
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('File not found'); });
      loadConfig();
      expect(logger.error).toHaveBeenCalledWith('Failed to load configuration file. File not found');
    });
  });

  describe('getOutputFilePath', () => {
    it('should return the output file path from config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{"outputFilePath": "test_output.md"}');
      expect(getOutputFilePath()).toBe('test_output.md');
    });

    it('should return the default output file path if not in config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{}');
      expect(getOutputFilePath()).toBe('generated-tests.md');
    });
  });

  describe('getContextFilePaths', () => {
    it('should return context file paths from config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{"contextFiles": ["file1", "file2"]}');
      expect(getContextFilePaths()).toEqual(['file1', 'file2']);
    });

    it('should return an empty array if context files not in config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{}');
      expect(getContextFilePaths()).toEqual([]);
    });
  });

  describe('getMaxImportDepth', () => {
    it('should return max import depth from config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{"maxImportDepth": 5}');
      expect(getMaxImportDepth()).toBe(5);
    });

    it('should return default max import depth if not in config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{}');
      expect(getMaxImportDepth()).toBe(1);
    });
  });

  describe('getModel', () => {
    it('should return model from config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{"model": "gpt-4"}');
      expect(getModel()).toBe('gpt-4');
    });

    it('should return default model if not in config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{}');
      expect(getModel()).toBe('gpt-4o');
    });
  });

  describe('getContextTokenLimit', () => {
    it('should return context token limit from config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{"contextTokenLimit": 5000}');
      expect(getContextTokenLimit()).toBe(5000);
    });

    it('should return default context token limit if not in config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{}');
      expect(getContextTokenLimit()).toBe(3000);
    });
  });

  describe('getTestFramework', () => {
    it('should return test framework from config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{"testFramework": "mocha"}');
      expect(getTestFramework()).toBe('mocha');
    });

    it('should return default test framework if not in config', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue('{}');
      expect(getTestFramework()).toBe('jest');
    });
  });

  describe('addToGitignore', () => {
    it('should not add filename to .gitignore if already present', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue('test_file\n');
      const writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync');
      addToGitignore('test_file');
      expect(writeFileSyncSpy).not.toHaveBeenCalled();
    });
  });
});
