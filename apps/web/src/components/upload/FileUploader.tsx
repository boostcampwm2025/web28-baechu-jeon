'use client';

import { useFileUpload } from '@/hooks/useFileUpload';
import { AnalysisResult } from '@/types/analysis';

interface FileUploaderProps {
  onUploadSuccess: (result: AnalysisResult) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

export default function FileUploader({
  onUploadSuccess,
  onUploadStart,
  onUploadEnd,
}: FileUploaderProps) {
  const { uploadFile, isUploading, error } = useFileUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploadStart();
    try {
      const result = await uploadFile(file);
      if (result) {
        onUploadSuccess(result);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      onUploadEnd();
      // 파일 입력 초기화
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
        {/* 업로드 아이콘 */}
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 업로드 버튼 */}
        <label className="cursor-pointer">
          <span className="text-blue-600 hover:text-blue-700 font-medium text-lg">
            Upload .zip
          </span>
          <input
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>

        <p className="mt-2 text-sm text-gray-500">
          또는 파일을 드래그하여 업로드하세요
        </p>
        <p className="mt-1 text-xs text-gray-400">최대 200MB</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 로딩 상태 */}
      {isUploading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">파일 업로드 중...</p>
        </div>
      )}
    </div>
  );
}
