import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

// TODO: input 타입 처리하기
// TODO: 발생할 수 있는 에러 예외처리하기
// TODO: 단계 분석 구현 후 config 수정하기
// TODO: usageMetadata 정보 추가하기 (candidates?)

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

  async generateResponse(input: { userPrompt: string; systemPrompt: string }) {
    const { userPrompt, systemPrompt } = input;
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        // thinkingConfig: {
        //   thinkingBudget: 0, // Turn thinking OFF
        //   // thinkingBudget: 1024 // Turn thinking ON with specific token budget
        // },
        // temperature: 0.2,
        // maxOutputTokens: 512,
        // topK: 40,
        // topP: 0.8,
      },
    });
    return response;
  }
}
