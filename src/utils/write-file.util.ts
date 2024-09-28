import { addToGitignore, getOutputFilePath } from "../manager.config";
import fs from 'fs';
import { logger } from "./logger.util";

export const writeToFile = (content: string | null) => {
    if (!content) {
        logger.error("Failed to generate tests");
      return
    }

    const outputFilePath = getOutputFilePath();
    try {
      fs.writeFileSync(outputFilePath, content);
      addToGitignore(outputFilePath);
      logger.success(`\nGenerated tests have been saved to: ${outputFilePath}`);
    } catch (error) {
      logger.error(`Failed to write to file: ${outputFilePath} ${error}`);
    }
}