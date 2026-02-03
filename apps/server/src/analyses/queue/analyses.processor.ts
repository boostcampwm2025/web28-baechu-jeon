import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AnalysesService } from '../analyses.service';
import { Job } from 'bullmq';
import { RetryableAnalysisError } from 'src/ai/gemini/gemini.client';
import { AnalysisEmitter } from '../events/analysis.emitter';

// Concurrency = 15: Step2 병목(6개) 고려
// Step1/3은 12개, Step2는 6개로 제한
@Processor('analyses', { concurrency: 15 })
export class AnalysesProcessor extends WorkerHost {
  constructor(
    private readonly analysesService: AnalysesService,
    private readonly emitter: AnalysisEmitter,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'run-analysis') {
      try {
        return await this.analysesService.processJob(
          job.data as { analysisId: string; projectId: string },
        );
      } catch (err: unknown) {
        // 429 등 TPM 초과: BullMQ의 backoff/retry 옵션에 따라 재시도 (여기서 throw만)
        if (err instanceof RetryableAnalysisError) {
          void job.log('429/TPM 초과: job-level delay retry');
          throw err;
        }
        // 6번째 재시도(실패 5번 후 6번째 실행)일 때 에러 핸들링 추가
        if (job.attemptsMade === 5) {
          // 타입 세이프하게 접근
          const data = job.data as { analysisId?: string };
          const analysisId = data.analysisId ?? 'unknown';
          const errorMessage =
            typeof err === 'object' &&
            err &&
            'message' in err &&
            typeof err.message === 'string'
              ? err.message
              : String(err);

          console.error(`Pipeline failed at ${analysisId}: ${errorMessage}`);

          await this.emitter.emitFailed({
            analysisId,
            reason:
              '죄송합니다. Gemini 서버의 일시적인 오류로 인해 분석에 실패했습니다. 메인화면으로 돌아가서 다시 시도해 주세요.',
          });
        }
        throw err;
      }
    }
  }
}
