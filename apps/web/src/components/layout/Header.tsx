"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ResultTabs from "@/components/layout/ResultTabs";
import Toast from "@/components/result/visualization/Toast";
import { HiOutlineBookOpen } from "react-icons/hi";

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

      <header className="top-0 z-50 flex w-full shrink-0 items-center justify-between border-b border-sky-100 bg-white/80 px-6 py-6 backdrop-blur-md">
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
              <button title="사용법 보기">
                <HiOutlineBookOpen
                  size={32}
                  className="cursor-pointer hover:scale-105 active:scale-95"
                />
              </button>
              <ExportButton onClick={handleExport} />
              <div className="mx-2 h-8 w-0.5 bg-slate-200" />
            </>
          )}
          <LoginButton />
        </div>
      </header>
    </>
  );
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="공유 링크 추출"
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

function LoginButton() {
  return (
    <div className="h-10 w-10 cursor-pointer overflow-hidden rounded-full shadow-md transition-transform hover:scale-105 active:scale-95">
      <svg
        className="h-full w-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 9C16 10.0609 15.5786 11.0783 14.8284 11.8284C14.0783 12.5786 13.0609 13 12 13C10.9391 13 9.92172 12.5786 9.17157 11.8284C8.42143 11.0783 8 10.0609 8 9C8 7.93913 8.42143 6.92172 9.17157 6.17157C9.92172 5.42143 10.9391 5 12 5C13.0609 5 14.0783 5.42143 14.8284 6.17157C15.5786 6.92172 16 7.93913 16 9ZM14 9C14 9.53043 13.7893 10.0391 13.4142 10.4142C13.0391 10.7893 12.5304 11 12 11C11.4696 11 10.9609 10.7893 10.5858 10.4142C10.2107 10.0391 10 9.53043 10 9C10 8.46957 10.2107 7.96086 10.5858 7.58579C10.9609 7.21071 11.4696 7 12 7C12.5304 7 13.0391 7.21071 13.4142 7.58579C13.7893 7.96086 14 8.46957 14 9Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 1C5.925 1 1 5.925 1 12C1 18.075 5.925 23 12 23C18.075 23 23 18.075 23 12C23 5.925 18.075 1 12 1ZM3 12C3 14.09 3.713 16.014 4.908 17.542C5.74744 16.4401 6.83015 15.5471 8.07164 14.9327C9.31312 14.3183 10.6798 13.9991 12.065 14C13.4324 13.9984 14.7821 14.3091 16.0111 14.9084C17.2402 15.5077 18.3162 16.3797 19.157 17.458C20.0234 16.3216 20.6068 14.9952 20.8589 13.5886C21.111 12.182 21.0244 10.7355 20.6065 9.36898C20.1886 8.00243 19.4512 6.75505 18.4555 5.73004C17.4598 4.70503 16.2343 3.93186 14.8804 3.47451C13.5265 3.01716 12.0832 2.88877 10.6699 3.09997C9.25652 3.31117 7.91379 3.85589 6.75277 4.68905C5.59175 5.52222 4.64581 6.61987 3.99323 7.8912C3.34065 9.16252 3.00018 10.571 3 12ZM12 21C9.93391 21.0033 7.93014 20.2926 6.328 18.988C6.97281 18.0646 7.83119 17.3107 8.83008 16.7905C9.82896 16.2702 10.9388 15.999 12.065 16C13.1772 15.999 14.2735 16.2635 15.263 16.7713C16.2524 17.2792 17.1064 18.0158 17.754 18.92C16.1395 20.267 14.1026 21.0033 12 21Z"
          fill="black"
        />
      </svg>
    </div>
  );
}
