import { Injectable, Logger } from '@nestjs/common';
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { AiClientRequest } from '../types/ai.types';

// TODO: input 타입 처리하기
// TODO: 발생할 수 있는 에러 예외처리하기
// TODO: 단계 분석 구현 후 config 수정하기
// TODO: usageMetadata 정보 추가하기 (GenerateContentResponse 확인)

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly ai: GoogleGenAI;
  private readonly modelName: string;
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly retryableStatusCodes: number[];

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey)
      throw new Error('환경변수에 GEMINI_API_KEY가 정의되지 않았습니다.');

    this.modelName =
      this.configService.get<string>('GEMINI_MODEL_NAME') || 'gemini-2.5-flash';
    this.maxRetries = this.configService.get<number>('GEMINI_MAX_RETRIES') || 5;
    this.baseDelay =
      this.configService.get<number>('GEMINI_BASE_DELAY') || 1000;
    this.retryableStatusCodes = [429, 500, 502, 503, 504];
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateResponse(
    input: AiClientRequest,
  ): Promise<GenerateContentResponse> {
    const { userPrompt, systemPrompt } = input;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            // 구조화된 JSON + 마크다운 문자열 출력용: 낮은 랜덤성으로 스키마 준수·일관성 우선
            temperature: 0.2,
            topK: 40,
            topP: 0.85,
            responseMimeType: 'application/json',
            maxOutputTokens: 60000, // step3(코드요약) 다수 파일 시 마크다운 길이 대비 (잘림 방지)
          },
        });

        // 성공하면 응답 반환
        if (attempt > 0) {
          this.logger.log(`Gemini API 호출 성공 (${attempt + 1}번째 시도)`);
        }
        return response;
      } catch (error: unknown) {
        const isLastAttempt = attempt === this.maxRetries;
        const shouldRetry = this.shouldRetry(error);

        if (isLastAttempt || !shouldRetry) {
          this.logger.error(
            `Gemini API 호출 실패 (최종 실패, ${attempt + 1}/${this.maxRetries + 1}번째 시도)`,
            this.getErrorMessage(error),
          );
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        this.logger.warn(
          `Gemini API 호출 실패, ${delay}ms 후 재시도 (${attempt + 1}/${this.maxRetries + 1}번째 시도): ${this.getErrorMessage(error)}`,
        );

        await this.sleep(delay);
      }
    }

    throw new Error('모든 재시도 실패');
  }

  private shouldRetry(error: unknown): boolean {
    // HTTP 상태 코드 확인
    if (
      this.hasStatus(error) &&
      this.retryableStatusCodes.includes(error.status)
    ) {
      return true;
    }

    // 네트워크 에러나 타임아웃 등
    if (
      this.hasCode(error, 'ECONNRESET') ||
      this.hasCode(error, 'ETIMEDOUT') ||
      this.hasCode(error, 'ENOTFOUND') ||
      this.hasMessageContaining(error, 'timeout') ||
      this.hasMessageContaining(error, 'network') ||
      this.hasMessageContaining(error, 'connection')
    ) {
      return true;
    }

    return false;
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * this.baseDelay;
    return Math.min(exponentialDelay + jitter, 30000); // 최대 30초
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }
    return String(error);
  }

  private hasStatus(error: unknown): error is { status: number } {
    return (
      error !== null &&
      typeof error === 'object' &&
      'status' in error &&
      typeof error.status === 'number'
    );
  }

  private hasCode(error: unknown, code: string): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === code
    );
  }

  private hasMessageContaining(error: unknown, text: string): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      error.message.includes(text)
    );
  }
}
