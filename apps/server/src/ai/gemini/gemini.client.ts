import { Injectable, Logger } from '@nestjs/common';
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { AiClientRequest } from '../types/ai.types';
import { geminiMetricsLogger } from '../../common/logger/winston.config';

// 모델 고정
const MODEL_FIXED = 'gemini-2.5-flash';

const getMaxTokens = (step: number) => {
  switch (step) {
    case 1:
      return 8192; // 목록 추출: 타이트하게 유지
    case 2:
      return 60000; // 분석: 상세 분석을 위해 64k까지 허용
    case 3:
      return 40960; // 요약: 40k면 충분 (로그상 최대 2만)
    default:
      return 16384;
  }
};

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateResponse(
    input: AiClientRequest,
  ): Promise<GenerateContentResponse> {
    const { projectId, userPrompt, systemPrompt, step, responseJsonSchema } =
      input;
    const stepLabel = step ? `Step${step}` : 'Unknown';
    const stepNum = step ?? 0;

    const modelName = stepNum === 2 ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    // 설정: 복잡한 분기 없이 기본 JSON 모드 및 스키마 적용
    const config = {
      systemInstruction: systemPrompt,
      temperature: 0, // 분석용이라 낮게 설정
      // topK: 40,
      // topP: 0.8,
      responseMimeType: 'application/json' as const,
      // maxOutputTokens: 60000, // Flash 2.5의 넉넉한 출력 한도 활용
      maxOutputTokens: getMaxTokens(stepNum),
      // thinkingConfig: {
      //   // Step 2일 때는 2048 토큰 정도 고민하게 하고, 나머지는 0(즉시 응답)이나 낮게 설정
      //   thinkingBudget: stepNum === 2 ? 2048 : 0, //4096
      // },
      ...(responseJsonSchema && { responseJsonSchema }),
    };

    this.logger.debug(`[Gemini 요청 시작] ${stepLabel} | 모델: ${modelName}`);
    const startTime = Date.now();

    // API 호출 (Retry, Semaphore, Try-Catch 제거)
    // 에러 발생 시 NestJS 필터로 전파되도록 둠
    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config,
    });

    const responseTimeMs = Date.now() - startTime;

    // 토큰 사용량 측정
    const usage = response.usageMetadata;
    const inputTokens = usage?.promptTokenCount ?? 0;
    const outputTokens = usage?.candidatesTokenCount ?? 0;
    const totalTokens = usage?.totalTokenCount ?? 0;

    // 콘솔 로그: 실시간 확인용
    this.logger.log(
      `[Gemini 토큰 측정] ${stepLabel} | 입력: ${inputTokens} | 출력: ${outputTokens} | 총: ${totalTokens} | 시간: ${responseTimeMs}ms`,
    );

    // CSV 로그: 데이터 분석용 (엑셀로 긁어서 보기 위함)
    // format: Step,Input,Output,Total,Time,Model,Success
    geminiMetricsLogger.info(
      `${projectId},${stepLabel},${inputTokens},${outputTokens},${totalTokens},${responseTimeMs},${modelName},true`,
    );

    return response;
  }
}
