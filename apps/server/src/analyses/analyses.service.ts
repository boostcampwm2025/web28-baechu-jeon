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

  async processJob(jobData: { analysisId: string; projectId: string }) {
    const { analysisId, projectId } = jobData;
    const context = new PipelineContext(analysisId, projectId);
    const startMemory = process.memoryUsage();

    this.logger.log(`[${analysisId}] 분석 작업 시작 (프로젝트: ${projectId})`);
    this.logMemory(`[${analysisId}] 메모리 시작`, startMemory);

    try {
      // Redis에 저장된 중간 결과가 있는지 확인
      const cachedResults = await this.redis.hgetall(
        analysisResultsKey(analysisId),
      );

      // 저장된 결과가 있다면 Context에 넣음
      if (cachedResults) {
        if (cachedResults['STEP1_MAIN_FILE']) {
          try {
            context.step1 = JSON.parse(
              cachedResults['STEP1_MAIN_FILE'],
            ) as Record<string, unknown>;
          } catch {
            context.step1 = {};
          }
          this.logger.log(`[${String(analysisId)}] Step 1 결과 복구 완료`);
        }

        if (cachedResults['STEP2_HYPOTHESIS_AND_INTENT']) {
          try {
            context.step2 = JSON.parse(
              cachedResults['STEP2_HYPOTHESIS_AND_INTENT'],
            ) as Record<string, unknown>;
          } catch {
            context.step2 = {};
          }
          this.logger.log(`[${String(analysisId)}] Step2 결과 복구 완료`);
        }

        if (cachedResults['STEP3_CODE_SUMMARY']) {
          try {
            context.step3 = JSON.parse(
              cachedResults['STEP3_CODE_SUMMARY'],
            ) as Record<string, unknown>;
          } catch {
            context.step3 = {};
          }
          this.logger.log(`[${String(analysisId)}] Step 3 결과 복구 완료`);
        }
      }

      // 파이프라인
      await this.pipelineRunner.run(context);

      // 최종 결과를 DB에 저장
      await this.saveResultToDatabase(analysisId, projectId, context);

      // DB 저장 후 완료 이벤트 발송 (프론트엔드에서 시각화 요청 가능)
      await this.emitter.emitCompleted({
        analysisId,
        completedAt: new Date(),
      });

      this.logger.log(`[${analysisId}] 모든 분석 완료 및 DB 저장`);

      // Redis 청소
      await this.redis.del(analysisResultsKey(analysisId));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`[${analysisId}] 처리 중 오류 발생: ${errorMessage}`);
      throw error;
    } finally {
      const endMemory = process.memoryUsage();
      this.logMemory(`[${analysisId}] 메모리 종료`, endMemory);
      this.logMemoryDelta(
        `[${analysisId}] 메모리 변화`,
        startMemory,
        endMemory,
      );
    }
  }

  private logMemory(label: string, usage: NodeJS.MemoryUsage): void {
    this.logger.log(
      `${label} rss=${this.formatBytes(usage.rss)} ` +
        `heapUsed=${this.formatBytes(usage.heapUsed)} ` +
        `heapTotal=${this.formatBytes(usage.heapTotal)} ` +
        `external=${this.formatBytes(usage.external)} ` +
        `arrayBuffers=${this.formatBytes(usage.arrayBuffers)}`,
    );
  }

  private logMemoryDelta(
    label: string,
    start: NodeJS.MemoryUsage,
    end: NodeJS.MemoryUsage,
  ): void {
    const diff = {
      rss: end.rss - start.rss,
      heapUsed: end.heapUsed - start.heapUsed,
      heapTotal: end.heapTotal - start.heapTotal,
      external: end.external - start.external,
      arrayBuffers: end.arrayBuffers - start.arrayBuffers,
    };

    this.logger.log(
      `${label} rss=${this.formatBytes(diff.rss)} ` +
        `heapUsed=${this.formatBytes(diff.heapUsed)} ` +
        `heapTotal=${this.formatBytes(diff.heapTotal)} ` +
        `external=${this.formatBytes(diff.external)} ` +
        `arrayBuffers=${this.formatBytes(diff.arrayBuffers)}`,
    );
  }

  private formatBytes(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    const sign = mb >= 0 ? '' : '-';
    return `${sign}${Math.abs(mb).toFixed(2)}MB`;
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
