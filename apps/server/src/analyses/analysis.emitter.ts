// import { EventEmitter } from 'events';
// export const analysisEventBus = new EventEmitter();

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AnalysisCompletedPayload,
  AnalysisEvent,
  AnalysisFailedPayload,
  AnalysisStepEventPayload,
} from './analysis.events';

@Injectable()
export class AnalysisEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  // Step 시작
  emitStepStatus(payload: AnalysisStepEventPayload) {
    this.eventEmitter.emit(AnalysisEvent.STEP_STARTED, payload);
  }

  // 최종 완료
  emitCompleted(payload: AnalysisCompletedPayload) {
    this.eventEmitter.emit(AnalysisEvent.COMPLETED, payload);
  }

  // 실패
  emitFailed(payload: AnalysisFailedPayload) {
    this.eventEmitter.emit(AnalysisEvent.FAILED, payload);
  }
}
