import { AnalysisResult, Project } from '@prisma/client/edge';

export type Step1Input = Project;

/** Step1 AI 응답: 프로젝트 이해를 위해 추가로 볼 주요 파일 목록 */
export interface Step1Result {
  project_main_files: Array<{
    file_path: string;
    evidence: string;
    confidence: 'low' | 'medium' | 'high';
  }>;
}
export type Step2Input = {
  project: Project;
  analysisResult: AnalysisResult;
  /** 1단계에서 요청한 주요 파일 내용 (경로 -> 내용). Step2에만 제공 */
  additionalFileContents?: Record<string, string>;
};

/** Step2 AI 응답: 폴더·파일별 역할 가설 (path = 폴더 또는 Step1 주요 파일 경로) */
export interface Step2Result {
  responsibility_hypotheses: Array<{
    path: string;
    hypothesis: string;
    confidence: 'low' | 'medium' | 'high';
  }>;
}

/** Step2+3 통합 AI 응답: 한 번의 호출로 responsibility_hypotheses + project_intent + user_stories 반환 */
export interface Step2And3CombinedResult {
  responsibility_hypotheses: Step2Result['responsibility_hypotheses'];
  project_intent: Step3Result['project_intent'];
  user_stories: Step3Result['user_stories'];
}

export type Step3Input = { project: Project; analysisResult: AnalysisResult };

/** Step3 AI 응답: 프로젝트 의도 + 사용자 스토리(related_paths = 폴더·파일 경로) */
export interface Step3Result {
  project_intent: {
    overview: string;
    purpose: string;
    architectural_tendencies: string;
    key_features: string[];
    technology_stack: Record<string, string[]>;
    confidence: 'low' | 'medium' | 'high';
  };
  user_stories: Array<{
    story: string;
    related_paths: string[];
    rationale: string;
  }>;
}

/** Step3(코드요약) 입력 */
export type Step3CodeSummaryInput = {
  project: Project;
  analysisResult: AnalysisResult;
  /** Step1 주요 파일 경로 -> 소스코드 내용 */
  fileContents: Record<string, string>;
};

/** Step3(코드요약) AI 응답: 파일별 코드 설명 (마크다운) */
export interface Step3CodeSummaryResult {
  file_summaries: Array<{
    file_path: string;
    markdown_content: string;
  }>;
}

export interface AiClientRequest {
  userPrompt: string;
  systemPrompt: string;
}

export interface PromptResponse {
  userPrompt: string;
  systemPrompt: string;
}
