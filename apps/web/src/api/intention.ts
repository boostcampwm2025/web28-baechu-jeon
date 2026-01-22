import { GetIntentionsResponse, ApiError } from "@/types/intentionApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class IntentionError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "IntentionError";
  }
}

export async function getIntentions(
  projectId: string,
  signal?: AbortSignal,
): Promise<GetIntentionsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/intentions/${projectId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new IntentionError(
        error.message || "Failed to fetch project intentions",
        response.status,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof IntentionError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new IntentionError("Request cancelled", 0);
    }

    throw new IntentionError(
      "Network error. Please check your connection and try again.",
      0,
    );
  }
}

export async function resetIntentions(
  projectId: string,
  signal?: AbortSignal,
): Promise<GetIntentionsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/intentions/${projectId}/reset`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      },
    );

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new IntentionError(
        error.message || "Failed to reset project intentions",
        response.status,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof IntentionError) throw error;
    throw new IntentionError("Network error during reset.", 0);
  }
}
