import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';
import { ZipParserService } from './services/zip-parser.service';
import { ProjectStructureService } from './services/project-structure.service';
import { GitignoreMatcherService } from './services/gitignore-matcher.service';
import { ProjectRepository } from './repositories/project.repository';
import { AnalysisService } from '../analysis/analysis.service';

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
    private readonly projectRepository: ProjectRepository,
    private readonly analysisService: AnalysisService,
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
      const savedProject = await this.projectRepository.create({
        title: file.originalname,
        structure,
        files: filesWithContent,
      });

      console.log('프로젝트 저장 완료');

      // AI 분석 시작 (비동기로 실행, 에러는 내부에서 처리)
      this.analysisService.startAiAnalysis(savedProject.id).catch((error) => {
        console.error(
          `[UploadService] AI analysis failed for project ${savedProject.id}:`,
          error,
        );
      });

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
