"use client";

import { useState } from "react";
import { ZIP_UPLOAD, FILE_SIZE } from "@/constants/upload";

interface ZipUploadTabProps {
  onSubmit: (file: File) => void;
  uploadError?: string | null;
  isUploading?: boolean;
}

export default function ZipUploadTab({
  onSubmit,
  uploadError,
  isUploading = false,
}: ZipUploadTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 파일 유효성 검사 (확장자 및 크기 체크)
  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith(ZIP_UPLOAD.FILE_EXTENSION)) {
      return ZIP_UPLOAD.ERROR_INVALID_TYPE;
    }

    if (file.size > ZIP_UPLOAD.MAX_FILE_SIZE) {
      return ZIP_UPLOAD.ERROR_FILE_TOO_LARGE;
    }

    return null;
  };

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
    } else {
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleSubmitClick = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return FILE_SIZE.ZERO;
    const k = FILE_SIZE.BASE;
    const sizes = FILE_SIZE.UNITS;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* 드래그 앤 드롭 영역 */}
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 transition-all ${
          isDragging
            ? "border-blue-400 bg-blue-50/50"
            : error
              ? "border-red-300 bg-red-50/30 hover:border-red-400 hover:bg-red-50/50"
              : "border-slate-300 bg-slate-50/30 hover:border-slate-400 hover:bg-slate-50/50"
        }`}
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="hidden"
        />
        <svg
          className="mb-5 h-14 w-14 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
        <p className="mb-2 text-lg font-semibold text-slate-700">
          {ZIP_UPLOAD.DRAG_DROP_TITLE}
        </p>
        <p className="text-sm text-slate-500">
          {ZIP_UPLOAD.DRAG_DROP_SUBTITLE}
        </p>
      </label>

      {/* 선택된 파일 정보 표시 */}
      {selectedFile && (
        <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-600">
                {formatFileSize(selectedFile.size)} • {ZIP_UPLOAD.UPLOAD_READY}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 파일 유효성 검사 에러 메시지 */}
      {error && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-red-700">
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* 서버 업로드 에러 메시지 */}
      {uploadError && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-red-700">
            <p className="font-semibold">업로드 실패</p>
            <p className="mt-1">{uploadError}</p>
          </div>
        </div>
      )}

      {/* 주의사항 메시지 */}
      <div className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50/70 p-4">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="text-sm text-slate-700">
          <p className="font-semibold">{ZIP_UPLOAD.WARNING_TITLE}</p>
          <p className="mt-1 text-slate-600">{ZIP_UPLOAD.WARNING_SUBTITLE}</p>
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmitClick}
        disabled={!selectedFile || !!error || isUploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        {isUploading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            업로드 중...
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            {ZIP_UPLOAD.SUBMIT_BUTTON}
          </>
        )}
      </button>
    </div>
  );
}
