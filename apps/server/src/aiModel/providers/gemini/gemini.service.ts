import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import {
  AIProviderApiError,
  AIProviderConfigError,
  AIProviderTimeoutError,
} from '../../types/ai-error.types';

/**
 * Gemini API 클라이언트 서비스 (SDK 사용)
 */
@Injectable()
export class GeminiService {
  private readonly apiKey: string;
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.model =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';

    if (!this.apiKey) {
      throw new AIProviderConfigError(
        'gemini',
        'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.',
      );
    }

    // SDK 초기화 (URL은 SDK가 자동으로 처리)
    // 환경변수 GEMINI_API_KEY가 설정되어 있으면 자동으로 사용됨
    this.ai = new GoogleGenAI({
      apiKey: this.apiKey,
    });
  }

  /**
   * Gemini API 호출
   * @param systemPrompt 시스템 프롬프트 (고정된 지시사항)
   * @param userPrompt 유저 프롬프트 (변하는 데이터)
   * @returns API 응답
   */
  async callAPI(systemPrompt: string, userPrompt: string): Promise<unknown> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          // 일관된 JSON 응답을 위한 생성 파라미터 설정
          temperature: 0.2, // 낮은 값으로 일관성 확보
          topK: 10, // 상위 10개 토큰만 고려
          topP: 0.3, // 누적 확률 30%까지 고려
        },
      });

      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        // 타임아웃 에러 처리
        if (error.message.includes('timeout')) {
          throw new AIProviderTimeoutError('gemini', 30000);
        }

        // API 에러 처리
        throw new AIProviderApiError('gemini', 500, error.message, error);
      }

      throw new AIProviderApiError(
        'gemini',
        500,
        'Unknown error',
        error instanceof Error ? error : undefined,
      );
    }
  }
}
