import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
// TODO: 파이프라인 연결하면 주석 해제
// import { PipelineRunner } from './pipeline/pipeline.runner';

@Injectable()
export class AnalysesService {
  // TODO:  PipelineRunner 연결하면 주석 해제
  // constructor(private readonly pipelineRunner: PipelineRunner) {}

  /**
   * 분석 시작
   * @param projectId 프로젝트 ID
   * @returns 분석 ID 및 상태
   */
  startAnalysis(
    projectId: string,
  ): Promise<{ analysisId: string; status: string }> {
    // analysisId 생성
    const analysisId = randomUUID();

    // 비동기로 파이프라인 실행 (응답은 즉시 반환)
    void this.runPipelineAsync(projectId, analysisId).catch((error) => {
      console.error(
        `[AnalysesService] 파이프라인 실행 실패 ${projectId}:`,
        error,
      );
    });

    return Promise.resolve({
      analysisId,
      status: 'accepted',
    });
  }

  /**
   * 파이프라인을 비동기로 실행
   * @param projectId 프로젝트 ID
   * @param analysisId 분석 ID (파이프라인에서 이벤트 발생 시 사용)
   */
  private runPipelineAsync(
    projectId: string,
    analysisId: string,
  ): Promise<void> {
    // TODO: 파이프라인 연결할때 주석 해제
    // return this.pipelineRunner.run(projectId, analysisId);

    console.log(
      `[AnalysesService] Starting pipeline for project ${projectId}, analysis ${analysisId}`,
    );
    return Promise.resolve();
  }
}
