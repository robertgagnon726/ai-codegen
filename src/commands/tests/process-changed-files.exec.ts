import { getChangedFilesWithContent } from "../../git/get-changed-files-with-content.git.js";
import { getImportedFiles } from "../../git/get-imported-files.git.js";
import { FileObject } from "../../git/git.types.js";
import { limitContextByTokens } from "../../git/limit-context-by-tokens.git.js";
import { getMaxImportDepth, getPathAliases } from "../../manager.config.js";

export function processChangedFiles() {
  const changes = getChangedFilesWithContent();
  const pathAliases = getPathAliases();
  const maxDepth = getMaxImportDepth();

  const importedFiles: FileObject[] = [];

  // Collect imported files for modified and added files
  changes.modified.forEach((file) => {
    if (file.originalContent && file.content) {
      const _importedFiles = getImportedFiles(file.path, 1, maxDepth, pathAliases);
      importedFiles.push(..._importedFiles);
    }
  });

  changes.added.forEach((file) => {
    const _importedFiles = getImportedFiles(file.path, 1, maxDepth, pathAliases);
    importedFiles.push(..._importedFiles);
  });

  const allFiles = [...changes.context, ...changes.modified, ...changes.added, ...importedFiles];
  const { includedFiles, excludedFiles, totalTokens } = limitContextByTokens(allFiles);

  return { includedFiles, excludedFiles, totalTokens, changes, importedFiles };
}
