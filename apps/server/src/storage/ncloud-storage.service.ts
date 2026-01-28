import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
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
      region: 'kr-standard',
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
    const body = fs.createReadStream(localPath);
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: body,
      }),
    );
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

  /** 객체 키 규칙: projects/{projectId}.zip */
  static objectKeyForProject(projectId: string): string {
    return `projects/${projectId}.zip`;
  }
}
