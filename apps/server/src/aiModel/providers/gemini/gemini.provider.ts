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

    const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다. 프로젝트의 폴더 구조와 파일 구조를 분석하여 구조적 패턴을 파악합니다.
# 분석 지침

**그룹화 전략**
 - **계층적 그룹화 (Layer)**: UI, 비즈니스 로직, 데이터 접근 등 계층으로 구분되는 경우
 - 예: "presentation", "business", "data" 레이어
 - **기능별 그룹화 (Feature)**: 특정 기능을 담당하는 파일들이 모여있는 경우
 - 예: "user", "auth", "payment" 기능
 - **패키지/모듈 그룹화 (Package)**: 독립적인 패키지나 모듈로 구성된 경우
 - 예: "web", "server", "shared" 패키지
 - **네이밍 컨벤션 그룹화 (Naming Convention)**: 네이밍 패턴으로 묶이는 경우
 - 예: "components", "services", "utils" 폴더
 - **도메인 그룹화 (Domain)**: 비즈니스 도메인으로 구분되는 경우
 - 예: "user", "order", "product" 도메인

**중요 사항:**
 - 설명은 한글로 하세요.
 - 같은 파일이 여러 그룹에 속할 수 있음 (예: components는 layer이면서 naming_convention일 수 있음)
 - 각 그룹은 명확한 특징을 가져야 함

**다음 JSON 형식으로 응답해주세요 (반드시 이 형식을 정확히 따르세요):**
{
 "structural_groups": [
  {
     “group_name”: 각 그룹을 대표할 수 있는 이름(예: backend_api_modules, backend_data_access, frontend_api_client 등등) 
   "group_type": "layer" | "feature" | "package" | "naming_convention" | "domain",
   "pattern": "그룹을 식별할 수 있는 패턴 (예: "apps/*, packages/*, pnpm-workspace.yaml, turbo.json")",
   "description": "이 그룹의 특징과 목적을 상세 설명",
  }
 ]
}
`;

    const userPrompt = `프로젝트 파일 목록: ${JSON.stringify(project.structure, null, 2)}`;

    return { systemPrompt, userPrompt };
  }
}
