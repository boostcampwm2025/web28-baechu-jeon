import { AnalysisResult, ApiError } from '@/types/analysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * ZIP 파일 업로드 및 분석 요청
 * @param file - 업로드할 ZIP 파일
 * @returns 분석 결과
 */
export async function uploadZipFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error.error?.message || 'Upload failed');
  }

  return data as AnalysisResult;
}

/**
 * 헬스 체크
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}
