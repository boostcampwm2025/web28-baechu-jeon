"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ZipUploadTab from "./ZipUploadTab";
import GithubUploadTab from "./GithubUploadTab";
import { TAB_LABELS } from "@/constants/upload";
import { uploadZipFile, UploadError } from "@/api/upload";

type UploadTab = "zip" | "github";

export default function Uploader() {
  const [activeTab, setActiveTab] = useState<UploadTab>("zip");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleZipSubmit = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadZipFile(file);

      router.push(`/analyzing?projectId=${result.projectId}`);
    } catch (error) {
      const errorMessage =
        error instanceof UploadError || error instanceof Error
          ? error.message
          : "파일 업로드 중 오류가 발생했습니다.";

      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGithubSubmit = (url: string) => {
    router.push(`/analyzing?projectId=${encodeURIComponent(url)}`);
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      {/* 탭 메뉴 */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setActiveTab("zip")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition-all ${
            activeTab === "zip"
              ? "bg-slate-100 text-blue-600 shadow-sm"
              : "bg-slate-50/50 text-slate-500 hover:bg-slate-100/70"
          }`}
        >
          <svg
            className="h-4 w-4"
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
          {TAB_LABELS.ZIP}
        </button>
        <button
          onClick={() => setActiveTab("github")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition-all ${
            activeTab === "github"
              ? "bg-slate-100 text-blue-600 shadow-sm"
              : "bg-slate-50/50 text-slate-500 hover:bg-slate-100/70"
          }`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          {TAB_LABELS.GITHUB}
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "zip" ? (
        <ZipUploadTab
          onSubmit={handleZipSubmit}
          uploadError={uploadError}
          isUploading={isUploading}
        />
      ) : (
        <GithubUploadTab onSubmit={handleGithubSubmit} />
      )}

      {/* 에러 메시지 표시 (선택 사항: UI에 추가하고 싶을 경우) */}
      {uploadError && (
        <div className="mt-4 text-center text-sm text-red-500">
          {uploadError}
        </div>
      )}
    </div>
  );
}
