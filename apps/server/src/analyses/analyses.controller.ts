import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get, HttpCode, Param, Post, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { AnalysesService } from './analyses.service';

@Controller('analyses')
export class AnalysesController {
  constructor(
    @InjectQueue('analyses') private readonly analysisQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
    private readonly analysesService: AnalysesService,
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
    return this.analysesService.getStatus(analysisId);
  }

  @Get(':analysisId/result')
  async getAnalysisResult(
    @Param('analysisId') analysisId: string,
  ): Promise<any> {
    return this.analysesService.getResult(analysisId);
  }

  @Sse(':projectId/events')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  streamEvents(@Param('projectId') _projectId: string) {}
}
