const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface StartAnalysisResponse {
  analysisId: string;
  status: string;
}

export class AnalysisError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

/**
 * 분석 시작 API 호출
 * @param projectId 프로젝트 ID
 * @returns 분석 ID 및 상태
 */
export async function startAnalysis(
  projectId: string,
): Promise<StartAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analyses/${projectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to start analysis",
      }));
      throw new AnalysisError(
        errorData.message || "Failed to start analysis",
        response.status,
      );
    }

    const data: StartAnalysisResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof AnalysisError) {
      throw error;
    }

    throw new AnalysisError(
      "Network error. Please check your connection and try again.",
      0,
    );
  }
}
