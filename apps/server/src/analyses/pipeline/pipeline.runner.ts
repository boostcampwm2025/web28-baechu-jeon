import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from 'src/ai/gemini/gemini.service';
import { PipelineContext } from './pipeline.context';
import { AnalysisEmitter } from '../events/analysis.emitter';
import { AnalysisStep } from '../events/analysis.events';
import { ProjectsService } from 'src/projects/projects.service';
import { Step1Result } from 'src/ai/types/ai.types';
import { analysisMetricsLogger } from '../../common/logger/winston.config';

// TODO: 에러 핸들링 추가: 한 단계에서 에러가 나면 context에 에러 상태를 기록하고 작업을 중단하거나 >>재시도하는 로직<<
@Injectable()
export class PipelineRunner {
  private readonly logger = new Logger(PipelineRunner.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly emitter: AnalysisEmitter,
    private readonly projectsService: ProjectsService,
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
    const pipelineStartTime = Date.now();
    let geminiCallCount = 0;

    try {
      // STEP 1
      if (context.step1) {
        this.logger.log(`[${analysisId}] Step 1 이미 완료됨. 스킵.`);
        await this.emitStep(
          analysisId,
          'STEP1_FEATURE_ANALYSIS',
          'COMPLETED',
          30,
          context.step1,
        );
      } else {
        const step1StartTime = Date.now();
        await this.emitStep(
          analysisId,
          'STEP1_FEATURE_ANALYSIS',
          'STARTED',
          10,
        );
        const step1 = await this.geminiService.getResult({
          projectId,
          step: 1,
        });
        geminiCallCount++;

        context.step1 = step1.result;

        const step1Duration = Date.now() - step1StartTime;
        analysisMetricsLogger.info(
          `${analysisId},${projectId},Step1,${step1Duration},1,true`,
        );

        await this.emitStep(
          analysisId,
          'STEP1_FEATURE_ANALYSIS',
          'COMPLETED',
          33,
          context.step1,
        );
      }

      // STEP 2 (가설 + 의도·스토리 통합)
      const step2Merged = context.step2 as Record<string, unknown> | undefined;
      if (
        step2Merged?.project_intent != null ||
        step2Merged?.user_stories != null
      ) {
        this.logger.log(
          `[${analysisId}] Step 2 (가설+의도) 이미 완료됨. 스킵.`,
        );
        await this.emitStep(
          analysisId,
          'STEP2_HYPOTHESIS_AND_INTENT',
          'COMPLETED',
          66,
          context.step2,
        );
      } else {
        const step2StartTime = Date.now();
        await this.emitStep(
          analysisId,
          'STEP2_HYPOTHESIS_AND_INTENT',
          'STARTED',
          33,
        );
        if (!context.step1) throw new Error('Step 1 result missing');

        const additionalFileContents =
          await this.projectsService.extractMainFiles(
            projectId,
            context.step1 as Step1Result,
          );
        context.mainFileContents = additionalFileContents;

        const merged = await this.geminiService.getResult({
          projectId,
          step: 2,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          analysisResult: { step1: context.step1 } as any,
          additionalFileContents,
        });
        geminiCallCount++;

        const mergedResult = merged.result as {
          step2: { responsibility_hypotheses: unknown[] };
          step3: { project_intent: unknown; user_stories: unknown[] };
        };
        context.step2 = {
          ...mergedResult.step2,
          ...mergedResult.step3,
        };

        const step2Duration = Date.now() - step2StartTime;
        analysisMetricsLogger.info(
          `${analysisId},${projectId},Step2,${step2Duration},1,true`,
        );

        await this.emitStep(
          analysisId,
          'STEP2_HYPOTHESIS_AND_INTENT',
          'COMPLETED',
          66,
          context.step2,
        );
      }

      // STEP 3 (주요 파일 코드 설명)
      if (!context.mainFileContents && context.step1) {
        context.mainFileContents = await this.projectsService.extractMainFiles(
          projectId,
          context.step1 as Step1Result,
        );
      }

      const step3StartTime = Date.now();
      await this.emitStep(analysisId, 'STEP3_CODE_SUMMARY', 'STARTED', 66);

      if (!context.step1 || !context.step2)
        throw new Error('Previous results missing');
      if (!context.mainFileContents)
        throw new Error('주요 파일 소스코드를 찾을 수 없습니다.');

      const step3Result = await this.geminiService.getResult({
        projectId,
        step: 3,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        analysisResult: {
          step1: context.step1,
          step2: context.step2,
        } as any,
        fileContents: context.mainFileContents,
      });
      geminiCallCount++;

      context.step3 = step3Result.result;

      const step3Duration = Date.now() - step3StartTime;
      analysisMetricsLogger.info(
        `${analysisId},${projectId},Step3,${step3Duration},1,true`,
      );

      await this.emitStep(
        analysisId,
        'STEP3_CODE_SUMMARY',
        'COMPLETED',
        100,
        context.step3,
      );

      // 전체 파이프라인 완료 메트릭
      const totalDuration = Date.now() - pipelineStartTime;
      analysisMetricsLogger.info(
        `${analysisId},${projectId},Total,${totalDuration},${geminiCallCount},true`,
      );

      // 전체 완료
      await this.emitter.emitCompleted({
        analysisId,
        completedAt: new Date(),
      });

      // 분석 완료 후 NCloud ZIP 삭제
      try {
        await this.projectsService.deleteProjectZip(projectId);
        this.logger.log(`[${analysisId}] NCloud ZIP 삭제 완료: ${projectId}`);
      } catch (err) {
        // ZIP 삭제 실패는 로그만 남기고 분석 실패로 처리하지 않음
        this.logger.warn(
          `[${analysisId}] NCloud ZIP 삭제 실패: ${projectId}`,
          err,
        );
      }
    } catch (err: any) {
      // 실패 시에도 메트릭 기록
      const totalDuration = Date.now() - pipelineStartTime;
      analysisMetricsLogger.info(
        `${analysisId},${projectId},Total,${totalDuration},${geminiCallCount},false`,
      );

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
