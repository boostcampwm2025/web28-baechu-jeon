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
      console.time('Step 2'); // Step 2 시작
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
      console.timeEnd('Step 2'); // Step 2 종료, 시간 출력

      // 2단계: 3단계 분석 실행 (2단계 결과 + 파일 목록 + 파일 내용 포함)
      // Rate limit 방지를 위해 잠시 대기
      console.log(`[GeminiProvider] Waiting 2 seconds before Step 3...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`[GeminiProvider] Step 3: Building prompts...`);
      console.time('Step 3'); // Step 3 시작
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

      // 3단계 결과에서 텍스트 추출 및 파싱
      console.log(`[GeminiProvider] Step 3: Extracting text from response...`);
      const step3Result = this.extractTextFromResponse(step3ApiResponse);
      console.log(
        `[GeminiProvider] Step 3: Extracted text length: ${step3Result.length}`,
      );

      let step3ParsedResult: unknown;
      try {
        const jsonMatch = step3Result.match(
          /```json\n([\s\S]*?)\n```|({[\s\S]*}|\[[\s\S]*\])/,
        );
        const jsonString = jsonMatch
          ? jsonMatch[1] || jsonMatch[2]
          : step3Result;
        step3ParsedResult = JSON.parse(jsonString);
        console.log(`[GeminiProvider] Step 3: Successfully parsed JSON`);
      } catch (parseError) {
        console.warn(
          `[GeminiProvider] Step 3: Failed to parse JSON. Using raw text. Error:`,
          parseError,
        );
        step3ParsedResult = step3Result;
      }
      console.timeEnd('Step 3'); // Step 3 종료, 시간 출력

      // 4단계 분석 실행 (3단계 결과 + 파일 목록 + 파일 내용 포함)
      // Rate limit 방지를 위해 잠시 대기
      console.log(`[GeminiProvider] Waiting 2 seconds before Step 4...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`[GeminiProvider] Step 4: Building prompts...`);
      console.time('Step 4'); // Step 4, 5 시작
      const { systemPrompt: step4SystemPrompt, userPrompt: step4UserPrompt } =
        await this.buildPromptsStep4(
          request,
          step2ParsedResult,
          step3ParsedResult,
        );

      console.log(
        `[GeminiProvider] Step 4: User prompt size: ${step4UserPrompt.length} characters`,
      );
      console.log(`[GeminiProvider] Step 4: Calling Gemini API...`);
      const step4ApiResponse = await this.geminiService.callAPI(
        step4SystemPrompt,
        step4UserPrompt,
      );
      console.log(`[GeminiProvider] Step 4: API response received`);

      // 4단계 결과에서 텍스트 추출 및 파싱
      console.log(`[GeminiProvider] Step 4: Extracting text from response...`);
      const step4Result = this.extractTextFromResponse(step4ApiResponse);
      console.log(
        `[GeminiProvider] Step 4: Extracted text length: ${step4Result.length}`,
      );

      let step4ParsedResult: unknown;
      try {
        const jsonMatch = step4Result.match(
          /```json\n([\s\S]*?)\n```|({[\s\S]*}|\[[\s\S]*\])/,
        );
        const jsonString = jsonMatch
          ? jsonMatch[1] || jsonMatch[2]
          : step4Result;
        step4ParsedResult = JSON.parse(jsonString);
        console.log(`[GeminiProvider] Step 4: Successfully parsed JSON`);
      } catch (parseError) {
        console.warn(
          `[GeminiProvider] Step 4: Failed to parse JSON. Using raw text. Error:`,
          parseError,
        );
        step4ParsedResult = step4Result;
      }
      console.timeEnd('Step 4'); // Step 4, 5 종료, 시간 출력

      // 4단계 결과 반환
      console.log(
        `[GeminiProvider] Analysis completed for project ${request.projectId}`,
      );
      return {
        projectId: request.projectId,
        result: {
          step2: step2ParsedResult,
          step3: step3ParsedResult,
          step4: step4ParsedResult,
        },
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

    const userPrompt = `## 프로젝트 파일 목록
${JSON.stringify(project.structure, null, 2)}

## 프로젝트 파일 내용
${JSON.stringify(project.files, null, 2)}`;

    return { systemPrompt, userPrompt };
  }

  /**
   * 요청 데이터를 시스템/유저 프롬프트로 변환 (4단계)
   * @param request 분석 요청 데이터
   * @param step3Result 3단계 분석 결과
   * @returns 시스템 프롬프트와 유저 프롬프트
   */
  private async buildPromptsStep4(
    request: AIAnalysisRequest,
    step2Result: unknown,
    step3Result: unknown,
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

    const systemPrompt = `
당신은 전문 소프트웨어 아키텍트입니다.
2단계와 3단계에서 분석된 정보를 바탕으로 프로젝트의 구조적 특성,
아키텍처적 성향, 그리고 프로젝트 의도를 신중하게 추론합니다.

분석의 목적은 "확정적인 단정"이 아니라,
관측 가능한 구조적 신호에 근거한 "가설적 해석"을 제공하는 것입니다.

--------------------------------------------------
# 분석 지침
--------------------------------------------------

## **4단계: 아키텍처적 성향 추론 (Architectural Tendencies)**

- 프로젝트의 전반적인 구조적 성향을 파악할 것
- "Layered Architecture다"와 같은 단정적 표현은 금지
  → "~을 지향하는 성향을 보인다", "~한 흔적이 있다", "~에 가깝다"와 같은 표현만 허용
- 구체적인 패턴과 신호를 반드시 명시할 것
- 구조적 신호가 불충분하거나 상충될 경우,
  architectural_tendencies는 "명확한 성향을 단정하기 어렵다"는 결론을 허용함
- 이 경우 confidence는 반드시 "low"로 설정할 것

### 작성 규칙
- patterns와 signals에는 **관측 가능한 구조적 사실만** 포함
- 의미 해석, 의도 추론은 tendency 문장에만 포함
- 추상적 평가(잘 정리됨, 깔끔함, 명확함 등)는 금지

### confidence 판단 기준
- high: 서로 다른 독립적인 구조 신호 3개 이상이 동일한 성향을 일관되게 가리킬 때
- medium: 1~2개의 명확한 신호가 있으나 반례 또는 공백이 존재할 때
- low: 구조적 단서가 약하거나 추측에 의존할 수밖에 없을 때


--------------------------------------------------
## **4-1단계: 아키텍처 레이어 기반 폴더 매핑 가설 (Layer Mapping Hypothesis)**

- 4단계에서 도출된 아키텍처 성향을 전제로,
  해당 아키텍처에서 일반적으로 기대되는 "레이어 개념"에 따라
  프로젝트의 폴더들을 **가설적으로 매핑**할 수 있음
- 이 매핑은 구조적 관측에 기반한 추정이며,
  아키텍처 성향이 명확하지 않을 경우 "명확하지 않음"으로 작성 가능
- 하나의 폴더가 여러 레이어의 성격을 동시에 가지는 경우 이를 명시할 것
- 아키텍처 규칙이 엄격하게 enforced되어 있지 않은 경우,
  그 한계를 notes에 반드시 기술할 것

### 반드시 포함해야 할 요소
- assumed_architecture: 전제로 삼은 아키텍처 유형 또는 "명확하지 않음"
- 각 레이어별 mapped_folders
- 매핑의 근거(basis): 폴더 위치, 파일명, 역할 가설 등 관측 가능한 사실만 사용
- 한계, 예외, 애매한 지점(notes)

### confidence 판단 기준
- high: 다수의 폴더가 일관되게 레이어 개념과 대응되고, 반례가 거의 없을 때
- medium: 일부 레이어는 대응되나 혼재되거나 애매한 폴더가 존재할 때
- low: 레이어 개념과 폴더 구조의 대응이 매우 약하거나 추측에 가까울 때


--------------------------------------------------
## **5단계: 프로젝트 의도 추론 (Project Intent)**

- 프로젝트의 목적과 개발자 의도를 구조적 근거를 바탕으로 신중하게 분석
- 개요, 목적, 주요 기능, 기술 스택, 개발 접근 방식을 종합적으로 서술
- README, package.json, 폴더 구조, 설정 파일을 주요 근거로 사용할 것

### 중요한 제한 사항
- README.md가 존재하지 않거나 비어 있는 경우,
  이를 하나의 "명시적 신호"로 간주하고 confidence 판단에 반영할 것
- README에 명확히 드러나지 않은
  대상 사용자, 비즈니스 목적, 서비스 맥락은 추측하지 말 것
- 명확한 근거가 없는 항목은 "명확하지 않음"으로 작성 가능

### evidence 규칙
- evidence는 반드시 다음 중 하나 이상을 명시해야 함:
  - README.md의 특정 문장 요약
  - package.json의 특정 필드(name, scripts, dependencies 등)
  - 폴더 구조에서 드러나는 명확한 패턴

### confidence 판단 기준
- high: 서로 다른 파일/구조에서 최소 3개의 독립적인 근거가 일치할 때
- medium: 1~2개의 근거가 있으나 범위가 제한적일 때
- low: README 부재, 메타데이터 부족 등으로 추론이 불안정할 때


--------------------------------------------------
## **일반 지침**

- 확신할 수 없는 경우, 정보를 채우는 것보다
  불확실함을 명시하는 것을 최우선으로 할 것
- 3단계의 responsibility_hypotheses가
  아키텍처 성향 또는 레이어 매핑과 충돌할 경우,
  그 불일치를 명시적으로 기술할 것
- 모든 설명은 한글로 작성할 것
- 모든 분석 결과는 반드시 관측 가능한 근거에 기반해야 함


--------------------------------------------------
## **응답 형식 (반드시 정확히 따를 것)**

{
  "architectural_tendencies": {
    "tendency": "프로젝트의 전반적인 아키텍처 성향 설명",
    "patterns": ["구체적인 패턴 1", "구체적인 패턴 2"],
    "signals": ["관측 가능한 신호 1", "관측 가능한 신호 2"],
    "confidence": "low" | "medium" | "high"
  },
  "layer_mapping_hypothesis": {
    "assumed_architecture": "Layered Architecture | Clean Architecture | Hexagonal | 명확하지 않음",
    "layers": [
      {
        "layer": "레이어 이름",
        "mapped_folders": ["폴더 경로 1", "폴더 경로 2"],
        "basis": ["매핑 근거 1", "매핑 근거 2"]
      }
    ],
    "notes": ["한계 또는 예외 사항"],
    "confidence": "low" | "medium" | "high"
  },
  "project_intent": {
    "overview": "프로젝트 개요",
    "purpose": "프로젝트 목적",
    "key_features": ["기능 1", "기능 2"],
    "technology_stack": {
      "frontend": ["기술"],
      "backend": ["기술"],
      "infrastructure": ["기술"]
    },
    "development_approach": "개발 접근 방식",
    "evidence": ["근거 1", "근거 2"],
    "confidence": "low" | "medium" | "high"
  }
}
`;
    const userPrompt = `## 3단계 분석 결과 (폴더 역할 가설)
${JSON.stringify(step3Result, null, 2)}

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
