"use client";

import { useState } from "react";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";

interface FolderExplorerProps {
  onClose?: () => void;
}

export default function FolderExplorer({ onClose }: FolderExplorerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["src"]));

  const toggleFolder = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div className="w-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
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

      <div className="space-y-1">
        <FolderItem
          name="src"
          expanded={expanded.has("src")}
          onToggle={() => toggleFolder("src")}
        >
          <FileItem name="index.ts" />
          <FileItem name="app.ts" />
          <FolderItem
            name="components"
            expanded={expanded.has("components")}
            onToggle={() => toggleFolder("components")}
          >
            <FileItem name="header.ts" />
            <FileItem name="footer.ts" />
          </FolderItem>
        </FolderItem>
      </div>
    </div>
  );
}
