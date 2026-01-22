"use client";

import { useState } from "react";
import FolderExplorer from "@/components/layout/FolderExplorer";
import { FileNode } from "@/utils/pathTree";
import { HiFolderOpen } from "react-icons/hi";

interface LayoutClientProps {
  children: React.ReactNode;
  treeData: FileNode[];
}

export default function LayoutClient({
  children,
  treeData,
}: LayoutClientProps) {
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  return (
    <div className="no-scrollbar relative flex h-full w-full overflow-hidden">
      <aside
        className={`relative border-r bg-gray-50 transition-all duration-300 ease-in-out ${
          isExplorerOpen
            ? "w-72 translate-x-0"
            : "w-0 -translate-x-full opacity-0"
        }`}
      >
        <div className="h-full overflow-y-auto">
          <FolderExplorer
            tree={treeData}
            onClose={() => setIsExplorerOpen(false)}
          />
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col bg-white">
        <div
          className={`absolute top-4 left-4 z-20 transition-opacity duration-200 ${
            !isExplorerOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <button
            onClick={() => setIsExplorerOpen(true)}
            className="cursor-pointer rounded-md border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700"
          >
            <HiFolderOpen className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>
      </section>
    </div>
  );
}
