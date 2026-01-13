import { Controller, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * AI 분석 결과 조회
   * @param projectId 프로젝트 ID
   * @returns AI 분석 결과
   */
  @Get(':projectId/result')
  getAnalysisResult(@Param('projectId') projectId: string) {
    return this.aiService.getAnalysisResult(projectId);
  }
}
