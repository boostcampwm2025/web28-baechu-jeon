import { Injectable, Logger } from '@nestjs/common';
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { AiClientRequest } from '../types/ai.types';
import { geminiMetricsLogger } from '../../common/logger/winston.config';

const getMaxTokens = (step: number) => {
  switch (step) {
    case 1:
      return 20000;
    case 2:
      return 60000;
    case 3:
      return 60000;
    default:
      return 16384;
  }
};

class Semaphore {
  private current = 0;
  private queue: (() => void)[] = [];

  constructor(private readonly max: number) {}

  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    await new Promise<void>((resolve) => this.queue.push(resolve));
    this.current++;
  }

  release() {
    this.current--;
    const next = this.queue.shift();
    if (next) next();
  }
}

const flashSemaphore = new Semaphore(8);
const proSemaphore = new Semaphore(2);

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateResponse(
    input: AiClientRequest,
  ): Promise<GenerateContentResponse> {
    const { projectId, userPrompt, systemPrompt, step } = input;
    const stepLabel = step ? `Step${step}` : 'Unknown';

    const modelName = step === 2 ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const semaphore = step === 2 ? proSemaphore : flashSemaphore;

    await semaphore.acquire();
    const startTime = Date.now();

    try {
      // 작은 jitter
      await new Promise((r) => setTimeout(r, Math.random() * 300));

      const response = await this.withRetry(
        () =>
          this.withTimeout(
            this.ai.models.generateContent({
              model: modelName,
              contents: userPrompt,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0,
                responseMimeType: 'application/json',
                maxOutputTokens: getMaxTokens(step ?? 0),
              },
            }),
            180000, // 180초 timeout
          ),
        stepLabel,
      );

      const responseTimeMs = Date.now() - startTime;

      const usage = response.usageMetadata;
      geminiMetricsLogger.info(
        `${projectId},${stepLabel},${usage?.promptTokenCount ?? 0},${usage?.candidatesTokenCount ?? 0},${usage?.totalTokenCount ?? 0},${responseTimeMs},${modelName},true`,
      );

      return response;
    } finally {
      semaphore.release();
    }
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    stepLabel: string,
  ): Promise<T> {
    const maxRetries = 5;
    const baseDelay = 2000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        const status = err?.status;
        const msg = err?.message?.toLowerCase() ?? '';
        const retryable =
          [429, 500, 502, 503, 504].includes(status) ||
          msg.includes('timeout') ||
          msg.includes('network');
        if (!retryable || attempt === maxRetries) {
          throw err;
        }

        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;

        this.logger.warn(
          `[${stepLabel}] ${status} 발생 → ${delay}ms 후 재시도 (${attempt + 1})`,
        );

        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw new Error('unreachable');
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timed out after ${ms}ms`));
      }, ms);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }
}
