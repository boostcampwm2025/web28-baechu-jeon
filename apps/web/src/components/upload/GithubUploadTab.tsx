"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GITHUB_UPLOAD } from "@/constants/upload";
import { uploadGithubRepo, ProjectError } from "@/api/project";

export default function GithubUploadTab() {
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value);
    setErrorMessage(null);
  };

  const handleConfirm = async () => {
    if (!githubUrl.trim() || projectId || loading) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      const { projectId: id } = await uploadGithubRepo(githubUrl.trim());
      setProjectId(id);
    } catch (error) {
      const message =
        error instanceof ProjectError
          ? error.message
          : GITHUB_UPLOAD.ERROR_PRIVATE_OR_NOT_FOUND;
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (projectId) {
      router.push(`/analyzing/${encodeURIComponent(projectId)}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* 레포지토리 URL 입력 필드 */}
      <div>
        <label className="mb-3 block text-xs font-semibold tracking-wider text-muted uppercase">
          {GITHUB_UPLOAD.LABEL}
        </label>
        <div className="relative">
          <svg
            className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-subtle"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <input
            type="text"
            value={githubUrl}
            onChange={handleUrlChange}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            placeholder={GITHUB_UPLOAD.PLACEHOLDER}
            disabled={!!projectId}
            className="w-full rounded-xl border border-line bg-page/50 py-3.5 pr-4 pl-12 text-heading placeholder-muted transition-all focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/10 focus:outline-none disabled:cursor-not-allowed disabled:bg-hover disabled:text-muted"
          />
        </div>
        {errorMessage && (
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>

      {/* Public 레포지토리 안내 */}
      <div className="flex items-center gap-2.5 text-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
        <p className="font-medium text-body">
          {GITHUB_UPLOAD.PUBLIC_NOTICE}
        </p>
      </div>

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
          <p>{GITHUB_UPLOAD.WARNING_MESSAGE}</p>
        </div>
      </div>

      {/* URL 확인 버튼: 로딩 중 / 미확인 / 확인 완료(파란색) */}
      {!projectId ? (
        <button
          onClick={handleConfirm}
          disabled={!githubUrl}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-subtle px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-muted hover:shadow-md disabled:cursor-not-allowed disabled:bg-hover disabled:text-muted disabled:shadow-none"
        >
          {loading ? (
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
              {GITHUB_UPLOAD.LOADING_MESSAGE}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              URL 확인
            </>
          )}
        </button>
      ) : (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-4 text-base font-semibold text-white shadow-sm">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          확인 완료
        </div>
      )}

      {/* 분석 시작하기 버튼 - 항상 표시, URL 확인 시 활성화 */}
      <button
        onClick={handleAnalyze}
        disabled={!projectId}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:bg-hover disabled:text-muted disabled:shadow-none"
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        {GITHUB_UPLOAD.SUBMIT_BUTTON}
      </button>
    </div>
  );
}
