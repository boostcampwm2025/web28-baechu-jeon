"use client";

import { useState } from "react";
import FolderExplorer from "@/components/layout/FolderExplorer";

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <aside
        className={`relative border-r bg-gray-50 transition-all duration-300 ease-in-out ${isExplorerOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full opacity-0"} `}
      >
        <div className="custom-scrollbar h-full w-64 overflow-y-auto">
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => setIsExplorerOpen(false)}
              className="cursor-pointer p-1 text-slate-400 hover:text-slate-600"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          <FolderExplorer />
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col bg-white">
        {/* 폴더 탐색기 닫힌 후 다시 여는 버튼*/}
        <div
          className={`absolute top-4 left-4 z-20 transition-opacity duration-300 ${!isExplorerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <button
            onClick={() => setIsExplorerOpen(true)}
            className="cursor-pointer rounded-md border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </section>
    </div>
  );
}
