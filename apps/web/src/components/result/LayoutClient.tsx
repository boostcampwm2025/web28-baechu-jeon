"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import FolderExplorer from "@/components/layout/FolderExplorer";
import { FileNode } from "@/utils/pathTree";
import { HiFolderOpen } from "react-icons/hi";

interface LayoutClientProps {
  children: React.ReactNode;
  treeData: FileNode[];
}

const CLOSE_THRESHOLD = 100;
const MIN_WIDTH = 250;
const MAX_WIDTH = 350;
const DEFAULT_WIDTH = 288;

export default function LayoutClient({
  children,
  treeData,
}: LayoutClientProps) {
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const isResizing = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(MAX_WIDTH, Math.max(0, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setSidebarWidth((prev) => {
        if (prev < CLOSE_THRESHOLD) {
          setIsExplorerOpen(false);
          return DEFAULT_WIDTH;
        }
        if (prev < MIN_WIDTH) {
          return MIN_WIDTH;
        }
        return prev;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="no-scrollbar relative flex h-full w-full overflow-hidden">
      <aside
        className={`relative border-r border-line bg-surface ${
          isDragging
            ? ""
            : "transition-all duration-300 ease-in-out"
        } ${isExplorerOpen ? "translate-x-0" : "-translate-x-full opacity-0"}`}
        style={{
          width: isExplorerOpen ? `${sidebarWidth}px` : 0,
        }}
      >
        <div className="h-full overflow-y-auto">
          <FolderExplorer
            tree={treeData}
            onClose={() => setIsExplorerOpen(false)}
          />
        </div>

        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 -right-1 z-10 h-full w-2.5 cursor-col-resize transition-colors hover:bg-hover active:bg-subtle"
        />
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col bg-page">
        <div
          className={`absolute top-4 left-4 z-20 transition-opacity duration-200 ${
            !isExplorerOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <button
            onClick={() => setIsExplorerOpen(true)}
            className="cursor-pointer rounded-md border border-line bg-surface p-2 text-muted shadow-sm hover:bg-hover hover:text-body"
          >
            <HiFolderOpen className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>
      </section>
    </div>
  );
}
