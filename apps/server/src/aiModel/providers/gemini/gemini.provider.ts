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
    try {
      console.log(
        `[GeminiProvider] Starting analysis for project ${request.projectId}`,
      );

      // 1단계: 2단계 분석 실행
      console.log(`[GeminiProvider] Step 2: Building prompts...`);
      const { systemPrompt: step2SystemPrompt, userPrompt: step2UserPrompt } =
        await this.buildPromptsStep2(request);

      console.log(`[GeminiProvider] Step 2: Calling Gemini API...`);
      const step2ApiResponse = await this.geminiService.callAPI(
        step2SystemPrompt,
        step2UserPrompt,
      );
      console.log(`[GeminiProvider] Step 2: API response received`);

      // 2단계 결과에서 텍스트 추출 및 파싱
      console.log(`[GeminiProvider] Step 2: Extracting text from response...`);
      const step2Result = this.extractTextFromResponse(step2ApiResponse);
      console.log(
        `[GeminiProvider] Step 2: Extracted text length: ${step2Result.length}`,
      );

      let step2ParsedResult: unknown;
      try {
        const jsonMatch = step2Result.match(
          /```json\n([\s\S]*?)\n```|({[\s\S]*}|\[[\s\S]*\])/,
        );
        const jsonString = jsonMatch
          ? jsonMatch[1] || jsonMatch[2]
          : step2Result;
        step2ParsedResult = JSON.parse(jsonString);
        console.log(`[GeminiProvider] Step 2: Successfully parsed JSON`);
      } catch (parseError) {
        console.warn(
          `[GeminiProvider] Step 2: Failed to parse JSON. Using raw text. Error:`,
          parseError,
        );
        step2ParsedResult = step2Result;
      }

      // 2단계: 3단계 분석 실행 (2단계 결과 + 파일 목록 + 파일 내용 포함)
      // Rate limit 방지를 위해 잠시 대기
      console.log(`[GeminiProvider] Waiting 2 seconds before Step 3...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`[GeminiProvider] Step 3: Building prompts...`);
      const { systemPrompt: step3SystemPrompt, userPrompt: step3UserPrompt } =
        await this.buildPromptsStep3(request, step2ParsedResult);

      console.log(
        `[GeminiProvider] Step 3: User prompt size: ${step3UserPrompt.length} characters`,
      );
      console.log(`[GeminiProvider] Step 3: Calling Gemini API...`);
      const step3ApiResponse = await this.geminiService.callAPI(
        step3SystemPrompt,
        step3UserPrompt,
      );
      console.log(`[GeminiProvider] Step 3: API response received`);

      // 3단계 결과 반환
      console.log(
        `[GeminiProvider] Analysis completed for project ${request.projectId}`,
      );
      return {
        projectId: request.projectId,
        result: step3ApiResponse as Record<string, unknown>,
      };
    } catch (error) {
      console.error(
        `[GeminiProvider] Analysis failed for project ${request.projectId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * 요청 데이터를 시스템/유저 프롬프트로 변환
   * @param request 분석 요청 데이터
   * @returns 시스템 프롬프트와 유저 프롬프트
   */
  private async buildPromptsStep2(request: AIAnalysisRequest): Promise<{
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

  /**
   * 요청 데이터를 시스템/유저 프롬프트로 변환 (3단계)
   * @param request 분석 요청 데이터
   * @param step2Result 2단계 분석 결과
   * @returns 시스템 프롬프트와 유저 프롬프트
   */
  private async buildPromptsStep3(
    request: AIAnalysisRequest,
    step2Result: unknown,
  ): Promise<{
    systemPrompt: string;
    userPrompt: string;
  }> {
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new NotFoundException(
        `Project with ID ${request.projectId} not found.`,
      );
    }

    const systemPrompt = `당신은 전문 소프트웨어 아키텍트입니다. 2단계에서 분석된 구조적 그룹 정보와 프로젝트의 메타데이터를 바탕으로 각 폴더의 역할을 추론합니다.

# 분석 지침

**역할 가설 생성 (Responsibility Hypothesis)**
- 각 폴더가 무슨 일을 할 가능성이 있는지 구조적 특징과 메타데이터 단서를 기반으로 가설 형태로 제공
- 반드시 근거를 명시해야 함
- 2단계에서 분석된 structural_groups 정보를 활용하여 각 그룹 내 폴더들의 역할을 추론
- 각 가설에 대해 신뢰도(confidence)를 0.0 ~ 1.0 사이의 값으로 평가해야 함


**중요 사항:**
- 설명은 한글로 하세요.
- 구조적 특징과 메타데이터(README, package.json 등)를 종합적으로 고려
- 각 가설은 명확한 근거를 가져야 함
- 신뢰도는 근거의 명확성과 확실성에 따라 정확하게 평가해야 함

**다음 JSON 형식으로 응답해주세요 (반드시 이 형식을 정확히 따르세요):**
{
 "responsibility_hypotheses": [
  {
    "folder_path": "폴더 경로",
    "hypothesis": "이 폴더가 무슨 일을 할 가능성이 있는지 가설",
    "evidence": "가설의 근거 (구조적 특징, 메타데이터 내용 등)",
    "confidence": 0.0 ~ 1.0 사이의 신뢰도 값 (0.0: 매우 낮음, 1.0: 매우 높음),
    "related_groups": ["관련된 structural_group의 group_name들"]
  }
 ]
}
`;

    const userPrompt = `## 2단계 분석 결과 (구조적 그룹)
${JSON.stringify(step2Result, null, 2)}

## 프로젝트 파일 목록
${JSON.stringify(project.structure, null, 2)}

## 프로젝트 파일 내용
${JSON.stringify(project.files, null, 2)}`;

    return { systemPrompt, userPrompt };
  }

  /**
   * API 응답에서 텍스트 추출
   * @param apiResponse Gemini API 응답
   * @returns 추출된 텍스트
   */
  private extractTextFromResponse(apiResponse: unknown): string {
    interface GeminiCandidate {
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }

    interface GeminiResponse {
      candidates?: GeminiCandidate[];
    }

    if (
      apiResponse &&
      typeof apiResponse === 'object' &&
      'candidates' in apiResponse
    ) {
      const response = apiResponse as GeminiResponse;
      if (
        response.candidates &&
        Array.isArray(response.candidates) &&
        response.candidates.length > 0
      ) {
        const candidate = response.candidates[0];
        if (
          candidate.content &&
          Array.isArray(candidate.content.parts) &&
          candidate.content.parts.length > 0 &&
          typeof candidate.content.parts[0].text === 'string'
        ) {
          return candidate.content.parts[0].text;
        }
      }
    }
    return '';
  }
}
