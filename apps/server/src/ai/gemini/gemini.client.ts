import { Injectable, Logger } from '@nestjs/common';
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { AiClientRequest } from '../types/ai.types';
import { geminiMetricsLogger } from '../../common/logger/winston.config';

/**
 * 간단한 세마포어 구현: Gemini API 동시 호출 수 제한
 */
class Semaphore {
  private current = 0;
  private queue: (() => void)[] = [];

  constructor(private readonly max: number) {}

  async acquire(): Promise<void> {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    return new Promise((resolve) => {
      this.queue.push(() => {
        this.current++;
        resolve();
      });
    });
  }

  release(): void {
    this.current--;
    const next = this.queue.shift();
    if (next) next();
  }
}

// TODO: input 타입 처리하기
// TODO: 발생할 수 있는 에러 예외처리하기
// TODO: usageMetadata 정보 추가하기 (GenerateContentResponse 확인)

// Gemini API 동시 호출 제한 (모델별 세마포어)
// TPM 기반 계산: Step2는 요청당 ~120k 토큰으로 가장 무거움
// TPM 1M 기준, Step2 동시 2개 = 240k/batch, 안전 마진 확보
const geminiSemaphoreFlash25 = new Semaphore(4); // gemini-2.5-flash용 (Step 1, 3)
const geminiSemaphoreStep2 = new Semaphore(2); // gemini-3.0-flash용 (Step 2) - TPM 병목 방지

// 모델 설정
const MODEL_FLASH_25 = 'gemini-2.5-flash';
const MODEL_FLASH_STEP2 = 'gemini-3.0-flash'; // Step 2 전용 (별도 TPM 한도 활용)

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly ai: GoogleGenAI;
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly retryableStatusCodes: number[];

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey)
      throw new Error('환경변수에 GEMINI_API_KEY가 정의되지 않았습니다.');

    this.maxRetries = this.configService.get<number>('GEMINI_MAX_RETRIES') || 5;
    this.baseDelay =
      this.configService.get<number>('GEMINI_BASE_DELAY') || 1000;
    this.retryableStatusCodes = [429, 500, 502, 503, 504];
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Step에 따라 적절한 모델과 세마포어를 선택
   * - Step 1, 3: gemini-2.5-flash
   * - Step 2: gemini-2.0-flash (별도 TPM 한도 활용)
   */
  private getModelConfig(step?: number): {
    modelName: string;
    semaphore: Semaphore;
  } {
    if (step === 2) {
      return { modelName: MODEL_FLASH_STEP2, semaphore: geminiSemaphoreStep2 };
    }
    return { modelName: MODEL_FLASH_25, semaphore: geminiSemaphoreFlash25 };
  }

  async generateResponse(
    input: AiClientRequest,
  ): Promise<GenerateContentResponse> {
    const { userPrompt, systemPrompt, step } = input;
    const { modelName, semaphore } = this.getModelConfig(step);

    // 세마포어로 동시 호출 제한
    await semaphore.acquire();
    this.logger.debug(`Gemini 세마포어 획득 (${modelName})`);

    try {
      return await this.executeWithRetry(
        userPrompt,
        systemPrompt,
        step,
        modelName,
      );
    } finally {
      semaphore.release();
      this.logger.debug(`Gemini 세마포어 해제 (${modelName})`);
    }
  }

  private async executeWithRetry(
    userPrompt: string,
    systemPrompt: string,
    step?: number,
    modelName?: string,
  ): Promise<GenerateContentResponse> {
    const model = modelName || MODEL_FLASH_25;

    // Step3은 마크다운+코드 블록 포함으로 JSON 깨질 위험 → text/plain 사용
    const responseMimeType = step === 3 ? 'text/plain' : 'application/json';

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await this.ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            // 구조화된 JSON 출력용: 낮은 랜덤성으로 스키마 준수·일관성 우선
            temperature: 0.2,
            topK: 40,
            topP: 0.85,
            responseMimeType,
            maxOutputTokens: 60000, // step3(코드요약) 다수 파일 시 마크다운 길이 대비 (잘림 방지)
          },
        });
        const responseTimeMs = Date.now() - startTime;

        // 토큰 사용량 로깅
        const usage = response.usageMetadata;
        const stepLabel = step ? `Step${step}` : 'Unknown';
        const inputTokens = usage?.promptTokenCount ?? 0;
        const outputTokens = usage?.candidatesTokenCount ?? 0;
        const totalTokens = usage?.totalTokenCount ?? 0;

        // 콘솔 로그 (기존)
        this.logger.log(
          `[Gemini 토큰] ${stepLabel} | 모델: ${model} | 입력: ${inputTokens} | 출력: ${outputTokens} | 총: ${totalTokens} | 응답시간: ${responseTimeMs}ms`,
        );

        // CSV 파일 로그 (분석용)
        geminiMetricsLogger.info(
          `${stepLabel},${inputTokens},${outputTokens},${totalTokens},${responseTimeMs},${model},true`,
        );

        // 성공하면 응답 반환
        if (attempt > 0) {
          this.logger.log(`Gemini API 호출 성공 (${attempt + 1}번째 시도)`);
        }
        return response;
      } catch (error: unknown) {
        const isLastAttempt = attempt === this.maxRetries;
        const shouldRetry = this.shouldRetry(error);

        if (isLastAttempt || !shouldRetry) {
          // 실패 시에도 메트릭 기록
          const stepLabel = step ? `Step${step}` : 'Unknown';
          geminiMetricsLogger.info(`${stepLabel},0,0,0,0,${model},false`);

          this.logger.error(
            `Gemini API 호출 실패 (최종 실패, ${attempt + 1}/${this.maxRetries + 1}번째 시도, 모델: ${model})`,
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
