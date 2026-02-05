import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { PipelineRunner } from './pipeline/pipeline.runner.js';
import { PipelineContext } from './pipeline/pipeline.context.js';
import { Prisma } from '@prisma/client';
import { analysisResultsKey } from './infra/analysis.redis.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Step3Result } from '../ai/types/ai.types.js';
import { AnalysisEmitter } from './events/analysis.emitter.js';

@Injectable()
export class AnalysesService {
  private readonly logger = new Logger(AnalysesService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly pipelineRunner: PipelineRunner,
    private readonly prisma: PrismaService,
    private readonly emitter: AnalysisEmitter,
  ) {}

  async runStep1And3(data: { analysisId: string; projectId: string }) {
    const { analysisId, projectId } = data;
    const context = new PipelineContext(analysisId, projectId);

    this.logger.log(`[${analysisId}] Step1 & Step3 시작`);

    await this.hydrateContextFromRedis(analysisId, context);

    try {
      await this.pipelineRunner.runStep1(context);
      await this.pipelineRunner.runStep3(context);

      this.logger.log(`[${analysisId}] Step1 & Step3 완료`);
    } catch (error) {
      // 에러 상세 로그 남기기
      this.logger.error(
        `[${analysisId}] Step1 & Step3 실패: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.emitter.emitFailed({
        analysisId,
        reason:
          '죄송합니다. Gemini 서버의 일시적인 오류로 인해 분석에 실패했습니다. 메인화면으로 돌아가서 다시 시도해 주세요.',
      });
      throw error;
    }
  }

  async runStep2(data: { analysisId: string; projectId: string }) {
    const { analysisId, projectId } = data;
    const context = new PipelineContext(analysisId, projectId);

    this.logger.log(`[${analysisId}] Step2 시작`);

    await this.hydrateContextFromRedis(analysisId, context);

    try {
      await this.pipelineRunner.runStep2(context);
      await this.saveResultToDatabase(analysisId, projectId, context);
      this.emitter.emitCompleted({
        analysisId,
        completedAt: new Date(),
      });
      await this.redis.del(analysisResultsKey(analysisId));
      this.logger.log(`[${analysisId}] 분석 전체 완료`);
    } catch (error) {
      // 에러 상세 로그 남기기
      this.logger.error(
        `[${analysisId}] Step2 실패: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.emitter.emitFailed({
        analysisId,
        reason:
          '죄송합니다. Gemini 서버의 일시적인 오류로 인해 분석에 실패했습니다. 메인화면으로 돌아가서 다시 시도해 주세요.',
      });
      throw error;
    }
  }

  private async hydrateContextFromRedis(
    analysisId: string,
    context: PipelineContext,
  ) {
    const cached = await this.redis.hgetall(analysisResultsKey(analysisId));
    if (!cached || Object.keys(cached).length === 0) return;

    if (cached.STEP1_MAIN_FILE) {
      context.step1 = JSON.parse(cached.STEP1_MAIN_FILE);
    }
    if (cached.STEP2_HYPOTHESIS_AND_INTENT) {
      context.step2 = JSON.parse(cached.STEP2_HYPOTHESIS_AND_INTENT);
    }
    if (cached.STEP3_CODE_SUMMARY) {
      context.step3 = JSON.parse(cached.STEP3_CODE_SUMMARY);
    }

    this.logger.log(`[${analysisId}] Context Redis 복원 완료`);
  }

  private async saveResultToDatabase(
    analysisId: string,
    projectId: string,
    context: PipelineContext,
  ): Promise<void> {
    try {
      await this.prisma.analysisResult.create({
        data: {
          id: analysisId,
          projectId,
          step1: (context.step1 || {}) as Prisma.InputJsonValue,
          step2: (context.step2 || {}) as Prisma.InputJsonValue,
          step3: (context.step3 || {}) as Prisma.InputJsonValue,
        },
      });

      const codeSummary = context.step3 as Step3Result | undefined;
      if (codeSummary?.file_summaries?.length) {
        await this.prisma.fileSummary.createMany({
          data: codeSummary.file_summaries.map((s) => ({
            analysisResultId: analysisId,
            filePath: s.file_path,
            markdownContent: s.markdown_content,
          })),
          skipDuplicates: true,
        });
        this.logger.log(
          `[${analysisId}] FileSummary ${codeSummary.file_summaries.length}건 저장`,
        );
      }

      this.logger.log(`[${analysisId}] DB 저장 완료`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`[${analysisId}] DB 저장 실패: ${errorMessage}`);
      throw error;
    }
  }
}
