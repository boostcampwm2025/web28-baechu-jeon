"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ResultTabs from "@/components/layout/ResultTabs";
import Toast from "@/components/result/visualization/Toast";
import { useThemeStore } from "@/stores/useThemeStore";
import { getCookie } from "@/utils/cookies";

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

      <header className="border-line bg-surface/80 top-0 z-50 flex w-full shrink-0 items-center justify-between border-b px-6 py-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="로고" />
          <h1 className="text-heading text-xl font-bold">쇼미더구조</h1>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2">
          {isResultPage && <ResultTabs />}
        </div>

        <div className="flex items-center gap-4">
          {isResultPage && (
            <>
              <ExportButton onClick={handleExport} />
              <div className="bg-line mx-2 h-8 w-0.5" />
            </>
          )}
          <ThemeToggle />
        </div>
      </header>
    </>
  );
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-primary hover:bg-primary-hover flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
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

function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const localTheme = getCookie("theme") as "dark" | "light";
    if (localTheme && localTheme !== theme) {
      setTheme(localTheme);
    }
  }, [setTheme, theme]);

  if (!mounted) {
    return <div className="h-10 w-10" />; // Placeholder to prevent layout shift but avoid hydration mismatch
  }

  return (
    <button
      onClick={toggleTheme}
      className="text-heading flex h-10 w-10 cursor-pointer items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 active:scale-95"
      aria-label="테마 전환"
    >
      {theme === "dark" ? (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
