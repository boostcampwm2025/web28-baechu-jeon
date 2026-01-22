import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SseService {
  /**
   * 분석 진행 상태 스트림 반환
   * @param analysisId 분석 ID
   * @returns 분석 진행 상태 Observable
   */
  getAnalysisStream(analysisId: string): Observable<{ data: any }> {
    // TODO: ProgressPublisher와 연동하여 실제 이벤트 스트림 반환

    return new Observable((subscriber) => {

      subscriber.complete();
    });
  }
}
