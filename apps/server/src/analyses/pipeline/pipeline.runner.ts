import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from 'src/ai/gemini/gemini.service';
import { PipelineContext } from './pipeline.context';
import { AnalysisEmitter } from '../events/analysis.emitter';
import { AnalysisStep } from '../events/analysis.events';
import { ProjectsService } from 'src/projects/projects.service';
import { Step1Result } from 'src/ai/types/ai.types';
import { AnalysisResult } from '@prisma/client/edge';
import { analysisMetricsLogger } from '../../common/logger/winston.config';

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

  // Step1만 실행
  async runStep1(context: PipelineContext) {
    const { analysisId, projectId } = context;
    if (context.step1) {
      this.logger.log(`[${analysisId}] Step1 이미 완료됨. 스킵.`);
      await this.emitStep(
        analysisId,
        'STEP1_MAIN_FILE',
        'COMPLETED',
        30,
        context.step1,
      );
      return;
    }
    const step1StartTime = Date.now();
    await this.emitStep(analysisId, 'STEP1_MAIN_FILE', 'STARTED', 10);
    const step1Result = await this.geminiService.getResult({
      projectId,
      step: 1,
    });
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

  // Step2만 실행
  async runStep2(context: PipelineContext) {
    const { analysisId, projectId } = context;
    if (!context.step1) throw new Error('Step1 결과가 존재하지 않습니다.');
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
    if (
      !context.mainFileContents ||
      Object.keys(context.mainFileContents).length === 0
    ) {
      context.mainFileContents = await this.projectsService.extractMainFiles(
        projectId,
        context.step1 as Step1Result,
      );
    }
    const step2StartTime = Date.now();
    await this.emitStep(
      analysisId,
      'STEP2_HYPOTHESIS_AND_INTENT',
      'STARTED',
      33,
    );
    const step2Result = await this.geminiService.getResult({
      projectId,
      step: 2,
      analysisResult: context.step1 as AnalysisResult,
      additionalFileContents: context.mainFileContents,
    });
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
  }

  // Step3만 실행
  async runStep3(context: PipelineContext) {
    const { analysisId, projectId } = context;
    if (!context.step1) throw new Error('Step1 결과가 존재하지 않습니다.');
    if (
      !context.mainFileContents ||
      Object.keys(context.mainFileContents).length === 0
    ) {
      context.mainFileContents = await this.projectsService.extractMainFiles(
        projectId,
        context.step1 as Step1Result,
      );
    }
    if (context.step3) {
      this.logger.log(`[${analysisId}] Step3 이미 완료됨. 스킵.`);
      await this.emitStep(
        analysisId,
        'STEP3_CODE_SUMMARY',
        'COMPLETED',
        100,
        context.step3,
      );
      return;
    }
    const fileCount = context.mainFileContents
      ? Object.keys(context.mainFileContents).length
      : 0;
    const step3StartTime = Date.now();
    await this.emitStep(analysisId, 'STEP3_CODE_SUMMARY', 'STARTED', 33);
    if (fileCount === 0) {
      this.logger.warn(`[${analysisId}] Step3: 주요 파일 없음, 스킵`);
      context.step3 = { file_summaries: [] };
    } else {
      const step3Result = await this.geminiService.getResult({
        projectId,
        step: 3,
        analysisResult: { step1: context.step1 } as AnalysisResult,
        fileContents: context.mainFileContents,
      });
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
  }
}
