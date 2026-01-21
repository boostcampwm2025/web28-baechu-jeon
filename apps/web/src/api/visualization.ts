const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API 응답 타입
export interface ApiNode {
  id: string;
  label: string;
  group: string;
  x: number | "default";
  y: number | "default";
  contents: string;
}

export interface VisualizationResponse {
  visualizationId: string;
  nodes: ApiNode[];
  edges: unknown[];
}

export class VisualizationError extends Error {
  constructor(
    message: string,
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
  try {
    const response = await fetch(`${API_BASE_URL}/visualizations/${analysisId}`, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new VisualizationError(
        error.message || "Failed to fetch visualization",
        response.status,
      );
    }

    const data: VisualizationResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof VisualizationError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new VisualizationError("Request cancelled", 0);
    }

    throw new VisualizationError(
      "Network error. Please check your connection and try again.",
      0,
    );
  }
}
