import { Injectable } from '@nestjs/common';
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { AiClientRequest } from '../types/ai.types';

// TODO: input 타입 처리하기
// TODO: 발생할 수 있는 에러 예외처리하기
// TODO: 단계 분석 구현 후 config 수정하기
// TODO: usageMetadata 정보 추가하기 (GenerateContentResponse 확인)

@Injectable()
export class GeminiClient {
  private readonly ai: GoogleGenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey)
      throw new Error('환경변수에 GEMINI_API_KEY가 정의되지 않았습니다.');

    this.modelName =
      this.configService.get<string>('GEMINI_MODEL_NAME') || 'gemini-2.5-flash';
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateResponse(
    input: AiClientRequest,
  ): Promise<GenerateContentResponse> {
    const { userPrompt, systemPrompt } = input;
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        // 구조화된 JSON + 마크다운 문자열 출력용: 낮은 랜덤성으로 스키마 준수·일관성 우선
        temperature: 0.2,
        topK: 40,
        topP: 0.85,
        maxOutputTokens: 16384, // step2/step4 마크다운 길이 대비 여유
      },
    });
    return response;
  }
}
