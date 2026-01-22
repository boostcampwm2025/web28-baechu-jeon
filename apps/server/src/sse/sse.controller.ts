import { Controller, Get, Param, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService } from './sse.service';

@Controller('analyses')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  /**
   * 분석 진행 상태 SSE 스트림
   * @param analysisId 분석 ID
   * @returns Server-Sent Events 스트림
   */
  @Get(':analysisId/events')
  @Sse()
  streamAnalysisEvents(
    @Param('analysisId') analysisId: string,
  ): Observable<{ data: any }> {
    return this.sseService.getAnalysisStream(analysisId);
  }
}
