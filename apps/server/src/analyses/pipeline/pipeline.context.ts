export class PipelineContext {
  constructor(
    public readonly analysisId: string,
    public readonly projectId: string,
  ) {}

  step1?: any;
  step2?: any;
  step3?: any;
}
