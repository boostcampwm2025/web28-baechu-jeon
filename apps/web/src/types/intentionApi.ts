export interface ApiError {
  message: string;
  statusCode: number;
}

export interface IntentionContents {
  overview: string;
  purpose: string;
  keyFeatures: string[];
  technologyStack: Record<string, string[]>;
  architecturalTendencies: string;
}

export interface GetIntentionsResponse {
  analysisId: string;
  status: string;
  contents: IntentionContents;
}
