"use client";

import { useState } from "react";

interface FolderExplorerProps {
  onClose?: () => void;
}

const MOCK_PATHS = [
  "src/",
  "src/app/",
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/components/",
  "src/components/Header.tsx",
  "src/components/Footer.tsx",
  "src/components/Sidebar.tsx",
  "src/components/components/",
  "src/components/components/jh.tsx",
  "src/hooks/",
  "src/hooks/useToggle.ts",
  "src/utils/",
  "src/utils/format.ts",
  "src/test.ts",
  "package.json",
  "README.md",
  "next.config.js",
  "리드ddddddddddddddddddddddddd미.md",
];

export default function FolderExplorer({ onClose }: FolderExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["src/"]),
  );

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const isVisible = (path: string) => {
    if (!path.includes("/")) return true;
    const parts = path.split("/").filter(Boolean);
    let currentPath = "";
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath += parts[i] + "/";
      if (!expandedFolders.has(currentPath)) return false;
    }
    return true;
  };

  return (
    <div className="w-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
          Project Files
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
        )}
      </div>

      <div className="space-y-0.5">
        {MOCK_PATHS.map((path) => {
          if (!isVisible(path)) return null;

          const isFolder = path.endsWith("/");
          const parts = path.split("/").filter(Boolean);
          const name = parts[parts.length - 1];
          const level = parts.length - 1;
          const isExpanded = expandedFolders.has(path);

          return (
            <div
              key={path}
              title={name}
              onClick={() => isFolder && toggleFolder(path)}
              className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 pr-4 text-sm transition-colors select-none ${isFolder ? "cursor-pointer text-slate-700 hover:bg-slate-100" : "text-slate-600"} `}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              >
                {isFolder && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </span>

              {isFolder ? (
                <svg
                  className="h-5 w-5 shrink-0 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              )}

              <span className="min-w-0 flex-1 truncate font-medium">
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
