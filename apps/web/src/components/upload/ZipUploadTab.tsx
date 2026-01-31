"use client";

import { ZIP_UPLOAD, FILE_SIZE } from "@/constants/upload";
import { useZipUpload } from "@/hooks/useZipUpload";

export default function ZipUploadTab() {
  const {
    selectedFile,
    isDragging,
    error,
    uploadError,
    isUploading,
    projectId,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    handleRemoveFile,
    handleAnalyze,
  } = useZipUpload();

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
            ? "border-accent bg-accent/10"
            : error
              ? "border-red-500/40 bg-red-500/10 hover:border-red-500/60 hover:bg-red-500/15"
              : "border-line bg-page/30 hover:border-subtle hover:bg-page/50"
        }`}
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="hidden"
        />
        <svg
          className="mb-5 h-14 w-14 text-accent"
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
        <p className="mb-2 text-lg font-semibold text-body">
          {ZIP_UPLOAD.DRAG_DROP_TITLE}
        </p>
        <p className="text-sm text-muted">
          {ZIP_UPLOAD.DRAG_DROP_SUBTITLE}
        </p>
      </label>

      {/* 선택된 파일 정보 표시 */}
      {selectedFile && (
        <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/20 p-2">
              <svg
                className="h-6 w-6 text-accent"
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
              <p className="font-semibold text-heading">
                {selectedFile.name}
              </p>
              <p className="text-sm text-subtle">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="text-muted transition-colors hover:text-body"
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
        <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"
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
          <div className="text-sm text-red-400">
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* 서버 업로드 에러 메시지 */}
      {uploadError && (
        <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"
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
          <div className="text-sm text-red-400">
            <p className="font-semibold">업로드 실패</p>
            <p className="mt-1">{uploadError}</p>
          </div>
        </div>
      )}

      {/* 주의사항 메시지 */}
      <div className="flex gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400"
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
        <div className="text-sm text-body">
          <p className="font-semibold">{ZIP_UPLOAD.WARNING_TITLE}</p>
          <p className="mt-1 text-subtle">{ZIP_UPLOAD.WARNING_SUBTITLE}</p>
        </div>
      </div>

      {/* 분석 시작하기 버튼 - 업로드 성공 시 활성화 */}
      <button
        onClick={handleAnalyze}
        disabled={!projectId || isUploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:bg-hover disabled:text-muted disabled:shadow-none"
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
