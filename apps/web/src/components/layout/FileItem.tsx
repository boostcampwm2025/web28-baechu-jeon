"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { HiFolder, HiDocument, HiOutlineChevronRight } from "react-icons/hi";
import { FileNode } from "@/utils/pathTree";
import { useExplorerStore } from "@/stores/useExplorerStore";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { maybeDecode } from "@/utils/url";
import { useDebouncedPrefetch } from "@/hooks/useDebouncedPrefetch";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ analysisId: string }>();
  const highlightedPaths = useExplorerStore((s) => s.highlightedPaths);
  const setCachedCode = useVisualizationStore((s) => s.setCachedCode);

  const indicatedPaths = useExplorerStore((s) => s.indicatedPaths);
  const { debouncedPrefetch, cancel: cancelPrefetch } = useDebouncedPrefetch(150);

  const isHighlighted = highlightedPaths.includes(node.path);
  const isIndicated = !isFolder && indicatedPaths.has(node.path);
  const isClickable = isHighlighted || isIndicated;
  // 폴더 내부에 indicated 파일이 있는지 (파란 점 표시용)
  const hasIndicatedChildren =
    isFolder &&
    [...indicatedPaths].some((ip) => ip.startsWith(node.path + "/"));
  // 자동 펼침은 highlighted일 때만
  const shouldExpand =
    isFolder && highlightedPaths.some((hp) => hp.startsWith(node.path + "/"));

  const handleMouseEnter = useCallback(() => {
    if (!isClickable || isFolder || !node.path || !params.analysisId) return;

    debouncedPrefetch(() => {
      const decoded = maybeDecode(node.path) ?? node.path;
      if (
        useVisualizationStore.getState().getCachedCode(params.analysisId, decoded)
      )
        return;

      (async () => {
        try {
          const { getCode } = await import("@/api/code");
          const result = await getCode(params.analysisId, decoded);
          setCachedCode(params.analysisId, decoded, result.markdownContent);
        } catch {
          /* ignore */
        }
      })();
    });
  }, [isClickable, isFolder, node.path, params.analysisId, setCachedCode, debouncedPrefetch]);

  const handleMouseLeave = useCallback(() => {
    cancelPrefetch();
  }, [cancelPrefetch]);

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
    if (!isClickable) {
      setShowTooltip(true);
      timeoutRef.current = setTimeout(() => setShowTooltip(false), 2000);
      return;
    }
    const decoded = maybeDecode(node.path) ?? node.path;

    // URL만 변경 (상태는 ResultTabsClient에서 URL 감시하여 동기화)
    const urlParams = new URLSearchParams(searchParams.toString());
    urlParams.set("tab", "code");
    urlParams.set("filePath", decoded);
    router.push(`${pathname}?${urlParams.toString()}`, { scroll: false });
  };

  return (
    <div style={{ contentVisibility: "auto", containIntrinsicSize: "auto 32px" }}>
      <div className="relative">
        <div
          ref={itemRef}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title={node.path}
          className={`group flex items-center gap-1 px-2 py-1 pr-4 text-sm select-none ${
            isHighlighted
              ? "cursor-pointer rounded-sm bg-amber-500/15 font-semibold text-amber-400"
              : isIndicated
                ? "text-body hover:bg-hover/70 cursor-pointer"
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

          {/* 코드 요약이 있는 파일 또는 하위에 있는 폴더 표시 (파란 원) */}
          {(isIndicated || hasIndicatedChildren) && (
            <span className="ml-auto flex h-2 w-2 shrink-0 rounded-full bg-blue-400" />
          )}
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
