import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import {
  AnalysisCompletedPayload,
  AnalysisEvent,
  AnalysisFailedPayload,
  AnalysisStepEventPayload,
} from './analysis.events';
import { analysisResultsKey, analysisStatusKey } from './analysis.redis';

@Injectable()
export class AnalysisEmitter {
  constructor(
    private eventEmitter: EventEmitter2,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // Step 시작/종료 알림 + Redis 상태 저장
  async emitStepStatus(payload: AnalysisStepEventPayload, result?: any) {
    const { analysisId, step, progress } = payload;

    await this.redis.set(
      analysisStatusKey(analysisId),
      JSON.stringify({ step, progress, status: 'PROCESSING' }),
      'EX',
      3600 * 24,
    );

    if (result) {
      await this.redis.hset(
        analysisResultsKey(analysisId),
        step,
        JSON.stringify(result),
      );
    }

    this.eventEmitter.emit(AnalysisEvent.STEP_STARTED, payload);
  }

  // 최종 완료
  async emitCompleted(payload: AnalysisCompletedPayload) {
    await this.redis.set(
      analysisStatusKey(payload.analysisId),
      JSON.stringify({ status: 'COMPLETED', progress: 100 }),
      'EX',
      3600,
    );
    this.eventEmitter.emit(AnalysisEvent.COMPLETED, payload);
  }

  // 실패
  async emitFailed(payload: AnalysisFailedPayload) {
    await this.redis.set(
      analysisStatusKey(payload.analysisId),
      JSON.stringify({ status: 'FAILED', reason: payload.reason }),
      'EX',
      3600,
    );
    this.eventEmitter.emit(AnalysisEvent.FAILED, payload);
  }
}
