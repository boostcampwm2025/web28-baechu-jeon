import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from 'src/ai/gemini/gemini.service';
import { PipelineContext } from './pipeline.context';
import { AnalysisEmitter } from '../events/analysis.emitter';
import { AnalysisStep } from '../analysis.events';

// TODO: 에러 핸들링 추가: 한 단계에서 에러가 나면 context에 에러 상태를 기록하고 작업을 중단하거나 >>재시도하는 로직<<
@Injectable()
export class PipelineRunner {
  private readonly logger = new Logger(PipelineRunner.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly emitter: AnalysisEmitter,
  ) {}

  private async emitStep(
    analysisId: string,
    step: AnalysisStep,
    type: 'STARTED' | 'COMPLETED',
    progress: number,
    result?: any,
  ): Promise<void> {
    const message = type === 'STARTED' ? `${step} 시작...` : `${step} 완료!`;

    await this.emitter.emitStepStatus(
      { analysisId, step, progress, message },
      type,
      result,
    );
  }

  async run(context: PipelineContext) {
    const { analysisId, projectId } = context;

    try {
      // STEP 1
      if (context.step1) {
        this.logger.log(`[${analysisId}] Step 1 이미 완료됨. 스킵.`);
        await this.emitStep(
          analysisId,
          'STEP1_GROUPING',
          'COMPLETED',
          30,
          context.step1,
        );
      } else {
        await this.emitStep(analysisId, 'STEP1_GROUPING', 'STARTED', 10);
        const step1 = await this.geminiService.getResult({
          projectId,
          step: 1,
        });

        context.step1 = step1.result;

        await this.emitStep(
          analysisId,
          'STEP1_GROUPING',
          'COMPLETED',
          30,
          context.step1,
        );
      }

      // STEP 2
      if (context.step2) {
        this.logger.log(`[${analysisId}] Step 2 이미 완료됨. 스킵.`);
        await this.emitStep(
          analysisId,
          'STEP2_HYPOTHESIS',
          'COMPLETED',
          60,
          context.step2,
        );
      } else {
        await this.emitStep(analysisId, 'STEP2_HYPOTHESIS', 'STARTED', 40);
        if (!context.step1) throw new Error('Step 1 result missing');

        const step2 = await this.geminiService.getResult({
          projectId,
          step: 2,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          analysisResult: { step1: context.step1 } as any,
        });

        context.step2 = step2.result;
        await this.emitStep(
          analysisId,
          'STEP2_HYPOTHESIS',
          'COMPLETED',
          60,
          context.step2,
        );
      }

      // STEP 3
      await this.emitStep(analysisId, 'STEP3_INTENT', 'STARTED', 70);

      if (!context.step1 || !context.step2)
        throw new Error('Previous results missing');

      const step3 = await this.geminiService.getResult({
        projectId,
        step: 3,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        analysisResult: { step1: context.step1, step2: context.step2 } as any,
      });

      context.step3 = step3.result;

      await this.emitStep(
        analysisId,
        'STEP3_INTENT',
        'COMPLETED',
        90,
        context.step3,
      );

      // 전체 완료
      await this.emitter.emitCompleted({
        analysisId,
        completedAt: new Date(),
      });
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Pipeline failed at ${analysisId}: ${err.message}`);
      await this.emitter.emitFailed({
        analysisId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        reason: err.message,
      });
      throw err;
    }
  }
}
