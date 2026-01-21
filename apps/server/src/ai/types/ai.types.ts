import { AnalysisResult, Project } from '@prisma/client';

export type Step1Input = Project;
export type Step2Input = { project: Project; analysisResult: AnalysisResult };
export type Step3Input = { project: Project; analysisResult: AnalysisResult };

export interface AiClientRequest {
  userPrompt: string;
  systemPrompt: string;
}

export interface PromptResponse {
  userPrompt: string;
  systemPrompt: string;
}
