"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiFolder, HiDocument, HiOutlineChevronRight } from "react-icons/hi";
import { FileNode } from "@/utils/pathTree";
import { useExplorerStore } from "@/stores/useExplorerStore";
import { useVisualizationStore } from "@/store/useVisualizationStore";

interface FileItemProps {
  node: FileNode;
  depth: number;
}

export const FileItem = ({ node, depth }: FileItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const autoExpanded = useRef(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFolder = node.type === "folder";

  const router = useRouter();
  const params = useParams<{ projectId: string; analysisId: string }>();
  const highlightedPaths = useExplorerStore((s) => s.highlightedPaths);
  const setSelectedFilePath = useVisualizationStore(
    (s) => s.setSelectedFilePath,
  );

  const isHighlighted = highlightedPaths.includes(node.path);
  const shouldExpand =
    isFolder && highlightedPaths.some((hp) => hp.startsWith(node.path + "/"));

  useEffect(() => {
    if (shouldExpand) {
      setIsOpen(true);
      autoExpanded.current = true;
    } else if (autoExpanded.current) {
      setIsOpen(false);
      autoExpanded.current = false;
    }
  }, [shouldExpand]);

  useEffect(() => {
    if (isHighlighted && highlightedPaths[0] === node.path) {
      requestAnimationFrame(() => {
        itemRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [isHighlighted, highlightedPaths, node.path]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
      return;
    }
    if (!isHighlighted) {
      setShowTooltip(true);
      timeoutRef.current = setTimeout(() => setShowTooltip(false), 2000);
      return;
    }
    setSelectedFilePath(node.path);
    router.push(
      `/result/${params.projectId}/${params.analysisId}/code?filePath=${encodeURIComponent(node.path)}`,
    );
  };

  return (
    <div>
      <div className="relative">
        <div
          ref={itemRef}
          onClick={handleClick}
          title={node.path}
          className={`group flex items-center gap-1 px-2 py-1 pr-4 text-sm transition-colors select-none ${
            isHighlighted
              ? "cursor-pointer rounded-sm bg-amber-500/15 font-semibold text-amber-400"
              : isFolder
                ? "text-body hover:bg-hover cursor-pointer font-medium"
                : "text-subtle hover:bg-hover/50 cursor-default"
          } `}
          style={{ paddingLeft: `${depth * 10 + 5}px` }}
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center transition-transform duration-100 ${
              isOpen ? "rotate-90" : ""
            }`}
          >
            {isFolder && (
              <HiOutlineChevronRight className="text-muted h-3 w-3" />
            )}
          </span>

          <span className="flex shrink-0 items-center justify-center text-lg">
            {isFolder ? (
              <HiFolder
                className={isHighlighted ? "text-amber-400" : "text-amber-300"}
              />
            ) : (
              <HiDocument
                className={isHighlighted ? "text-amber-400" : "text-blue-200"}
              />
            )}
          </span>

          <span className="ml-1 truncate pt-0.5">{node.name}</span>
        </div>

        {showTooltip && (
          <div className="bg-hover text-heading absolute -top-8 left-1/2 z-50 -translate-x-1/2 rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
            코드 요약을 제공하지 않는 파일입니다
          </div>
        )}
      </div>

      {/* 자식 그리기 (재귀) */}
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileItem
              key={child.path || child.name + depth}
              node={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
