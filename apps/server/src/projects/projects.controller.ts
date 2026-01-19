import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

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
      const { projectId } = await this.projectsService.parseZipFile(file);
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
