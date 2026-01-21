export interface AnalysisRequest {
  userPrompt: string;
  systemPrompt: string;
  projectId: string;
}

export interface AnalysisResponse {
  content: string;
}

export interface AiProvider {
  getResult(input: AnalysisRequest): Promise<AnalysisResponse>;
}
