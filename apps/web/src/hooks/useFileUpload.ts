import { useState } from 'react';
import { uploadZipFile } from '@/lib/api';
import { AnalysisResult } from '@/types/analysis';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<AnalysisResult | null> => {
    setIsUploading(true);
    setError(null);

    try {
      // 파일 크기 체크 (200MB)
      if (file.size > 200 * 1024 * 1024) {
        throw new Error('파일 크기는 200MB 이하여야 합니다.');
      }

      // 파일 확장자 체크
      if (!file.name.endsWith('.zip')) {
        throw new Error('ZIP 파일만 업로드 가능합니다.');
      }

      const result = await uploadZipFile(file);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    error,
    clearError: () => setError(null),
  };
}
