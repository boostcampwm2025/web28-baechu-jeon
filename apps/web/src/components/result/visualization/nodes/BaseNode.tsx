"use client";

import { useCallback } from "react";
import { Handle, Position, NodeProps, type Node } from "@xyflow/react";
import { useParams } from "next/navigation";
import { type BaseNodeData } from "@/utils/layouts/layoutSettings";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { maybeDecode } from "@/utils/url";
import { useDebouncedPrefetch } from "@/hooks/useDebouncedPrefetch";

export default function BaseNode({
  data,
  selected,
}: NodeProps<Node<BaseNodeData>>) {
  const {
    width,
    height,
    theme,
    label,
    paddingX = 16,
    paddingY = 16,
    highlightClass,
    diagramType,
    groups,
  } = data;

  const isGroupHeader = groups === "GROUP_HEADER";
  const isCategoryHeader = groups === "CATEGORY_HEADER";
  const params = useParams<{ analysisId: string }>();
  const setCachedCode = useVisualizationStore((s) => s.setCachedCode);
  const { debouncedPrefetch, cancel: cancelPrefetch } = useDebouncedPrefetch(150);

  // 하이라이트 여부
  const isHighlighted = !!highlightClass;

  const getFontSize = () => {
    if (isGroupHeader) return "48px";
    if (diagramType === "STEP1" || diagramType === "STEP2") return "26px";
    return "16px";
  };

  // 호버 시 프리패치 (디바운싱 적용)
  const handleMouseEnter = useCallback(() => {
    const path = data.path;
    const analysisId = params.analysisId;
    if (!isHighlighted || !path || !analysisId) return;

    const decoded = maybeDecode(path) ?? path;

    debouncedPrefetch(() => {
      if (useVisualizationStore.getState().getCachedCode(analysisId, decoded))
        return;

      (async () => {
        try {
          const { getCode } = await import("@/api/code");
          const result = await getCode(analysisId, decoded);
          setCachedCode(analysisId, decoded, result.markdownContent);
        } catch {
          /* ignore */
        }
      })();
    });
  }, [isHighlighted, data.path, params.analysisId, setCachedCode, debouncedPrefetch]);

  const handleMouseLeave = useCallback(() => {
    cancelPrefetch();
  }, [cancelPrefetch]);

  const baseStyle: React.CSSProperties = {
    width: `${width}px`,
    minHeight: `${height}px`,
    height: "auto",

    // 헤더 노드만 투명하게, 나머지는 테마 색상 적용
    borderColor: isGroupHeader
      ? "transparent"
      : isHighlighted
        ? undefined
        : theme.borderColor,
    backgroundColor: isGroupHeader
      ? "transparent"
      : isHighlighted
        ? undefined
        : theme.bgColor,
    color: theme.textColor,

    borderWidth: isGroupHeader ? "0px" : "2px",
    borderStyle: "solid",
    transition: "all 0.3s ease",
  };

  if (selected && !isHighlighted && !isGroupHeader) {
    baseStyle.borderColor = theme.borderColor;
    baseStyle.borderWidth = "4px";
    baseStyle.boxShadow = `0 0 25px ${theme.borderColor}`;
    baseStyle.fontWeight = "bold";
  }

  let containerClasses = `flex flex-col items-center justify-center rounded-xl shadow-lg`;
  if (highlightClass) containerClasses += ` ${highlightClass}`;

  if (isGroupHeader) {
    containerClasses = containerClasses.replace("shadow-lg", "");
  }
  const hiddenHandleStyle: React.CSSProperties = {
    visibility: "hidden",
    pointerEvents: "none",
  };

  return (
    <div
      style={baseStyle}
      className={containerClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={hiddenHandleStyle}
      />
      <div className="flex w-full flex-1 items-center justify-center text-center">
        <span
          style={{
            color: theme.textColor,
            lineHeight: 1.5,
            fontSize: getFontSize(),
            fontWeight:
              isGroupHeader || isCategoryHeader || diagramType === "STEP1"
                ? 800
                : 600,
            display: "block",
            width: "100%",
            textAlign: "center",
            paddingLeft: `${paddingX}px`,
            paddingRight: `${paddingX}px`,
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
            whiteSpace: diagramType === "STEP2" ? "nowrap" : "pre-wrap",
            wordBreak: diagramType === "STEP2" ? "keep-all" : "break-word",
            overflow: "visible",
          }}
        >
          {label}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={hiddenHandleStyle}
      />
    </div>
  );
}
