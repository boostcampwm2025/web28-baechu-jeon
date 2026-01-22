export interface ApiError {
  message: string;
  statusCode: number;
}

export interface ZipUploadResponse {
  success: boolean;
  projectId: string;
}

export interface ProjectStructure {
  files: string[];
  folders: string[];
}

export interface GetProjectStructureResponse {
  projectId: string;
  status: "UPLOADED" | "ANALYZING" | "COMPLETED" | "FAILED";
  projectStructure: ProjectStructure;
}
