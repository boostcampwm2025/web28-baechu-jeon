const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// API 응답 타입
export interface ApiNode {
  id: string;
  x: number;
  y: number;
  label: string;
  diagramType: "STEP1" | "STEP2" | "STEP3";
  groups?: "FE" | "BE" | "INFRA" | "DB" | "EXTRA";
  contents: string | null;
  relatedFolders?: string[];
  relatedPaths?: string[];
  nodeType?: "FILE" | "FOLDER";
  path?: string;
}

export interface ApiEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type?: string;
}

// 전체 응답 타입
export interface VisualizationResponse {
  visualizationId: string;
  layoutState: "INITIAL" | "FIXED";
  nodes: {
    STEP1: ApiNode[];
    STEP2: ApiNode[];
    STEP3: ApiNode[];
  };
  edges: ApiEdge[];
}

export interface UpdateVisualizationRequest {
  nodes: {
    STEP1: ApiNode[];
    STEP2: ApiNode[];
    STEP3: ApiNode[];
  };
  edges: ApiEdge[];
  layoutState?: "INITIAL" | "FIXED";
}

export type UpdateVisualizationResponse = VisualizationResponse;

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
  data: UpdateVisualizationRequest,
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
