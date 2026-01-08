import { Injectable } from '@nestjs/common';
import { Observable, interval, map, take } from 'rxjs';

export enum AnalysisStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}

export enum AnalysisStep {
  PREPROCESSING = 'preprocessing',
  DEPENDENCY_ANALYSIS = 'dependency_analysis',
  AI_ANALYSIS = 'ai_analysis',
  RESULT_GENERATION = 'result_generation',
}

@Injectable()
export class AnalysisService {
  // 분석 단계 목록 (업로드는 별도 API로 완료된 후 분석 시작)
  private readonly analysisSteps = [
    AnalysisStep.PREPROCESSING,
    AnalysisStep.DEPENDENCY_ANALYSIS,
    AnalysisStep.AI_ANALYSIS,
    AnalysisStep.RESULT_GENERATION,
  ];

  /**
   * 분석 상태 스트림 생성 (Mock 데이터)
   * 각 단계가 완료되면 다음 단계로 이동
   * 실제로는 분석 로직이 완료되면 emitStep()을 호출하여 프론트에 알림
   * @param projectId 프로젝트 ID
   * @returns 분석 상태 Observable
   */
  getStatusStream(projectId: string): Observable<{
    status: AnalysisStatus;
    currentStep: AnalysisStep | null;
    projectId: string;
  }> {
    let stepIndex = 0;

    return interval(2000).pipe(
      take(this.analysisSteps.length + 1), // 모든 단계 + 완료 상태까지 emit 후 종료
      map(() => {
        // 모든 단계 완료
        if (stepIndex >= this.analysisSteps.length) {
          return {
            status: AnalysisStatus.COMPLETED,
            currentStep: null,
            projectId,
          };
        }

        const currentStep = this.analysisSteps[stepIndex];
        stepIndex++;

        return {
          status: AnalysisStatus.PROCESSING,
          currentStep,
          projectId,
        };
      }),
    );
  }
}
