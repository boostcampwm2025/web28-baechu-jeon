import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { PipelineRunner } from '../pipeline/pipeline.runner.js';
import { PipelineContext } from '../pipeline/pipeline.context.js';
import {
  analysisResultsKey,
  analysisStatusKey,
} from '../infra/analysis.redis.js';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Step3CodeSummaryResult } from '../../ai/types/ai.types.js';

// TODO: 최종 결과를 DB(Prisma)에 저장하기
// TODO: retry 로직 검토 및 추가

@Injectable()
export class AnalysesService {
  private readonly logger = new Logger(AnalysesService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly pipelineRunner: PipelineRunner,
    private readonly prisma: PrismaService,
  ) {}

  async processJob(jobData: { analysisId: string; projectId: string }) {
    const { analysisId, projectId } = jobData;
    const context = new PipelineContext(analysisId, projectId);

    this.logger.log(`[${analysisId}] 분석 작업 시작 (프로젝트: ${projectId})`);

    try {
      // Redis에 저장된 중간 결과가 있는지 확인
      const cachedResults = await this.redis.hgetall(
        analysisResultsKey(analysisId),
      );

      if (cachedResults) {
        // 저장된 결과가 있다면 Context에 넣음
        if (cachedResults['STEP1_FEATURE_ANALYSIS']) {
          context.step1 = JSON.parse(
            cachedResults['STEP1_FEATURE_ANALYSIS'],
          ) as unknown;
          this.logger.log(`[${analysisId}] Step 1 결과 복구 완료`);
        }
        // Step 2+3 통합 키 (가설+의도 한 덩어리)
        if (cachedResults['STEP2_HYPOTHESIS_AND_INTENT']) {
          const parsed = JSON.parse(
            cachedResults['STEP2_HYPOTHESIS_AND_INTENT'],
          ) as { step2?: unknown; step3?: unknown } | Record<string, unknown>;
          context.step2 =
            parsed?.step2 != null && parsed?.step3 != null
              ? { ...parsed.step2, ...parsed.step3 }
              : (parsed as Record<string, unknown>);
          this.logger.log(`[${analysisId}] Step 2 (가설+의도) 결과 복구 완료`);
        } else if (
          cachedResults['STEP2_HYPOTHESIS'] &&
          cachedResults['STEP3_INTENT']
        ) {
          const step2 = JSON.parse(cachedResults['STEP2_HYPOTHESIS']) as Record<string, unknown>;
          const step3 = JSON.parse(cachedResults['STEP3_INTENT']) as Record<string, unknown>;
          context.step2 = { ...step2, ...step3 };
          this.logger.log(`[${analysisId}] Step 2 결과 복구 완료 (이전 형식)`);
        }
        if (cachedResults['STEP3_CODE_SUMMARY']) {
          context.step3 = JSON.parse(
            cachedResults['STEP3_CODE_SUMMARY'],
          ) as unknown;
          this.logger.log(`[${analysisId}] Step 3 (코드요약) 결과 복구 완료`);
        }
      }

      // 파이프라인
      await this.pipelineRunner.run(context);

      // 최종 결과를 DB에 저장
      await this.saveResultToDatabase(analysisId, projectId, context);

      this.logger.log(`[${analysisId}] 모든 분석 완료 및 DB 저장`);

      // Redis 청소
      // await this.redis.del(analysisResultsKey(analysisId));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`[${analysisId}] 처리 중 치명적 오류: ${errorMessage}`);
      throw error;
    }
  }
  async getStatus(analysisId: string) {
    const status = await this.redis.get(analysisStatusKey(analysisId));
    if (!status) {
      return { status: 'not_found' };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(status);
  }

  async getResult(analysisId: string): Promise<Record<string, unknown>> {
    const results = await this.redis.hgetall(analysisResultsKey(analysisId));
    if (!results || Object.keys(results).length === 0) {
      return { error: '분석 결과를 찾을 수 없습니다.' };
    }

    const parsedResults: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(results)) {
      parsedResults[key] = JSON.parse(value) as unknown;
    }

    return parsedResults;
  }

  private async saveResultToDatabase(
    analysisId: string,
    projectId: string,
    context: PipelineContext,
  ): Promise<void> {
    try {
      // step2 = 가설+의도 통합, step3 = 코드요약
      await this.prisma.analysisResult.create({
        data: {
          id: analysisId,
          projectId,
          step1: (context.step1 || {}) as Prisma.InputJsonValue,
          step2: (context.step2 || {}) as Prisma.InputJsonValue,
          step3: (context.step3 || {}) as Prisma.InputJsonValue,
        },
      });

      const codeSummary = context.step3 as Step3CodeSummaryResult | undefined;
      if (codeSummary?.file_summaries?.length) {
        await this.prisma.fileSummary.createMany({
          data: codeSummary.file_summaries.map((s) => ({
            analysisResultId: analysisId,
            filePath: s.file_path,
            markdownContent: s.markdown_content,
          })),
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
