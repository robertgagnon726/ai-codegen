import { gatherProjectConfigFiles } from "../../context-reader";
import { getChangedFilesWithContent } from "../../git/get-changed-files-with-content.git";
import { getImportedFiles } from "../../git/get-imported-files.git";
import { FileObject } from "../../git/git.types";
import { limitContextByTokens } from "../../git/limit-context-by-tokens.git";
import { getMaxImportDepth } from "../../manager.config";

export async function processChangedFiles() {
  const changes = getChangedFilesWithContent();
  const maxDepth = getMaxImportDepth();
  const configFiles = await gatherProjectConfigFiles();

  const importedFiles: FileObject[] = [];

  // Collect imported files for modified and added files
  changes.modified.forEach((file) => {
    if (file.originalContent && file.content) {
      const _importedFiles = getImportedFiles(file.path, 1, maxDepth);
      importedFiles.push(..._importedFiles);
    }
  });

  changes.added.forEach((file) => {
    const _importedFiles = getImportedFiles(file.path, 1, maxDepth);
    importedFiles.push(..._importedFiles);
  });

  const { includedFiles, excludedFiles, totalTokens } = limitContextByTokens(changes.added, changes.modified, changes.deleted, changes.context, importedFiles, configFiles);

  return { includedFiles, excludedFiles, totalTokens };
}
