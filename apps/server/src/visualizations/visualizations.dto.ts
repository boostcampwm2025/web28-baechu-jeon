// React Flow 친화적인 시각화 응답 DTO

export interface NodeDto {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface EdgeDto {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  data?: Record<string, unknown>;
}

export interface VisualizationResponseDto {
  visualizationId: string;
  analysisId: string;
  nodes: NodeDto[];
  edges: EdgeDto[];
  metadata?: Record<string, unknown>;
}
