import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class NcloudStorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>('NCLOUD_BUCKET');
    this.s3 = new S3Client({
      endpoint: this.config.getOrThrow<string>('NCLOUD_S3_ENDPOINT'),
      region: 'kr',
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('NCLOUD_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>(
          'NCLOUD_SECRET_ACCESS_KEY',
        ),
      },
      forcePathStyle: true,
    });
  }

  /**
   * 로컬 파일을 NCloud Object Storage에 업로드합니다.
   * @param localPath 로컬 파일 경로 (예: multer로 받은 file.path)
   * @param objectKey 저장 시 사용할 객체 키 (예: projects/{projectId}.zip)
   */
  async uploadFile(localPath: string, objectKey: string): Promise<void> {
    const fileSize = await fs.promises
      .stat(localPath)
      .then((stat) => stat.size);
    const multipartThreshold = 8 * 1024 * 1024;
    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const body = fs.createReadStream(localPath);

      try {
        if (fileSize >= multipartThreshold) {
          const upload = new Upload({
            client: this.s3,
            params: {
              Bucket: this.bucket,
              Key: objectKey,
              Body: body,
            },
            queueSize: 4,
            partSize: 8 * 1024 * 1024,
            leavePartsOnError: false,
          });
          await upload.done();
        } else {
          await this.s3.send(
            new PutObjectCommand({
              Bucket: this.bucket,
              Key: objectKey,
              Body: body,
            }),
          );
        }
        return;
      } catch (error: unknown) {
        lastError = error;
        body.destroy();

        if (!this.isRetryableStreamError(error) || attempt === maxAttempts) {
          throw error;
        }

        await this.sleep(300 * attempt);
      }
    }

    throw lastError;
  }

  /**
   * NCloud에서 객체를 다운로드해 임시 파일로 저장합니다.
   * 호출 측에서 사용 후 반드시 임시 파일을 삭제해야 합니다.
   * @param objectKey 객체 키 (예: projects/{projectId}.zip)
   * @returns 저장된 임시 파일의 절대 경로
   */
  async downloadToTempFile(objectKey: string): Promise<string> {
    const response = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );

    const stream = response.Body as Readable;
    if (!stream) {
      throw new Error(`Object not found: ${objectKey}`);
    }

    const tmpDir = os.tmpdir();
    const tmpPath = path.join(
      tmpDir,
      `ncloud-${Date.now()}-${path.basename(objectKey)}`,
    );
    const writeStream = fs.createWriteStream(tmpPath);

    await new Promise<void>((resolve, reject) => {
      stream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      stream.on('error', reject);
    });

    return tmpPath;
  }

  /**
   * NCloud Object Storage에서 객체를 삭제합니다.
   * @param objectKey 삭제할 객체 키 (예: projects/{projectId}.zip)
   */
  async deleteObject(objectKey: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
  }

  /** 객체 키 규칙: projects/{projectId}.zip */
  static objectKeyForProject(projectId: string): string {
    return `projects/${projectId}.zip`;
  }

  private isRetryableStreamError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const err = error as { code?: string; name?: string; message?: string };
    return (
      err.code === 'EPIPE' ||
      err.code === 'ECONNRESET' ||
      err.name === 'TimeoutError' ||
      err.name === 'NetworkingError' ||
      (err.message ?? '').toLowerCase().includes('streaming request')
    );
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
