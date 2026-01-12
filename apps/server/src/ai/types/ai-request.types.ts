/**
 * AI 분석 요청 타입
 * TODO: 실제 요청 형식은 나중에 구체화 예정
 */
export interface AIAnalysisRequest {
  /**
   * 프로젝트 ID
   */
  projectId: string;

  /**
   * 분석할 데이터 (형식은 나중에 구체화)
   */
  data: Record<string, unknown>;
}
