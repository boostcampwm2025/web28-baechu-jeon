import { Injectable } from '@nestjs/common';
import * as yauzl from 'yauzl';

export interface ZipParseResult {
  entries: string[];
  gitignoreContent: string | null;
  fileContents: Map<string, string>;
}

@Injectable()
export class ZipParserService {
  async parseZip(zipPath: string): Promise<ZipParseResult> {
    const { allEntries, gitignoreContent } = await this.collectEntries(zipPath);
    const fileContents = await this.readFileContents(zipPath, allEntries);

    return {
      entries: allEntries,
      gitignoreContent,
      fileContents,
    };
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

          const isGitignoreFile =
            entry.fileName === '.gitignore' ||
            entry.fileName.endsWith('/.gitignore');

          if (!isGitignoreFile) {
            zipfile.readEntry();
            return;
          }

          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              zipfile.readEntry();
              return;
            }

            const chunks: Buffer[] = [];
            readStream.on('data', (chunk: Buffer) => chunks.push(chunk));
            readStream.on('end', () => {
              gitignoreContent = Buffer.concat(chunks).toString('utf8');
              zipfile.readEntry();
            });
          });
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

  /**
   * AI 분석에 필요한 핵심 파일인지 확인하는 로직 (내용 수집 여부 결정)
   */
  private shouldReadFileContent(fileName: string): boolean {
    // 1. 경로 정규화 (OS 구분자 대응) 및 소문자화
    const normalizedPath = fileName.replace(/\\/g, '/').toLowerCase();
    const parts = normalizedPath.split('/');

    // 2. packages/ 폴더 내부는 무조건 제외
    // parts 배열 중 어느 하나라도 packages라면 내용을 읽지 않음
    if (parts.includes('packages')) {
      return false;
    }

    // 3. 수집 대상 파일 정의
    const name = parts[parts.length - 1];

    // 테스트 관련 파일 (.spec, .test, e2e-spec)
    const isTestFile = /\.(spec|test|e2e-spec)\.[tj]sx?$/.test(name);

    // 테스트 전용 폴더 내부 파일들
    const isInTestFolder = parts.some((p) =>
      ['test', 'tests', '__tests__'].includes(p),
    );

    // 핵심 설정 및 문서 (package.json, README.md 등)
    // 여기서 .md 파일 확장자 체크
    const isDocumentOrConfig = name === 'package.json' || name.endsWith('.md');

    // 기타 분석에 필요한 config 파일들 (필요시 추가)
    // const configFiles = [
    //   'turbo.json',
    //   'nest-cli.json',
    //   'vite.config.ts',
    //   'tsconfig.json',
    // ];
    // const isMainConfig = configFiles.includes(name);

    return isTestFile || isInTestFolder || isDocumentOrConfig;
  }

  private async readFileContents(
    zipPath: string,
    allEntries: string[],
  ): Promise<Map<string, string>> {
    const fileContents = new Map<string, string>();

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
          if (!filesToRead.includes(entry.fileName)) {
            zipfile.readEntry();
            return;
          }

          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              zipfile.readEntry();
              return;
            }

            const chunks: Buffer[] = [];
            readStream.on('data', (chunk: Buffer) => chunks.push(chunk));
            readStream.on('end', () => {
              const content = Buffer.concat(chunks).toString('utf8');
              fileContents.set(entry.fileName, content);
              zipfile.readEntry();
            });
          });
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
}
