import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
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
            new HttpException(
              'Only ZIP files are allowed',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadZip(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const { projectId } = await this.uploadService.parseZipFile(file);
      return {
        success: true,
        projectId,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to process ZIP file';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
