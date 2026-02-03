import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

const MAX_SIZE = 300 * 1024 * 1024; // 300MB (ZIP 업로드와 동일)
const DOWNLOAD_TIMEOUT_MS = 60_000; // 60초

@Injectable()
export class GithubDownloadService {
  /**
   * URL에서 ZIP을 다운로드해 임시 파일로 저장합니다.
   * @returns 저장된 임시 파일 경로 (호출 측에서 사용 후 삭제 필요)
   */
  async downloadToTempFile(archiveUrl: string): Promise<string> {
    const tempPath = path.join(
      process.cwd(),
      'uploads',
      `github-${randomUUID()}.zip`,
    );

    try {
      const response = await axios({
        method: 'GET',
        url: archiveUrl,
        responseType: 'stream',
        timeout: DOWNLOAD_TIMEOUT_MS,
        maxRedirects: 5,
      });

      if (response.status !== 200) {
        this.throwUnavailableOrInvalidUrl();
      }

      return await this.streamToFileWithLimit(
        response.data as Readable,
        tempPath,
        MAX_SIZE,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404 || error.response?.status === 403) {
          this.throwUnavailableOrInvalidUrl();
        }
        if (error.code === 'ECONNABORTED') {
          throw new BadRequestException(
            '다운로드 시간이 초과되었습니다. 다시 시도해 주세요.',
          );
        }
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.throwUnavailableOrInvalidUrl();
    }
  }

  private throwUnavailableOrInvalidUrl(): never {
    throw new BadRequestException(
      "해당 Repository에 접근할 수 없습니다. Public Repository라면 URL을 확인해 주세요. Private Repository는 GitHub에서 ZIP으로 다운로드한 뒤 'ZIP 파일 업로드' 탭에서 업로드해 주세요.",
    );
  }

  private streamToFileWithLimit(
    stream: Readable,
    filePath: string,
    maxBytes: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      let totalBytes = 0;

      stream.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes > maxBytes) {
          stream.destroy();
          writeStream.close();
          fs.unlink(filePath, () => {});
          reject(
            new BadRequestException(
              '파일 크기가 너무 큽니다. 최대 300MB까지 가능합니다.',
            ),
          );
        }
      });

      stream.on('error', (err: Error) => {
        writeStream.close();
        fs.unlink(filePath, () => {});
        reject(err);
      });

      stream.on('end', () => {
        writeStream.end();
      });

      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', (err: Error) => {
        stream.destroy();
        fs.unlink(filePath, () => {});
        reject(err);
      });

      stream.pipe(writeStream);
    });
  }
}
