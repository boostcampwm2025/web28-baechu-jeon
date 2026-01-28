import { AnalysisResult } from '@prisma/client/edge';

// TODO: AnalysisResult 타입 검토하기

export interface AnalysisRequest {
  projectId: string;
  step: number;
  analysisResult?: AnalysisResult;
  /** Step2용: 1단계에서 요청한 주요 파일 내용 (경로 -> 내용) */
  additionalFileContents?: Record<string, string>;
}

export interface AnalysisResponse {
  result: any;
}

export interface AiProvider {
  getResult(input: AnalysisRequest): Promise<AnalysisResponse>;
}
