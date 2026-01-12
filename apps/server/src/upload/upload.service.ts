import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { ZipParserService } from './zip-parser.service';
import { ProjectStructureService } from './project-structure.service';
import { GitignoreMatcherService } from './gitignore-matcher.service';

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

      const projectId = randomUUID();
      // TODO: 구조를 DB에 저장
      // await this.saveProject(projectId, structure, filesWithContent);
      console.log('프로젝트 ID:', projectId);
      console.log('프로젝트 구조:', structure);
      console.log('파일 내용:', filesWithContent);

      return { projectId };
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
