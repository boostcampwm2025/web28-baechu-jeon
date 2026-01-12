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
            readStream.on('data', (chunk) => chunks.push(chunk));
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

  private shouldReadFileContent(fileName: string): boolean {
    const lowerFileName = fileName.toLowerCase();
    const keywords = ['package', 'readme', 'config'];
    return keywords.some((keyword) => lowerFileName.includes(keyword));
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
            readStream.on('data', (chunk) => chunks.push(chunk));
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
