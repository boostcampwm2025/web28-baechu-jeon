import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProgressPublisher } from './progress.publisher';

@Injectable()
export class SseService {
  constructor(private readonly progressPublisher: ProgressPublisher) {}

  /**
   * 분석 진행 상태 스트림 반환
   * @param analysisId 분석 ID
   * @returns 분석 진행 상태 Observable
   */
  getAnalysisStream(analysisId: string): Observable<{ data: any }> {
    // ProgressPublisher에서 해당 analysisId의 스트림 가져오기 또는 생성
    const stream = this.progressPublisher.createStream(analysisId);

    // Subject를 Observable로 변환하고 SSE 형식으로 변환
    return stream.asObservable().pipe(
      map((event) => ({
        data: JSON.stringify({
          analysisId,
          ...event,
        }),
      })),
    );
  }
}
