import { Controller, Post, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalysesService } from './analyses.service';

@Controller('analyses')
export class AnalysesController {
  constructor(private readonly analysesService: AnalysesService) {}

  /**
   * 분석 요청
   * @param projectId 프로젝트 ID
   * @returns 분석 ID 및 상태
   */
  @Post(':projectId')
  @HttpCode(HttpStatus.ACCEPTED)
  async startAnalysis(
    @Param('projectId') projectId: string,
  ): Promise<{ analysisId: string; status: string }> {
    const result = await this.analysesService.startAnalysis(projectId);
    return result;
  }
}
