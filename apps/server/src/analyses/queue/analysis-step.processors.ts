import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AnalysesService } from '../analyses.service';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Processor('analysis-step1-3', { concurrency: 10 })
export class AnalysisStep13Processor extends WorkerHost {
  constructor(
    private readonly analysesService: AnalysesService,
    @InjectQueue('analysis-step2')
    private readonly step2Queue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'step1-3') return;
    const { analysisId, projectId } = job.data;
    await this.analysesService.runStep1And3({ analysisId, projectId });
    await this.step2Queue.add('step2', { analysisId, projectId });
  }
}

@Processor('analysis-step2', { concurrency: 2 })
export class AnalysisStep2Processor extends WorkerHost {
  constructor(private readonly analysesService: AnalysesService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'step2') return;
    const { analysisId, projectId } = job.data;
    await this.analysesService.runStep2({ analysisId, projectId });
  }
}
