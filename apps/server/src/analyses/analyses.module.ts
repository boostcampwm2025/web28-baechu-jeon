import { Module } from '@nestjs/common';
import { AnalysesController } from './analyses.controller.js';
import { AnalysesService } from './analyses.service.js';
import { redisProvider } from './redis.provider.js';
import { analysesQueueProvider } from './queue.provider.js';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analysis',
    }),
  ],
  controllers: [AnalysesController],
  providers: [AnalysesService, redisProvider],
})
export class AnalysesModule {}
