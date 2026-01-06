import { ZipUploadResponse, ApiError } from "@/types/uploadApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class UploadError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

export async function uploadZipFile(file: File): Promise<ZipUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload/zip`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new UploadError(
        error.message || "Failed to upload file",
        response.status,
      );
    }

    const data: ZipUploadResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }

    throw new UploadError(
      "Network error. Please check your connection and try again.",
      0,
    );
  }
}
