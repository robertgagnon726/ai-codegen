import { getOutputFilePath } from "../manager.config.js";
import fs from 'fs';
import { logger } from "./logger.util.js";

export const writeToFile = (content: string | null) => {
    if (!content) {
        logger.error("Failed to generate tests");
      return
    }
    
    const outputFilePath = getOutputFilePath();
    try {
      fs.writeFileSync(outputFilePath, content);
      logger.success(`\nGenerated tests have been saved to: ${outputFilePath}`);
    } catch (error) {
      logger.error(`Failed to write to file: ${outputFilePath} ${error}`);
    }
}