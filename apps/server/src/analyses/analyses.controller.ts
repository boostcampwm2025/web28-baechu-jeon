import { InjectQueue } from '@nestjs/bullmq';
import {
  Controller,
  HttpCode,
  Param,
  Post,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

@Controller('analyses')
export class AnalysesController {
  constructor(
    @InjectQueue('analyses') private readonly analysisQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
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

  @Sse(':projectId/events')
  streamEvents(@Param('projectId') projectId: string) {}
}
