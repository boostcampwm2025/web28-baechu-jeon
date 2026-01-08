"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import profile from "@/assets/profile.svg";
import ResultTabs from "@/components/layout/ResultTabs";
import Toast from "@/components/result/visualization/Toast";

export default function Header() {
  const pathname = usePathname();
  const isResultPage = pathname?.startsWith("/result/");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleExport = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMessage("클립보드에 링크를 복사했습니다.");
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      setToastMessage("링크 복사에 실패했습니다.");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <>
      <Toast message={toastMessage} show={showToast} />

      <header className="relative border-b border-sky-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="로고" />
            <h1 className="text-xl font-bold">쇼미더구조</h1>
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2">
            {isResultPage && <ResultTabs />}
          </div>

          <div className="flex items-center gap-4">
            {isResultPage && (
              <>
                <ExportButton onClick={handleExport} />
                <div className="mx-2 h-8 w-0.5 bg-slate-200" />
              </>
            )}
            <LoginButton image={profile.src} />
          </div>
        </div>
      </header>
    </>
  );
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
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
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export Link
    </button>
  );
}

function LoginButton({ image }: { image: string }) {
  return (
    <div className="h-10 w-10 cursor-pointer overflow-hidden rounded-full shadow-md transition-transform hover:scale-105 active:scale-95">
      <img
        src={image}
        alt="프로필 이미지"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
