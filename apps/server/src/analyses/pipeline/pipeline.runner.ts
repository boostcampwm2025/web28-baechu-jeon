import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from 'src/ai/gemini/gemini.service';
import { PipelineContext } from './pipeline.context';
import { AnalysisEmitter } from '../analysis.emitter';
import { AnalysisStep } from '../analysis.events';

// TODO: analysisResult 타입 수정하기
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
  ) {
    const message = type === 'STARTED' ? `${step} 시작...` : `${step} 종료...`;
    this.emitter.emitStepStatus({
      analysisId,
      step,
      progress,
      message,
    });
  }

  async run(context: PipelineContext) {
    const { analysisId, projectId } = context;

    try {
      // STEP 1
      await this.emitStep(analysisId, 'STEP1_GROUPING', 'STARTED', 10);
      const step1 = await this.geminiService.getResult({
        projectId: context.projectId,
        step: 1,
      });
      context.step1 = step1.result;
      await this.emitStep(analysisId, 'STEP1_GROUPING', 'COMPLETED', 30);

      // STEP 2
      await this.emitStep(analysisId, 'STEP2_HYPOTHESIS', 'STARTED', 40);
      const step2 = await this.geminiService.getResult({
        projectId: context.projectId,
        step: 2,
        analysisResult: { step1: context.step1 } as any,
      });
      context.step2 = step2.result;
      await this.emitStep(analysisId, 'STEP2_HYPOTHESIS', 'COMPLETED', 60);

      // STEP 3
      await this.emitStep(analysisId, 'STEP3_INTENT', 'STARTED', 70);
      const step3 = await this.geminiService.getResult({
        projectId: context.projectId,
        step: 3,
        analysisResult: { step1: context.step1 } as any,
      });
      context.step3 = step3.result;
      await this.emitStep(analysisId, 'STEP3_INTENT', 'COMPLETED', 90);

      this.emitter.emitCompleted({
        analysisId,
        completedAt: new Date(),
      });
    } catch (err) {
      this.logger.error(`Pipeline failed at ${analysisId}: ${err.message}`);
      this.emitter.emitFailed({
        analysisId,
        reason: err.message,
      });
      throw err;
    }
  }
}
