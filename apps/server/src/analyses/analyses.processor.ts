import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AnalysesService } from './analyses.service';
import { Job } from 'bullmq';

@Processor('analyses')
export class AnalysesProcess extends WorkerHost {
  constructor(private readonly analysesService: AnalysesService) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'run-analysis') {
      return this.analysesService.processJob(job.data);
    }
  }
}
