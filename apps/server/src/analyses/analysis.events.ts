/**
 * STEP_STARTED
 * - 해당 step의 실행을 시작하기 직전에 emit
 * - 이 이벤트가 오면 UI는 "다음 단계로 넘어갔다"고 판단한다
 */

/**
 * STEP_COMPLETED
 * - 해당 step의 모든 처리가 정상적으로 끝난 직후 emit
 * - 다음 step 시작 전에 반드시 emit되어야 한다
 */

/**
 * COMPLETED
 * - 모든 분석 step이 성공적으로 종료된 직후 emit
 * - 이 이벤트 이후에는 더 이상 step 이벤트가 발생하지 않는다
 */

/**
 * FAILED
 * - step 실행 중 예외가 발생했을 때 emit
 * - 이 이벤트 이후 파이프라인은 중단된다
 */

export const AnalysisEvent = {
  STEP_STARTED: 'analysis.step.started',
  STEP_COMPLETED: 'analysis.step.completed',
  COMPLETED: 'analysis.completed',
  FAILED: 'analysis.failed',
} as const;

export type AnalysisStep =
  | 'STEP1_FEATURE_ANALYSIS'
  | 'STEP2_HYPOTHESIS_AND_INTENT'
  | 'STEP3_CODE_SUMMARY';

export interface AnalysisStepEventPayload {
  analysisId: string;
  step: AnalysisStep;
  progress: number;
  message?: string;
}

export interface AnalysisCompletedPayload {
  analysisId: string;
  completedAt: Date;
  message?: string;
}

// 예시1) 시간 제한 초과 등으로 인해 분석이 실패했을 때의 페이로드
// 예시2) 동일 step에서 5번 이상 재시도 후에도 실패하는 경우 등에 사용
export interface AnalysisFailedPayload {
  analysisId: string;
  step?: AnalysisStep;
  reason: string;
}
