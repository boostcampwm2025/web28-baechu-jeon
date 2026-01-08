import { Injectable } from '@nestjs/common';
import * as yauzl from 'yauzl';
import { promisify } from 'util';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

const unlink = promisify(fs.unlink);

export interface ZipFileEntry {
  fileName: string;
  fileSize: number;
  compressedSize: number;
  isDirectory: boolean;
}

export interface ZipMetadata {
  totalFiles: number;
  totalSize: number;
  files: ZipFileEntry[];
}

export interface ZipParseResult {
  projectId: string;
}

@Injectable()
export class UploadService {
  async parseZipFile(file: Express.Multer.File): Promise<ZipParseResult> {
    try {
      const metadata = await this.readZipMetadata(file.path);

      const projectId = randomUUID();
      // TODO: 메타데이터를 DB에 저장
      // await this.saveProject(projectId, metadata);
      console.log('프로젝트 ID:', projectId);
      console.log('메타데이터:', metadata);

      return { projectId };
    } finally {
      await this.cleanupFile(file.path);
    }
  }

  private async readZipMetadata(zipPath: string): Promise<ZipMetadata> {
    return new Promise((resolve, reject) => {
      const files: ZipFileEntry[] = [];
      let totalSize = 0;

      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          return reject(err instanceof Error ? err : new Error(String(err)));
        }

        zipfile.readEntry();

        zipfile.on('entry', (entry: yauzl.Entry) => {
          const isDirectory = /\/$/.test(entry.fileName);

          if (!isDirectory) {
            // 파일 메타데이터만 수집 (실제 파일은 추출하지 않음)
            files.push({
              fileName: entry.fileName,
              fileSize: entry.uncompressedSize,
              compressedSize: entry.compressedSize,
              isDirectory: false,
            });
            totalSize += entry.uncompressedSize;
          }

          zipfile.readEntry();
        });

        zipfile.on('end', () => {
          resolve({
            totalFiles: files.length,
            totalSize,
            files,
          });
        });

        zipfile.on('error', (error) => {
          reject(error instanceof Error ? error : new Error(String(error)));
        });
      });
    });
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
