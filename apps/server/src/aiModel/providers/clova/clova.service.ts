import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  AIProviderApiError,
  AIProviderConfigError,
  AIProviderTimeoutError,
} from '../../types/ai-error.types';

/**
 * Clova API 클라이언트 서비스
 */
@Injectable()
export class ClovaService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('CLOVA_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('CLOVA_API_URL') || '';
    this.timeout = parseInt(
      this.configService.get<string>('CLOVA_TIMEOUT') || '30000',
      10,
    );

    if (!this.apiKey) {
      throw new AIProviderConfigError(
        'clova',
        'CLOVA_API_KEY 환경 변수가 설정되지 않았습니다.',
      );
    }

    if (!this.apiUrl) {
      throw new AIProviderConfigError(
        'clova',
        'CLOVA_API_URL 환경 변수가 설정되지 않았습니다.',
      );
    }
  }

  /**
   * Clova API 호출
   * @param systemPrompt 시스템 프롬프트 (고정된 지시사항)
   * @param userPrompt 유저 프롬프트 (변하는 데이터)
   * @returns API 응답
   */
  async callAPI(systemPrompt: string, userPrompt: string): Promise<unknown> {
    try {
      // 요청 ID 생성
      const requestId = `request-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              {
                role: 'user',
                content: userPrompt,
              },
            ],
            model: 'HCX-007',
            defaultParams: {
              maxCompletionTokens: 4096,
              temperature: 0,
              topP: 0.1,
              topK: 1,
              repetitionPenalty: 1,
              stop: [],
              thinking: { effort: 'medium' },
            },
            // TODO: defaultParams는 환경 변수나 설정으로 관리 필요
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'X-NCP-CLOVASTUDIO-REQUEST-ID': requestId,
              'Content-Type': 'application/json',
            },
            timeout: this.timeout,
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        // 타임아웃 에러 처리
        if (error.message.includes('timeout')) {
          throw new AIProviderTimeoutError('clova', this.timeout);
        }

        // HTTP 에러 처리
        if ('response' in error && typeof error.response === 'object') {
          const httpError = error as {
            response?: { status?: number; data?: unknown };
          };
          throw new AIProviderApiError(
            'clova',
            httpError.response?.status || 500,
            JSON.stringify(httpError.response?.data || 'Unknown error'),
            error,
          );
        }
      }

      throw new AIProviderApiError(
        'clova',
        500,
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error ? error : undefined,
      );
    }
  }
}
