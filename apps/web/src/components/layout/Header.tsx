"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoSunny, IoMoon } from "react-icons/io5";
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

      <header className="border-line bg-surface/80 top-0 z-50 flex w-full shrink-0 items-center justify-between border-b px-6 py-3 backdrop-blur-md">
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
        <IoSunny className="h-6 w-6" />
      ) : (
        <IoMoon className="h-6 w-6" />
      )}
    </button>
  );
}
