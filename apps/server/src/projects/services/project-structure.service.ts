import { Injectable } from '@nestjs/common';
import { GitignoreMatcherService } from './gitignore-matcher.service';

export interface FileWithContent {
  path: string;
  content: string;
}

export interface ProjectStructure {
  project_name: string;
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
    const folderSet = new Set<string>();
    const fileList: string[] = [];
    const filesWithContent: FileWithContent[] = [];
    let maxDepth = 0;

    // 1. 프로젝트 루트 이름 추출
    const firstEntry = entries.find((e) => e.includes('/')) || entries[0];
    const project_name = firstEntry ? firstEntry.split('/')[0] : 'root';

    for (const entry of entries) {
      // ignore 체크
      if (this.gitignoreMatcher.shouldIgnore(entry, ignorePatterns)) {
        continue;
      }

      // 2. 상대 경로 추출
      let relativePath = entry;
      if (entry.startsWith(project_name + '/')) {
        relativePath = entry.slice(project_name.length + 1);
      } else if (entry === project_name || entry === project_name + '/') {
        // 루트 폴더 자체는 목록에 넣지 않음
        continue;
      }

      // 빈 문자열이거나 루트(/)면 스킵
      if (!relativePath || relativePath === '/') continue;

      const isDirectory = entry.endsWith('/');
      const cleanPath = isDirectory ? relativePath.slice(0, -1) : relativePath;

      if (isDirectory) {
        if (cleanPath) folderSet.add(cleanPath);
      } else {
        fileList.push(cleanPath);

        // 파일 내용 매핑
        const content = fileContents.get(entry);
        if (content) {
          filesWithContent.push({ path: cleanPath, content });
        }

        // 경로의 모든 상위 폴더를 자동으로 추가
        const parts = cleanPath.split('/');
        for (let i = 0; i < parts.length - 1; i++) {
          const folderPath = parts.slice(0, i + 1).join('/');
          if (folderPath) {
            folderSet.add(folderPath);
          }
        }

        maxDepth = Math.max(maxDepth, parts.length);
      }
    }

    const sortedFolders = Array.from(folderSet).sort();
    const sortedFiles = fileList.sort();

    return {
      structure: {
        project_name,
        folders: sortedFolders,
        files: sortedFiles,
        stats: {
          maxDepth,
          totalFolders: sortedFolders.length,
          totalFiles: sortedFiles.length,
        },
      },
      filesWithContent: filesWithContent.sort((a, b) =>
        a.path.localeCompare(b.path),
      ),
    };
  }
}
