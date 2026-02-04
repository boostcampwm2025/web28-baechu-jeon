import { Module } from '@nestjs/common';
import { AnalysesController } from './analyses.controller.js';
import { AnalysesService } from './analyses.service.js';
import { redisProvider } from './infra/redis.provider.js';
import { BullModule } from '@nestjs/bullmq';
import {
  AnalysisStep13Processor,
  AnalysisStep2Processor,
} from './queue/analysis-step.processors.js';
import { PipelineRunner } from './pipeline/pipeline.runner.js';
import { AiModule } from '../ai/ai.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AnalysisEmitter } from './events/analysis.emitter.js';
import { SseModule } from '../sse/sse.module';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProjectsModule } from '../projects/projects.module.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analysis-step1-3',
    }),
    BullModule.registerQueue({
      name: 'analysis-step2',
    }),
    AiModule,
    EventEmitterModule.forRoot(),
    SseModule,
    PrismaModule,
    ProjectsModule,
  ],
  controllers: [AnalysesController],
  providers: [
    AnalysesService,
    redisProvider,
    AnalysisStep13Processor,
    AnalysisStep2Processor,
    PipelineRunner,
    AnalysisEmitter,
  ],
})
export class AnalysesModule {}
