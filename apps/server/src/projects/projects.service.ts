import { Injectable, NotFoundException } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';
import { ZipParserService } from './services/zip-parser.service';
import {
  ProjectStructure,
  ProjectStructureService,
} from './services/project-structure.service';
import { GitignoreMatcherService } from './services/gitignore-matcher.service';
import { ProjectRepository } from './repository/project.repository';
import { NcloudStorageService } from '../storage/ncloud-storage.service';
import { Step1Result } from '../ai/types/ai.types';

const unlink = promisify(fs.unlink);

export interface ZipParseResult {
  projectId: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly zipParser: ZipParserService,
    private readonly projectStructure: ProjectStructureService,
    private readonly gitignoreMatcher: GitignoreMatcherService,
    private readonly projectRepository: ProjectRepository,
    private readonly ncloudStorage: NcloudStorageService,
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

      const savedProject = await this.projectRepository.create({
        title: file.originalname,
        structure,
        files: filesWithContent,
      });

      const objectKey = NcloudStorageService.objectKeyForProject(
        savedProject.id,
      );
      await this.ncloudStorage.uploadFile(file.path, objectKey);

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

  async getProjectStructure(projectId: string) {
    const project = await this.projectRepository.findStructureById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const structureData = project.structure as unknown as ProjectStructure;

    return {
      projectId: project.id,
      status: project.status,
      projectStructure: {
        files: structureData.files || [],
        folders: structureData.folders || [],
      },
    };
  }

  /**
   * Step1 결과에서 요청한 주요 파일들을 NCloud에서 다운로드해 추출합니다.
   * @param projectId 프로젝트 ID
   * @param step1Result Step1 분석 결과
   * @returns 파일 경로 → 파일 내용 매핑
   */
  async extractMainFiles(
    projectId: string,
    step1Result: Step1Result,
  ): Promise<Record<string, string>> {
    if (
      !step1Result.project_main_files?.length ||
      step1Result.project_main_files.length === 0
    ) {
      return {};
    }

    const paths = step1Result.project_main_files.map((item) => item.file_path);
    const objectKey = NcloudStorageService.objectKeyForProject(projectId);
    let tmpPath: string | null = null;

    try {
      tmpPath = await this.ncloudStorage.downloadToTempFile(objectKey);
      const fileContents = await this.zipParser.extractPaths(tmpPath, paths);
      return Object.fromEntries(fileContents);
    } finally {
      if (tmpPath) {
        try {
          await unlink(tmpPath);
        } catch (error) {
          console.error(`임시 파일 삭제 실패: ${tmpPath}`, error);
        }
      }
    }
  }

  /**
   * 프로젝트의 NCloud ZIP 파일을 삭제합니다.
   * @param projectId 프로젝트 ID
   */
  async deleteProjectZip(projectId: string): Promise<void> {
    const objectKey = NcloudStorageService.objectKeyForProject(projectId);
    await this.ncloudStorage.deleteObject(objectKey);
  }
}
