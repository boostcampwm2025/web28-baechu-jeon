import { Injectable, NotFoundException } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ProjectRepository } from '../../../upload/repositories/project.repository';
import { AIProvider } from '../../interfaces/ai-provider.interface';
import { AIAnalysisRequest } from '../../types/ai-request.types';
import { AIAnalysisResponse } from '../../types/ai-response.types';

/**
 * Gemini AI Provider 구현체
 */
@Injectable()
export class GeminiProvider implements AIProvider {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly projectRepository: ProjectRepository,
  ) {}

  /**
   * 프로젝트 분석 요청
   * @param request 분석 요청 데이터
   * @returns 분석 결과
   */
  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // 시스템 프롬프트와 유저 프롬프트 구성
    const { systemPrompt, userPrompt } = await this.buildPrompts(request);

    // Gemini API 호출
    const apiResponse = await this.geminiService.callAPI(
      systemPrompt,
      userPrompt,
    );

    // 응답을 그대로 반환
    return {
      projectId: request.projectId,
      result: apiResponse as Record<string, unknown>,
    };
  }

  /**
   * 요청 데이터를 시스템/유저 프롬프트로 변환
   * @param request 분석 요청 데이터
   * @returns 시스템 프롬프트와 유저 프롬프트
   */
  private async buildPrompts(request: AIAnalysisRequest): Promise<{
    systemPrompt: string;
    userPrompt: string;
  }> {
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new NotFoundException(
        `Project with ID ${request.projectId} not found.`,
      );
    }

    const systemPrompt = `
당신은 프로젝트 파일 그룹 분류자입니다.
제공된 파일 트리와 목록을 보고, 성격이 비슷한 파일끼리 그룹화하여 분석해주세요.

응답은 반드시 아래의 JSON 포맷을 따르는 단일 객체여야 합니다. (Markdown backticks 없이 순수 JSON만 반환하세요):

{
  "groupNames": ["그룹이름1", "그룹이름2", ...],
  "groups": [
    {
      "group": "그룹이름1",
      "files": ["경로/파일1", "경로/파일2"],
      "reason": "이 그룹으로 묶은 상세 이유",
      "pattern": "파일명이나 경로의 공통 패턴"
    },
    ...
  ]
}

규칙:
1. 'groupNames' 필드에는 생성된 모든 그룹의 'group' 이름만 문자열 배열로 담아주세요.
2. 'groups' 필드에는 상세 분석 내용을 담아주세요.
`;

    const userPrompt = `${JSON.stringify(project.structure, null, 2)}
${JSON.stringify(project.files, null, 2)} `;

    return { systemPrompt, userPrompt };
  }
}
