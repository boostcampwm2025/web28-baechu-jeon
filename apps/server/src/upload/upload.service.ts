import { Injectable } from '@nestjs/common';
import * as yauzl from 'yauzl';
import { promisify } from 'util';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

const unlink = promisify(fs.unlink);

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

export interface ZipParseResult {
  projectId: string;
}

@Injectable()
export class UploadService {
  async parseZipFile(file: Express.Multer.File): Promise<ZipParseResult> {
    try {
      const { structure, filesWithContent } = await this.readZipStructure(
        file.path,
      );

      const projectId = randomUUID();
      // TODO: 구조를 DB에 저장
      // await this.saveProject(projectId, structure, filesWithContent);
      console.log('프로젝트 ID:', projectId);
      console.log('프로젝트 구조:', structure);
      console.log('파일 내용:', filesWithContent);

      return { projectId };
    } finally {
      await this.cleanupFile(file.path);
    }
  }

  private async readZipStructure(zipPath: string): Promise<{
    structure: ProjectStructure;
    filesWithContent: FileWithContent[];
  }> {
    // 1st pass: 엔트리 목록과 .gitignore 수집
    const { allEntries, gitignoreContent } = await this.collectEntries(zipPath);

    // ignore 패턴 파싱
    const ignorePatterns = this.parseGitignore(gitignoreContent);

    // 2nd pass: 특정 파일 내용 읽기
    const fileContents = await this.readFileContents(zipPath, allEntries);

    // 프로젝트 구조 생성
    return this.buildProjectStructure(allEntries, ignorePatterns, fileContents);
  }

  private async collectEntries(
    zipPath: string,
  ): Promise<{ allEntries: string[]; gitignoreContent: string | null }> {
    return new Promise((resolve, reject) => {
      const allEntries: string[] = [];
      let gitignoreContent: string | null = null;

      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          return reject(err instanceof Error ? err : new Error(String(err)));
        }

        zipfile.readEntry();

        zipfile.on('entry', (entry: yauzl.Entry) => {
          allEntries.push(entry.fileName);

          // .gitignore 파일 찾기
          if (
            entry.fileName === '.gitignore' ||
            entry.fileName.endsWith('/.gitignore')
          ) {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                zipfile.readEntry();
                return;
              }

              const chunks: Buffer[] = [];
              readStream.on('data', (chunk) => chunks.push(chunk));
              readStream.on('end', () => {
                gitignoreContent = Buffer.concat(chunks).toString('utf8');
                zipfile.readEntry();
              });
            });
          } else {
            zipfile.readEntry();
          }
        });

        zipfile.on('end', () => {
          resolve({ allEntries, gitignoreContent });
        });

        zipfile.on('error', (error) => {
          reject(error instanceof Error ? error : new Error(String(error)));
        });
      });
    });
  }

  private shouldReadFileContent(fileName: string): boolean {
    const lowerFileName = fileName.toLowerCase();

    // 파일명에 특정 키워드가 포함되어 있는지 체크
    const keywords = ['package', 'readme', 'config'];

    return keywords.some((keyword) => lowerFileName.includes(keyword));
  }

  private async readFileContents(
    zipPath: string,
    allEntries: string[],
  ): Promise<Map<string, string>> {
    const fileContents = new Map<string, string>();

    // 읽어야 할 파일들만 필터링
    const filesToRead = allEntries.filter(
      (entry) => !entry.endsWith('/') && this.shouldReadFileContent(entry),
    );

    if (filesToRead.length === 0) {
      return fileContents;
    }

    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          return reject(err instanceof Error ? err : new Error(String(err)));
        }

        zipfile.readEntry();

        zipfile.on('entry', (entry: yauzl.Entry) => {
          if (filesToRead.includes(entry.fileName)) {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                zipfile.readEntry();
                return;
              }

              const chunks: Buffer[] = [];
              readStream.on('data', (chunk) => chunks.push(chunk));
              readStream.on('end', () => {
                const content = Buffer.concat(chunks).toString('utf8');
                fileContents.set(entry.fileName, content);
                zipfile.readEntry();
              });
            });
          } else {
            zipfile.readEntry();
          }
        });

        zipfile.on('end', () => {
          resolve(fileContents);
        });

        zipfile.on('error', (error) => {
          reject(error instanceof Error ? error : new Error(String(error)));
        });
      });
    });
  }

  private parseGitignore(content: string | null): string[] {
    // gitignore가 없으면 기본 패턴 사용
    if (!content) {
      return [
        'node_modules',
        'dist',
        'build',
        '.next',
        '.git',
        'coverage',
        '.env',
        '.DS_Store',
        'out',
        '.turbo',
        '*.log',
      ];
    }

    // gitignore 파싱
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#')) // 빈 줄과 주석 제거
      .map((line) => line.replace(/^\//, '')); // 시작 슬래시 제거
  }

  private shouldIgnore(path: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      // 와일드카드 패턴 처리 (*.log 등)
      if (pattern.includes('*')) {
        const regex = new RegExp(
          '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
        );
        if (regex.test(path)) return true;
      }

      // 정확한 폴더/파일명 매칭
      const pathParts = path.split('/');
      if (pathParts.includes(pattern)) return true;

      // 경로로 시작하는지 체크
      if (path.startsWith(pattern + '/')) return true;
      if (path === pattern) return true;
    }

    return false;
  }

  private buildProjectStructure(
    entries: string[],
    ignorePatterns: string[],
    fileContents: Map<string, string>,
  ): { structure: ProjectStructure; filesWithContent: FileWithContent[] } {
    const folders = new Set<string>();
    const files: string[] = [];
    const filesWithContent: FileWithContent[] = [];
    let maxDepth = 0;

    for (const entry of entries) {
      // ignore 패턴에 매칭되면 스킵
      if (this.shouldIgnore(entry, ignorePatterns)) {
        continue;
      }

      const isDirectory = entry.endsWith('/');

      if (isDirectory) {
        // 디렉토리인 경우
        const folderPath = entry.slice(0, -1); // 마지막 '/' 제거
        if (folderPath) {
          folders.add(folderPath);
        }
      } else {
        // 파일인 경우
        files.push(entry);

        // 파일 내용이 있으면 filesWithContent에 추가
        const content = fileContents.get(entry);
        if (content) {
          filesWithContent.push({
            path: entry,
            content: content,
          });
        }

        // 파일의 부모 폴더들을 모두 추출
        const parts = entry.split('/');
        for (let i = 0; i < parts.length - 1; i++) {
          const folderPath = parts.slice(0, i + 1).join('/');
          if (folderPath && !this.shouldIgnore(folderPath, ignorePatterns)) {
            folders.add(folderPath);
          }
        }

        // 최대 깊이 계산
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

  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      // 파일 삭제 실패는 로깅만 하고 에러를 던지지 않음
      console.error('Failed to cleanup file:', filePath, error);
    }
  }
}
