import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get, HttpCode, Param, Post, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { AnalysesService } from './analyses.service';
import { Observable } from 'rxjs';
import { SseService } from '../sse/sse.service';

@Controller('analyses')
export class AnalysesController {
  constructor(
    @InjectQueue('analyses') private readonly analysisQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
    private readonly analysesService: AnalysesService,
    private readonly sseService: SseService,
  ) {}

  @Post(':projectId')
  @HttpCode(202)
  async requestAnalysis(@Param('projectId') projectId: string) {
    const analysisId = uuidv4();

    await this.analysisQueue.add('run-analysis', {
      analysisId,
      projectId,
    });

    return { analysisId, status: 'pending' };
  }

  @Get(':analysisId/status')
  async getAnalysisStatus(@Param('analysisId') analysisId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.analysesService.getStatus(analysisId);
  }

  @Get(':analysisId/result')
  async getAnalysisResult(
    @Param('analysisId') analysisId: string,
  ): Promise<any> {
    return this.analysesService.getResult(analysisId);
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
