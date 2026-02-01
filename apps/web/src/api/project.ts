import {
  ZipUploadResponse,
  GetProjectStructureResponse,
  ApiError,
} from "@/types/projectApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
    const response = await fetch(`${API_BASE_URL}/projects`, {
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

export async function uploadGithubRepo(
  githubUrl: string,
  signal?: AbortSignal,
): Promise<ZipUploadResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ githubUrl }),
      signal,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new ProjectError(
        error.message || "GitHub 저장소 처리에 실패했습니다.",
        response.status,
      );
    }

    const data: ZipUploadResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ProjectError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ProjectError("요청이 취소되었습니다.", 0);
    }

    throw new ProjectError(
      "네트워크 오류가 발생했습니다. 연결을 확인한 뒤 다시 시도해 주세요.",
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
