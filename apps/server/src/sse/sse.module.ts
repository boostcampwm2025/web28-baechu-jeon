import { Module } from '@nestjs/common';
import { SseService } from './sse.service';
import { ProgressPublisher } from './progress.publisher';

@Module({
  providers: [SseService, ProgressPublisher],
  exports: [SseService, ProgressPublisher],
})
export class SseModule {}
