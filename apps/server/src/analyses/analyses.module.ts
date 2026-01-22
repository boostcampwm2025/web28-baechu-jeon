import { Module } from '@nestjs/common';
import { AnalysesController } from './analyses.controller.js';
import { AnalysesService } from './analyses.service.js';
import { redisProvider } from './redis.provider.js';
import { BullModule } from '@nestjs/bullmq';
import { AnalysesProcessor } from './analyses.processor.js';
import { PipelineRunner } from './pipeline/pipeline.runner.js';
import { AiModule } from '../ai/ai.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AnalysisEmitter } from './analysis.emitter.js';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analyses',
    }),
    AiModule,
    EventEmitterModule.forRoot(),
    SseModule,
  ],
  controllers: [AnalysesController],
  providers: [
    AnalysesService,
    redisProvider,
    AnalysesProcessor,
    PipelineRunner,
    AnalysisEmitter,
  ],
})
export class AnalysesModule {}
