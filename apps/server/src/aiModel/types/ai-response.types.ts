/**
 * AI 분석 응답 타입
 * TODO: 실제 응답 형식은 나중에 구체화 예정
 */
export interface AIAnalysisResponse {
  /**
   * 프로젝트 ID
   */
  projectId: string;

  /**
   * 분석 결과 데이터 (형식은 나중에 구체화)
   */
  result: Record<string, unknown>;
}
