const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface CodeResponse {
  filePath: string;
  markdownContent: string;
}

export class CodeError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "CodeError";
  }
}

export async function getCode(
  analysisId: string,
  filePath: string,
  signal?: AbortSignal,
): Promise<CodeResponse> {
  const response = await fetch(
    `${API_BASE_URL}/code/${analysisId}?filePath=${encodeURIComponent(filePath)}`,
    { method: "GET", signal },
  );
  if (!response.ok) throw new CodeError("Fetch failed", response.status);
  return response.json();
}
