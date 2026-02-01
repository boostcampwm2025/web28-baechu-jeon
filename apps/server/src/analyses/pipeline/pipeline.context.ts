export class PipelineContext {
  constructor(
    public readonly analysisId: string,
    public readonly projectId: string,
  ) {}

  step1?: unknown;
  /** 가설 + 의도·스토리 통합 (responsibility_hypotheses + project_intent + user_stories) */
  step2?: unknown;
  /** 코드 요약 (file_summaries) */
  step3?: unknown;

  /** Step2에서 추출한 주요 파일 소스 (Step3 코드요약에서 재사용) */
  mainFileContents?: Record<string, string>;
}
