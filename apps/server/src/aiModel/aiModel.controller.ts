import { Controller, Post, Body } from '@nestjs/common';
import { ClovaProvider } from './providers/clova/clova.provider';
import { GeminiProvider } from './providers/gemini/gemini.provider';
import type { AIAnalysisRequest } from './types/ai-request.types';

@Controller('ai-model')
export class AiModelController {
  constructor(
    private readonly clovaProvider: ClovaProvider,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  /**
   * Clova API 테스트 엔드포인트
   * @param request 분석 요청 데이터
   * @returns Clova API 응답
   */
  @Post('test/clova')
  async testClova(@Body() request: AIAnalysisRequest) {
    return await this.clovaProvider.analyze(request);
  }

  /**
   * Gemini API 테스트 엔드포인트
   * @param request 분석 요청 데이터
   * @returns Gemini API 응답
   */
  @Post('test/gemini')
  async testGemini(@Body() request: AIAnalysisRequest) {
    return await this.geminiProvider.analyze(request);
  }
}
