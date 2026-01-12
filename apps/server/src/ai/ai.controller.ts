import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ClovaProvider } from './providers/clova/clova.provider';
import { GeminiProvider } from './providers/gemini/gemini.provider';
import type { AIAnalysisRequest } from './types/ai-request.types';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly clovaProvider: ClovaProvider,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  /**
   * AI 분석 결과 조회
   * @param projectId 프로젝트 ID
   * @returns AI 분석 결과
   */
  @Get(':projectId/result')
  getAnalysisResult(@Param('projectId') projectId: string) {
    return this.aiService.getAnalysisResult(projectId);
  }

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
