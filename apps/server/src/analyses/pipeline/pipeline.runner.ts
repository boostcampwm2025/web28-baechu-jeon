import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from 'src/ai/gemini/gemini.service';
// import { RetryableAnalysisError } from 'src/ai/gemini/gemini.client';
import { PipelineContext } from './pipeline.context';
import { AnalysisEmitter } from '../events/analysis.emitter';
import { AnalysisStep } from '../events/analysis.events';
import { ProjectsService } from 'src/projects/projects.service';
import { Step1Result } from 'src/ai/types/ai.types';
import { AnalysisResult } from '@prisma/client/edge';
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
      // Step1
      if (context.step1) {
        this.logger.log(`[${analysisId}] Step1 이미 완료됨. 스킵.`);
        await this.emitStep(
          analysisId,
          'STEP1_MAIN_FILE',
          'COMPLETED',
          30,
          context.step1,
        );
      } else {
        const step1StartTime = Date.now();
        await this.emitStep(analysisId, 'STEP1_MAIN_FILE', 'STARTED', 10);

        // Step1 Gemini API 호출
        const step1Result = await this.geminiService.getResult({
          projectId,
          step: 1,
        });
        geminiCallCount++;
        context.step1 = step1Result.result;

        const step1Duration = Date.now() - step1StartTime;
        analysisMetricsLogger.info(
          `${analysisId},${projectId},Step1,${step1Duration},1,true`,
        );

        await this.emitStep(
          analysisId,
          'STEP1_MAIN_FILE',
          'COMPLETED',
          33,
          context.step1,
        );
      }

      if (
        !context.mainFileContents ||
        Object.keys(context.mainFileContents).length === 0
      ) {
        context.mainFileContents = await this.projectsService.extractMainFiles(
          projectId,
          context.step1 as Step1Result,
        );
      }

      // Step2, Step3 병렬 실행 준비
      if (!context.step1) throw new Error('Step1 결과가 존재하지 않습니다.');

      const fileCount = context.mainFileContents
        ? Object.keys(context.mainFileContents).length
        : 0;

      // Step2 Promise
      // const step2Promise = (async () => {
      if (context.step2) {
        this.logger.log(`[${analysisId}] Step2 이미 완료됨. 스킵.`);
        await this.emitStep(
          analysisId,
          'STEP2_HYPOTHESIS_AND_INTENT',
          'COMPLETED',
          50,
          context.step2,
        );
        return;
      }
      const step2StartTime = Date.now();
      await this.emitStep(
        analysisId,
        'STEP2_HYPOTHESIS_AND_INTENT',
        'STARTED',
        33,
      );

      // Step2 Gemini API 호출
      const step2Result = await this.geminiService.getResult({
        projectId,
        step: 2,
        analysisResult: context.step1 as AnalysisResult,
        additionalFileContents: context.mainFileContents,
      });
      geminiCallCount++;
      context.step2 = {
        ...step2Result.result.step21,
        ...step2Result.result.step22,
      };

      const step2Duration = Date.now() - step2StartTime;
      analysisMetricsLogger.info(
        `${analysisId},${projectId},Step2,${step2Duration},1,true`,
      );

      await this.emitStep(
        analysisId,
        'STEP2_HYPOTHESIS_AND_INTENT',
        'COMPLETED',
        50,
        context.step2,
      );
      // })();

      // Step3 Promise
      // const step3Promise = (async () => {
      if (context.step3) {
        this.logger.log(`[${analysisId}] Step3 이미 완료됨. 스킵.`);
        await this.emitStep(
          analysisId,
          'STEP3_CODE_SUMMARY',
          'COMPLETED',
          50,
          context.step3,
        );
        return;
      }
      const step3StartTime = Date.now();
      await this.emitStep(analysisId, 'STEP3_CODE_SUMMARY', 'STARTED', 33);

      if (fileCount === 0) {
        this.logger.warn(`[${analysisId}] Step3: 주요 파일 없음, 스킵`);
        context.step3 = { file_summaries: [] };
      } else {
        // Step3 Gemini API 호출
        const step3Result = await this.geminiService.getResult({
          projectId,
          step: 3,
          analysisResult: { step1: context.step1 } as AnalysisResult,
          fileContents: context.mainFileContents,
        });
        geminiCallCount++;
        context.step3 = step3Result.result;
      }

      const step3Duration = Date.now() - step3StartTime;
      analysisMetricsLogger.info(
        `${analysisId},${projectId},Step3,${step3Duration},${fileCount > 0 ? 1 : 0},true`,
      );

      await this.emitStep(
        analysisId,
        'STEP3_CODE_SUMMARY',
        'COMPLETED',
        100,
        context.step3,
      );
      // })();

      // Step2, Step3 병렬 실행
      // await Promise.all([step2Promise, step3Promise]);

      // 전체 파이프라인 완료 메트릭 기록
      const totalDuration = Date.now() - pipelineStartTime;
      analysisMetricsLogger.info(
        `${analysisId},${projectId},Total,${totalDuration},${geminiCallCount},true`,
      );

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

      // emitCompleted는 DB 저장 후 analyses.service.ts에서 호출
    } catch (err: any) {
      // 전체 파이프라인 실패 메트릭 기록
      const totalDuration = Date.now() - pipelineStartTime;
      analysisMetricsLogger.info(
        `${analysisId},${projectId},Total,${totalDuration},${geminiCallCount},false`,
      );

      // RetryableAnalysisError(429)면 job 레벨에서 재시도하도록 throw만 하고, 로그만 남김
      // if (err instanceof RetryableAnalysisError) {
      //   this.logger.warn(
      //     `Pipeline Step: Gemini 429/TPM 초과 - job 재시도 필요: ${err.message}`,
      //   );
      //   throw err;
      // }

      this.logger.error(`Pipeline failed at ${analysisId}: ${err.message}`);
      await this.emitter.emitFailed({
        analysisId,
        reason:
          '죄송합니다. Gemini 서버의 일시적인 오류로 인해 분석에 실패했습니다. 메인화면으로 돌아가서 다시 시도해 주세요.',
      });
      throw err;
    }
  }
}
