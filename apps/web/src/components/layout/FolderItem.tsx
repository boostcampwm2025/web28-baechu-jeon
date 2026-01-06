"use client";

import { ReactNode } from "react";

interface FolderItemProps {
  name: string;
  expanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
  level?: number;
}

export default function FolderItem({
  name,
  expanded,
  onToggle,
  children,
  level = 0,
}: FolderItemProps) {
  return (
    <div>
      <div
        onClick={onToggle}
        className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white hover:shadow-sm"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <svg
          className="h-5 w-5 shrink-0 text-amber-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
        <span className="truncate text-sm font-medium text-slate-700">
          {name}
        </span>
      </div>

      {expanded && children && (
        <div className="mt-1 ml-3 border-l border-slate-200">{children}</div>
      )}
    </div>
  );
}
