import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { ZipParserService } from './services/zip-parser.service';
import { ProjectStructureService } from './services/project-structure.service';
import { GitignoreMatcherService } from './services/gitignore-matcher.service';
import { ProjectRepository } from './repositories/project.repository';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          // 고유한 파일명 생성
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ZipParserService,
    ProjectStructureService,
    GitignoreMatcherService,
    ProjectRepository,
  ],
})
export class ProjectsModule {}
