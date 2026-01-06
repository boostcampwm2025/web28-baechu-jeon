export interface ZipUploadResponse {
  success: boolean;
  projectId: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
