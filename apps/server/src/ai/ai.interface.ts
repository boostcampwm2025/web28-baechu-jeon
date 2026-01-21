export interface AiRequest {
  userPrompt: string;
  systemPrompt: string;
}

export interface AiResponse {
  content: string;
}

export interface AiProvider {
  generate(input: AiRequest): Promise<AiResponse>;
}
