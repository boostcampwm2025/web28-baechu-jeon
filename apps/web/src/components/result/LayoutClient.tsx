"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FolderExplorer from "@/components/layout/FolderExplorer";
import Guide from "@/components/layout/Guide";
import { useGuideStore } from "@/stores/useGuideStore";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { HiFolderOpen } from "react-icons/hi";
import { FileNode } from "@/utils/pathTree";
import { ReactFlowProvider } from "@xyflow/react";

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
  const { checkFirstVisit, run } = useGuideStore();
  const { isSidebarOpen, setIsSidebarOpen } = useVisualizationStore();

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const isResizing = useRef(false);

  useEffect(() => {
    checkFirstVisit();
  }, [checkFirstVisit]);

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
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX));
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
          setIsSidebarOpen(false);
          return prev; // 현재 위치에서 트랜지션으로 자연스럽게 닫힘
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
  }, [setIsSidebarOpen]);

  const shouldAnimate = !isDragging && !run;

  return (
    <ReactFlowProvider>
      <div className="no-scrollbar relative flex h-full w-full overflow-hidden">
        <Guide />

        <aside
          id="folder-sidebar"
          className={`relative border-r border-slate-200 bg-gray-50 ${
            shouldAnimate ? "transition-all duration-300 ease-in-out" : ""
          } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full opacity-0"}`}
          style={{
            width: isSidebarOpen ? `${sidebarWidth}px` : 0,
            opacity: !isSidebarOpen
              ? 0
              : isDragging && sidebarWidth < CLOSE_THRESHOLD
                ? Math.max(0.3, sidebarWidth / CLOSE_THRESHOLD)
                : 1,
          }}
        >
          <div className="h-full overflow-y-auto">
            <FolderExplorer
              tree={treeData}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          <div
            onMouseDown={handleMouseDown}
            className="hover:bg-hover active:bg-subtle absolute top-0 -right-1 z-10 h-full w-2.5 cursor-col-resize transition-colors"
          />
        </aside>

        <section className="bg-page relative flex min-w-0 flex-1 flex-col">
          <div
            className={`absolute top-4 left-4 z-20 transition-opacity duration-200 ${
              !isSidebarOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <button
              onClick={() => {
                setSidebarWidth(DEFAULT_WIDTH);
                setIsSidebarOpen(true);
              }}
              className="border-line bg-surface text-muted hover:bg-hover hover:text-body cursor-pointer rounded-md border p-2 shadow-sm"
            >
              <HiFolderOpen className="h-5 w-5" />
            </button>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>
        </section>
      </div>
    </ReactFlowProvider>
  );
}
