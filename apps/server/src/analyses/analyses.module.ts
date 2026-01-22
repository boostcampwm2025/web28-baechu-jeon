import { Module } from '@nestjs/common';
import { AnalysesController } from './analyses.controller.js';
import { AnalysesService } from './analyses.service.js';
import { redisProvider } from './redis.provider.js';
import { BullModule } from '@nestjs/bullmq';
import { AnalysesProcessor } from './analyses.processor.js';
import { PipelineRunner } from './pipeline/pipeline.runner.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analyses',
    }),
  ],
  controllers: [AnalysesController],
  providers: [
    AnalysesService,
    redisProvider,
    AnalysesProcessor,
    PipelineRunner,
  ],
})
export class AnalysesModule {}
