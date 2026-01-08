import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadZipFile, UploadError } from "@/api/upload";
import { ZIP_UPLOAD } from "@/constants/upload";

export function useZipUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const router = useRouter();

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith(ZIP_UPLOAD.FILE_EXTENSION)) {
      return ZIP_UPLOAD.ERROR_INVALID_TYPE;
    }

    if (file.size > ZIP_UPLOAD.MAX_FILE_SIZE) {
      return ZIP_UPLOAD.ERROR_FILE_TOO_LARGE;
    }

    return null;
  };

  // 업로드 처리
  const handleUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    setProjectId(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const result = await uploadZipFile(file, controller.signal);
      setProjectId(result.projectId);
    } catch (error) {
      // 취소된 경우 에러 메시지 표시하지 않음
      if (
        error instanceof UploadError &&
        error.message === "Upload cancelled"
      ) {
        return;
      }

      const errorMessage =
        error instanceof UploadError || error instanceof Error
          ? error.message
          : "파일 업로드 중 오류가 발생했습니다.";

      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      setAbortController(null);
    }
  };

  // 드래그 이벤트 핸들러
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
    } else {
      setError(null);
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    handleUpload(file);
  };

  const handleRemoveFile = () => {
    // 업로드 중이면 취소
    if (abortController) {
      abortController.abort();
      setIsUploading(false);
      setAbortController(null);
      setSelectedFile(null);
      setError(null);
      return;
    }

    // 서버에 업로드를 마쳤는데, cancel을 한 경우
    setProjectId(null);
    setSelectedFile(null);
    setError(null);
  };

  const handleAnalyze = () => {
    if (projectId) {
      router.push(`/analyzing/${encodeURIComponent(projectId)}`);
    }
  };

  return {
    // 상태
    selectedFile,
    isDragging,
    error,
    uploadError,
    isUploading,
    projectId,
    // 핸들러
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    handleRemoveFile,
    handleAnalyze,
  };
}
