import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('zip')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 300 * 1024 * 1024, // 300MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.endsWith('.zip')) {
          return cb(
            new BadRequestException('Only ZIP files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadZip(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const { projectId } = await this.uploadService.parseZipFile(file);
      return {
        success: true,
        projectId,
      };
    } catch (error) {
      console.error('ZIP file processing failed:', error);

      // ZIP 파일 형식 문제는 클라이언트 에러
      if (
        error instanceof Error &&
        (error.message.toLowerCase().includes('invalid') ||
          error.message.toLowerCase().includes('corrupt') ||
          error.message.toLowerCase().includes('signature not found'))
      ) {
        throw new BadRequestException('Invalid or corrupted ZIP file');
      }

      // 그 외는 서버 에러
      throw new InternalServerErrorException('Failed to process ZIP file');
    }
  }
}
