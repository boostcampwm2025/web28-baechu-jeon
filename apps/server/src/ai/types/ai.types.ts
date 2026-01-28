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
export type Step3Input = { project: Project; analysisResult: AnalysisResult };

/** Step3 AI 응답: 프로젝트 의도 + 사용자 스토리(유즈케이스별 관련 폴더 목록 포함) */
export interface Step3Result {
  project_intent: {
    overview: string;
    purpose: string;
    architectural_tendencies: string;
    key_features: string[];
    technology_stack: Record<string, string[]>;
    evidence: string[];
    confidence: 'low' | 'medium' | 'high';
  };
  user_stories: Array<{
    story: string;
    related_folders: string[];
    rationale: string;
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
