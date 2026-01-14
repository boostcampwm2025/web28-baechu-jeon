import { Controller, Get, Param, Sse, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnalysisService } from './analysis.service';
import { AnalysisResultRepository } from './repositories/analysis-result.repository';

@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly analysisResultRepository: AnalysisResultRepository,
  ) {}

  /**
   * 분석 상태 SSE 스트림
   * @param projectId 프로젝트 ID
   * @returns Server-Sent Events 스트림
   */
  @Sse(':projectId/stream')
  streamAnalysisStatus(
    @Param('projectId') projectId: string,
  ): Observable<{ data: any }> {
    return this.analysisService
      .getStatusStream(projectId)
      .pipe(map((data) => ({ data })));
  }

  /**
   * AI 분석 결과를 가져오는 엔드포인트
   * @param projectId 프로젝트 ID
   * @returns AI 분석 결과 JSON
   */
  @Get('result/:projectId/ai')
  async getAiAnalysisResult(@Param('projectId') projectId: string): Promise<any> {
    const analysisResult = await this.analysisResultRepository.findByProjectId(projectId);
    if (!analysisResult || !analysisResult.aiAnalysis) {
      throw new NotFoundException(`AI analysis result for project ${projectId} not found.`);
    }
    return analysisResult.aiAnalysis;
  }
}

