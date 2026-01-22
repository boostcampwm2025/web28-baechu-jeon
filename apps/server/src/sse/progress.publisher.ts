import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { analysisEventBus } from '../analyses/analysis.emitter';
import {
  AnalysisEvent,
  AnalysisStepEventPayload,
  AnalysisCompletedPayload,
  AnalysisFailedPayload,
} from '../analyses/analysis.events';

@Injectable()
export class ProgressPublisher {
  // 각 analysisId별로 Subject를 관리하는 Map
  private readonly streams = new Map<string, Subject<any>>();

  constructor() {
    // analysisEventBus 이벤트 구독
    this.subscribeToEvents();
  }

  /**
   * analysisEventBus의 모든 이벤트를 구독
   */
  private subscribeToEvents(): void {
    // STEP_STARTED 이벤트 구독
    analysisEventBus.on(
      AnalysisEvent.STEP_STARTED,
      (payload: AnalysisStepEventPayload) => {
        this.publishEvent(payload.analysisId, {
          type: 'step_started',
          step: payload.step,
          message: payload.message,
        });
      },
    );

    // STEP_COMPLETED 이벤트 구독
    analysisEventBus.on(
      AnalysisEvent.STEP_COMPLETED,
      (payload: AnalysisStepEventPayload) => {
        this.publishEvent(payload.analysisId, {
          type: 'step_completed',
          step: payload.step,
          message: payload.message,
        });
      },
    );

    // COMPLETED 이벤트 구독
    analysisEventBus.on(
      AnalysisEvent.COMPLETED,
      (payload: AnalysisCompletedPayload) => {
        this.publishEvent(payload.analysisId, {
          type: 'completed',
          step: payload.step,
          message: payload.message,
        });
        // 완료 후 스트림 정리
        this.completeStream(payload.analysisId);
      },
    );

    // FAILED 이벤트 구독
    analysisEventBus.on(
      AnalysisEvent.FAILED,
      (payload: AnalysisFailedPayload) => {
        this.publishEvent(payload.analysisId, {
          type: 'failed',
          step: payload.step,
          reason: payload.reason,
        });
        // 실패 후 스트림 정리
        this.completeStream(payload.analysisId);
      },
    );
  }

  /**
   * 특정 analysisId의 이벤트를 해당 스트림으로 전송
   */
  private publishEvent(analysisId: string, event: any): void {
    const stream = this.streams.get(analysisId);
    if (stream) {
      stream.next(event);
    }
  }

  /**
   * analysisId에 대한 새로운 스트림 생성
   */
  createStream(analysisId: string): Subject<any> {
    // 이미 존재하면 기존 스트림 반환
    if (this.streams.has(analysisId)) {
      return this.streams.get(analysisId)!;
    }

    // 새로운 Subject 생성
    const subject = new Subject<any>();
    this.streams.set(analysisId, subject);
    return subject;
  }

  /**
   * 스트림 완료 및 정리
   * 분석 완료/실패 시 또는 연결 종료 시 호출
   */
  private completeStream(analysisId: string): void {
    const stream = this.streams.get(analysisId);
    if (stream) {
      stream.complete();
      this.streams.delete(analysisId);
    }
  }
}
