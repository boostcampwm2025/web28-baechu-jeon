import { AIAnalysisRequest } from '../types/ai-request.types';
import { AIAnalysisResponse } from '../types/ai-response.types';

/**
 * AI Provider 공통 인터페이스
 */
export interface AIProvider {
  /**
   * 프로젝트 분석 요청
   * @param request 분석 요청 데이터
   * @returns 분석 결과
   */
  analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}
