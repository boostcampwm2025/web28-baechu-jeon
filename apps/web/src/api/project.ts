import {
  ZipUploadResponse,
  GetProjectStructureResponse,
  ApiError,
} from "@/types/projectApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Project 관련 모든 에러를 처리하는 클래스
export class ProjectError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ProjectError";
  }
}

export async function uploadZipFile(
  file: File,
  signal?: AbortSignal,
): Promise<ZipUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/projects/zip`, {
      method: "POST",
      body: formData,
      signal,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new ProjectError(
        error.message || "Failed to upload file",
        response.status,
      );
    }

    const data: ZipUploadResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ProjectError) {
      throw error;
    }

    // AbortError 처리
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProjectError("Upload cancelled", 0);
    }

    throw new ProjectError(
      "Network error. Please check your connection and try again.",
      0,
    );
  }
}

export async function getProjectStructure(
  projectId: string,
  signal?: AbortSignal,
): Promise<GetProjectStructureResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new ProjectError(
        error.message || "Failed to fetch project structure",
        response.status,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ProjectError) {
      throw error;
    }

    // AbortError 처리
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProjectError("Upload cancelled", 0);
    }

    throw new ProjectError(
      "Network error. Please check your connection and try again.",
      0,
    );
  }
}
