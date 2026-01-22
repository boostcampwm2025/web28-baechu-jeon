export class PipelineContext {
  constructor(
    public readonly analysisId: string,
    public readonly projectId: string,
  ) {}

  step1?: unknown;
  step2?: unknown;
  step3?: unknown;
}
