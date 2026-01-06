"use client";

import { useState } from "react";
import { GITHUB_UPLOAD } from "@/constants/upload";

interface GithubUploadTabProps {
  onSubmit: (url: string) => void;
}

export default function GithubUploadTab({ onSubmit }: GithubUploadTabProps) {
  const [githubUrl, setGithubUrl] = useState<string>("");

  const handleSubmitClick = () => {
    if (githubUrl) {
      onSubmit(githubUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* 레포지토리 URL 입력 필드 */}
      <div>
        <label className="mb-3 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {GITHUB_UPLOAD.LABEL}
        </label>
        <div className="relative">
          <svg
            className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
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
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder={GITHUB_UPLOAD.PLACEHOLDER}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pr-4 pl-12 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
          />
        </div>
      </div>

      {/* Public 레포지토리 안내 */}
      <div className="flex items-center gap-2.5 text-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
        <p className="font-medium text-slate-700">
          {GITHUB_UPLOAD.PUBLIC_NOTICE}
        </p>
      </div>

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
          <p>{GITHUB_UPLOAD.WARNING_MESSAGE}</p>
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmitClick}
        disabled={!githubUrl}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
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
