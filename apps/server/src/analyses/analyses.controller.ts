import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get, HttpCode, Param, Post, Sse } from '@nestjs/common';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';
import { SseService } from '../sse/sse.service';

@Controller('analyses')
export class AnalysesController {
  constructor(
    @InjectQueue('analyses') private readonly analysisQueue: Queue,
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

  @Get(':analysisId/events')
  @Sse()
  streamAnalysisEvents(
    @Param('analysisId') analysisId: string,
  ): Observable<{ data: any }> {
    return this.sseService.getAnalysisStream(analysisId);
  }
}
