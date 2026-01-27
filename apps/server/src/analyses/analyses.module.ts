import { Module } from '@nestjs/common';
import { AnalysesController } from './analyses.controller.js';
import { AnalysesService } from './events/analyses.service.js';
import { redisProvider } from './infra/redis.provider.js';
import { BullModule } from '@nestjs/bullmq';
import { AnalysesProcessor } from './queue/analyses.processor.js';
import { PipelineRunner } from './pipeline/pipeline.runner.js';
import { AiModule } from '../ai/ai.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AnalysisEmitter } from './events/analysis.emitter.js';
import { SseModule } from '../sse/sse.module';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analyses',
    }),
    AiModule,
    EventEmitterModule.forRoot(),
    SseModule,
    PrismaModule,
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
