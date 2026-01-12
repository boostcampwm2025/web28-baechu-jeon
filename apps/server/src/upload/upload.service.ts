import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';
import { ZipParserService } from './zip-parser.service';
import { ProjectStructureService } from './project-structure.service';
import { GitignoreMatcherService } from './gitignore-matcher.service';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

const unlink = promisify(fs.unlink);

export interface ZipParseResult {
  projectId: string;
}

@Injectable()
export class UploadService {
  constructor(
    private readonly zipParser: ZipParserService,
    private readonly projectStructure: ProjectStructureService,
    private readonly gitignoreMatcher: GitignoreMatcherService,
    private readonly prisma: PrismaService,
  ) {}

  async parseZipFile(file: Express.Multer.File): Promise<ZipParseResult> {
    try {
      // 1. zip 파일에서 원시 데이터 추출
      const { entries, gitignoreContent, fileContents } =
        await this.zipParser.parseZip(file.path);

      // 2. gitignore 패턴 파싱
      const ignorePatterns =
        this.gitignoreMatcher.parseGitignore(gitignoreContent);

      // 3. 프로젝트 구조 생성
      const { structure, filesWithContent } =
        this.projectStructure.buildStructure(
          entries,
          ignorePatterns,
          fileContents,
        );

      // 프로젝트 저장
      const savedProject = await this.prisma.project.create({
        data: {
          title: file.originalname,
          structure: structure as unknown as Prisma.InputJsonValue,
          files: filesWithContent as unknown as Prisma.InputJsonValue,
        },
      });

      console.log('프로젝트 저장 완료');

      // 저장된 결과에서 ID를 가져옴
      return { projectId: savedProject.id };
    } finally {
      await this.cleanupFile(file.path);
    }
  }

  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('Failed to cleanup file:', filePath, error);
    }
  }
}
