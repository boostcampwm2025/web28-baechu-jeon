export class PipelineContext {
  constructor(
    public readonly analysisId: string,
    public readonly projectId: string,
  ) {}

  step1?: unknown;
  step2?: unknown;
  step3?: unknown;
  step4?: unknown;

  /** Step2에서 추출한 주요 파일 소스 (Step4에서 재사용) */
  mainFileContents?: Record<string, string>;
}
