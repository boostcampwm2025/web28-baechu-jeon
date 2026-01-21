import { AnalysisResult } from '@prisma/client/edge';

export interface AnalysisRequest {
  projectId: string;
  step: number;
  analysisResult?: AnalysisResult;
}

export interface AnalysisResponse {
  content: string;
}

export interface AiProvider {
  getResult(input: AnalysisRequest): Promise<AnalysisResponse>;
}
