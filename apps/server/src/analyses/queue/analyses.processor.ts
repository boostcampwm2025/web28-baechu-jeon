import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AnalysesService } from '../analyses.service';
import { Job } from 'bullmq';
// import { RetryableAnalysisError } from 'src/ai/gemini/gemini.client';

// Concurrency = 15: Step2 병목(6개) 고려
// Step1/3은 12개, Step2는 6개로 제한
@Processor('analyses', { concurrency: 15 })
export class AnalysesProcessor extends WorkerHost {
  constructor(private readonly analysesService: AnalysesService) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'run-analysis') {
      try {
        return await this.analysesService.processJob(
          job.data as { analysisId: string; projectId: string },
        );
      } catch (err) {
        // 429 등 TPM 초과: BullMQ의 backoff/retry 옵션에 따라 재시도 (여기서 throw만)
        // if (err instanceof RetryableAnalysisError) {
        //   job.log('429/TPM 초과: job-level delay retry');
        //   throw err;
        // }
        throw err;
      }
    }
  }
}
