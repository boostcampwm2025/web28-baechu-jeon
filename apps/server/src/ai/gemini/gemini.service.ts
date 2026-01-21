import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
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

  async callGeminiAPI(userPrompt: string, systemPrompt: string) {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: userPrompt,
      config: {
        // thinkingConfig: {
        //   thinkingBudget: 0, // Turn thinking OFF
        //   // thinkingBudget: 1024 // Turn thinking ON with specific token budget
        // },
        systemInstruction: systemPrompt,
        // temperature: 0.2,
        // maxOutputTokens: 512,
        // topK: 40,
        // topP: 0.8,
      },
    });
    console.log(response);
    return response;
  }
}
