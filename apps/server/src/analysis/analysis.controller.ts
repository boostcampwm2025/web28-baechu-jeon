import { Controller, Param, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  /**
   * 분석 상태 SSE 스트림
   * @param projectId 프로젝트 ID
   * @returns Server-Sent Events 스트림
   */
  @Sse(':projectId/stream')
  streamAnalysisStatus(
    @Param('projectId') projectId: string,
  ): Observable<{ data: any }> {
    return this.analysisService
      .getStatusStream(projectId)
      .pipe(map((data) => ({ data })));
  }
}
