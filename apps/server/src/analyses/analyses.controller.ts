import {
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AnalysesService } from './analyses.service';
import { SseService } from '../sse/sse.service';

@Controller('analyses')
export class AnalysesController {
  constructor(
    private readonly analysesService: AnalysesService,
    private readonly sseService: SseService,
  ) {}

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

  /**
   * 분석 진행 상태 SSE 스트림
   * @param analysisId 분석 ID
   * @returns Server-Sent Events 스트림
   */
  @Get(':analysisId/events')
  @Sse()
  streamAnalysisEvents(
    @Param('analysisId') analysisId: string,
  ): Observable<{ data: any }> {
    return this.sseService.getAnalysisStream(analysisId);
  }
}
