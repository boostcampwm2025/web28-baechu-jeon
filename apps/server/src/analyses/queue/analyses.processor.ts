import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AnalysesService } from '../analyses.service';
import { Job } from 'bullmq';

// Concurrency = 6: 두 모델 세마포어 합계 (Step1/3: 4, Step2: 2)
// Step2가 병목(~120k 토큰/요청)이므로 보수적으로 설정
// 분석 1건 = Step1 → Step2 → Step3 순차 실행, Step2에서 대기 발생 가능
@Processor('analyses', { concurrency: 6 })
export class AnalysesProcessor extends WorkerHost {
  constructor(private readonly analysesService: AnalysesService) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'run-analysis') {
      return this.analysesService.processJob(
        job.data as { analysisId: string; projectId: string },
      );
    }
  }
}
