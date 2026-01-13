import { Injectable } from '@nestjs/common';
import { GitignoreMatcherService } from './gitignore-matcher.service';

export interface FileWithContent {
  path: string;
  content: string;
}

export interface ProjectStructure {
  folders: string[];
  files: string[];
  stats: {
    maxDepth: number;
    totalFolders: number;
    totalFiles: number;
  };
}

@Injectable()
export class ProjectStructureService {
  constructor(private readonly gitignoreMatcher: GitignoreMatcherService) {}

  buildStructure(
    entries: string[],
    ignorePatterns: string[],
    fileContents: Map<string, string>,
  ): { structure: ProjectStructure; filesWithContent: FileWithContent[] } {
    const folders = new Set<string>();
    const files: string[] = [];
    const filesWithContent: FileWithContent[] = [];
    let maxDepth = 0;

    for (const entry of entries) {
      if (this.gitignoreMatcher.shouldIgnore(entry, ignorePatterns)) {
        continue;
      }

      const isDirectory = entry.endsWith('/');

      if (isDirectory) {
        const folderPath = entry.slice(0, -1);
        if (folderPath) {
          folders.add(folderPath);
        }
      } else {
        files.push(entry);

        const content = fileContents.get(entry);
        if (content) {
          filesWithContent.push({ path: entry, content });
        }

        const parts = entry.split('/');
        for (let i = 0; i < parts.length - 1; i++) {
          const folderPath = parts.slice(0, i + 1).join('/');
          if (
            folderPath &&
            !this.gitignoreMatcher.shouldIgnore(folderPath, ignorePatterns)
          ) {
            folders.add(folderPath);
          }
        }

        const depth = parts.length;
        if (depth > maxDepth) {
          maxDepth = depth;
        }
      }
    }

    return {
      structure: {
        folders: Array.from(folders).sort(),
        files: files.sort(),
        stats: {
          maxDepth,
          totalFolders: folders.size,
          totalFiles: files.length,
        },
      },
      filesWithContent: filesWithContent.sort((a, b) =>
        a.path.localeCompare(b.path),
      ),
    };
  }
}
