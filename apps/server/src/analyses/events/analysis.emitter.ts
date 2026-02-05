import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import {
  AnalysisCompletedPayload,
  AnalysisEvent,
  AnalysisFailedPayload,
  AnalysisStepEventPayload,
} from './analysis.events.js';
import { analysisResultsKey } from '../infra/analysis.redis.js';

@Injectable()
export class AnalysisEmitter {
  constructor(
    private eventEmitter: EventEmitter2,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // Step 시작/종료 알림 + Redis 상태 저장
  async emitStepStatus(
    payload: AnalysisStepEventPayload,
    type: 'STARTED' | 'COMPLETED',
    result?: any,
  ) {
    const { analysisId, step } = payload;

    // 상태 저장: 항상 PROCESSING (단계별 진행 상황은 step과 progress로 추적)
    // await this.redis.set(
    //   analysisStatusKey(analysisId),
    //   JSON.stringify({ step, progress, status: 'PROCESSING' }),
    //   'EX',
    //   3600 * 24,
    // );

    // 결과 저장: COMPLETED일 때만 저장 (명확성)
    if (type === 'COMPLETED' && result) {
      await this.redis.hset(
        analysisResultsKey(analysisId),
        step,
        JSON.stringify(result),
      );
    }

    // 이벤트 발생: type에 따라 적절한 이벤트 발생
    if (type === 'STARTED') {
      this.eventEmitter.emit(AnalysisEvent.STEP_STARTED, payload);
    } else {
      this.eventEmitter.emit(AnalysisEvent.STEP_COMPLETED, payload);
    }
  }

  // 최종 완료
  emitCompleted(payload: AnalysisCompletedPayload) {
    // await this.redis.set(
    //   analysisStatusKey(payload.analysisId),
    //   JSON.stringify({ status: 'COMPLETED', progress: 100 }),
    //   'EX',
    //   3600,
    // );
    this.eventEmitter.emit(AnalysisEvent.COMPLETED, payload);
  }

  // 실패
  emitFailed(payload: AnalysisFailedPayload) {
    // await this.redis.set(
    //   analysisStatusKey(payload.analysisId),
    //   JSON.stringify({ status: 'FAILED', reason: payload.reason }),
    //   'EX',
    //   3600,
    // );
    this.eventEmitter.emit(AnalysisEvent.FAILED, payload);
  }
}
