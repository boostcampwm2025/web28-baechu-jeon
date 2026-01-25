const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API 응답 타입
export interface ApiNode {
  id: string;
  label: string;
  group: string;
  contents: string;
  x?: number; // INITIAL일 땐 없을 수 있음
  y?: number;
}

export interface ApiEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
}

export interface InitialNodes {
  diagram1: ApiNode[];
  diagram2: ApiNode[];
  diagram3: ApiNode[];
}

// 전체 응답 타입
export interface VisualizationResponse {
  visualizationId: string;
  layoutState: "INITIAL" | "LAYOUTED";
  nodes: InitialNodes | ApiNode[]; // 상태에 따라 객체 또는 배열
  edges: ApiEdge[];
}

export interface UpdateVisualizationRequest {
  nodes: ApiNode[];
  edges: ApiEdge[];
}

export interface UpdateVisualizationResponse {
  visualizationId: string;
  success: boolean;
}

export class VisualizationError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "VisualizationError";
  }
}

export async function getVisualization(
  analysisId: string,
  signal?: AbortSignal,
): Promise<VisualizationResponse> {
  const response = await fetch(`${API_BASE_URL}/visualizations/${analysisId}`, {
    method: "GET",
    signal,
  });
  if (!response.ok)
    throw new VisualizationError("Fetch failed", response.status);
  return response.json();
}

/**
 * PUT: nodes와 edges를 모두 포함해서 보냄
 */
export async function updateVisualization(
  visualizationId: string,
  data: UpdateVisualizationRequest, // nodes와 edges가 포함된 객체
): Promise<UpdateVisualizationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/visualizations/${visualizationId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok)
    throw new VisualizationError("Update failed", response.status);
  return response.json();
}

export async function resetVisualization(
  visualizationId: string,
): Promise<VisualizationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/visualizations/${visualizationId}/reset`,
    {
      method: "GET",
    },
  );
  if (!response.ok)
    throw new VisualizationError("Reset failed", response.status);
  return response.json();
}
