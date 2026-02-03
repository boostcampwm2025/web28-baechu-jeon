import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AnalysesService } from '../analyses.service';
import { Job } from 'bullmq';

// Concurrency = 15: Step2 병목(6개) 고려
// Step1/3은 12개, Step2는 6개로 제한
@Processor('analyses', { concurrency: 15 })
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
