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

export interface AiClientRequest {
  userPrompt: string;
  systemPrompt: string;
}

export interface PromptResponse {
  userPrompt: string;
  systemPrompt: string;
}
