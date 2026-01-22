import { AnalysisResult } from '@prisma/client/edge';

// TODO: AnalysisResult 타입 검토하기

export interface AnalysisRequest {
  projectId: string;
  step: number;
  analysisResult?: AnalysisResult;
}

export interface AnalysisResponse {
  result: any;
}

export interface AiProvider {
  getResult(input: AnalysisRequest): Promise<AnalysisResponse>;
}
