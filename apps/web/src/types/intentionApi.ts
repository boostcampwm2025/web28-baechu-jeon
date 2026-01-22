export interface ApiError {
  message: string;
  statusCode: number;
}

export interface IntentionContents {
  overview: string;
  purpose: string;
  key_features: string[];
  technology_stack: Record<string, string[]>;
  architectural_tendencies: string;
}

export interface GetIntentionsResponse {
  analysisId: string;
  status: string;
  contents: IntentionContents;
}
