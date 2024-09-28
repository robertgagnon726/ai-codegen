/**
 * Represents a file object with a path and content.
 */
export interface FileObject {
    path: string;
    content: string | null;
    originalContent?: string | null;
    tokenCount?: number;
  }
  
/**
 * Represents the changes in the repository.
 */
export interface Changes {
    modified: FileObject[];
    added: FileObject[];
    deleted: FileObject[];
    context: FileObject[];
}