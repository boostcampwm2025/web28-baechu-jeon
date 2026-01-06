import { Injectable } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';

@Injectable()
export class AnalysisService {
  // 분석 단계 목록 (업로드는 별도 API로 완료된 후 분석 시작)
  private readonly analysisSteps = [
    '폴더 구조 전처리 중...',
    '의존성 분석 중...',
    'AI 분석 중...',
    '결과 생성 중...',
  ];

  /**
   * 분석 상태 스트림 생성 (Mock 데이터)
   * 각 단계가 완료되면 다음 단계로 이동
   * 실제로는 분석 로직이 완료되면 emitStep()을 호출하여 프론트에 알림
   * @param projectId 프로젝트 ID
   * @returns 분석 상태 Observable
   */
  getStatusStream(projectId: string): Observable<{
    status: string;
    currentStep: string;
    projectId: string;
  }> {
    let stepIndex = 0;

    return interval(2000).pipe(
      map(() => {
        // 모든 단계 완료
        if (stepIndex >= this.analysisSteps.length) {
          return {
            status: 'completed',
            currentStep: '분석 완료',
            projectId,
          };
        }

        const currentStep = this.analysisSteps[stepIndex];
        stepIndex++;

        return {
          status: 'processing',
          currentStep,
          projectId,
        };
      }),
    );
  }
}
