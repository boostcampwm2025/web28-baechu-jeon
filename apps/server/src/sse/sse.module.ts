import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';
import { ProgressPublisher } from './progress.publisher';

@Module({
  controllers: [SseController],
  providers: [SseService, ProgressPublisher],
  exports: [SseService, ProgressPublisher],
})
export class SseModule {}
