import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { PipelineRunner } from './pipeline/pipeline.runner';
import { PipelineContext } from './pipeline/pipeline.context';
import { analysisResultsKey } from './analysis.redis';

// TODO: 최종 결과를 DB(Prisma)에 저장하기
// TODO: retry 로직 검토 및 추가

@Injectable()
export class AnalysesService {
  private readonly logger = new Logger(AnalysesService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly pipelineRunner: PipelineRunner,
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
        if (cachedResults['STEP1_GROUPING']) {
          context.step1 = JSON.parse(cachedResults['STEP1_GROUPING']);
          this.logger.log(`[${analysisId}] Step 1 결과 복구 완료`);
        }
        if (cachedResults['STEP2_HYPOTHESIS']) {
          context.step2 = JSON.parse(cachedResults['STEP2_HYPOTHESIS']);
          this.logger.log(`[${analysisId}] Step 2 결과 복구 완료`);
        }
      }

      // 파이프라인
      await this.pipelineRunner.run(context);

      this.logger.log(`[${analysisId}] 모든 분석 완료 및 DB 저장`);

      // Redis 청소
      // await this.redis.del(analysisResultsKey(analysisId));
    } catch (error) {
      this.logger.error(
        `[${analysisId}] 처리 중 치명적 오류: ${error.message}`,
      );
      throw error;
    }
  }

  async getResult(analysisId: string) {
    const results = await this.redis.hgetall(analysisResultsKey(analysisId));
    if (!results || Object.keys(results).length === 0) {
      return { error: '분석 결과를 찾을 수 없습니다.' };
    }

    const parsedResults: any = {};
    for (const [key, value] of Object.entries(results)) {
      parsedResults[key] = JSON.parse(value);
    }

    return parsedResults;
  }
}
