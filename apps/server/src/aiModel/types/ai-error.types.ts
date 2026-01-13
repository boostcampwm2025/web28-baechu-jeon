/**
 * AI Provider 에러 타입
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

/**
 * AI Provider 타임아웃 에러
 */
export class AIProviderTimeoutError extends AIProviderError {
  constructor(provider: string, timeout: number) {
    super(
      `AI Provider (${provider}) request timeout after ${timeout}ms`,
      provider,
    );
    this.name = 'AIProviderTimeoutError';
  }
}

/**
 * AI Provider API 에러
 */
export class AIProviderApiError extends AIProviderError {
  constructor(
    provider: string,
    statusCode: number,
    message: string,
    originalError?: Error,
  ) {
    super(
      `AI Provider (${provider}) API error: ${message}`,
      provider,
      statusCode,
      originalError,
    );
    this.name = 'AIProviderApiError';
  }
}

/**
 * AI Provider 설정 에러
 */
export class AIProviderConfigError extends AIProviderError {
  constructor(provider: string, message: string) {
    super(
      `AI Provider (${provider}) configuration error: ${message}`,
      provider,
    );
    this.name = 'AIProviderConfigError';
  }
}
