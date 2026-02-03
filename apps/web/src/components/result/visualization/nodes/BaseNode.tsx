"use client";

import { Handle, Position, NodeProps, type Node } from "@xyflow/react";
import { useParams } from "next/navigation";
import { type BaseNodeData } from "@/utils/layouts/layoutSettings";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { maybeDecode } from "@/utils/url";

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

  // 하이라이트 여부
  const isHighlighted = !!highlightClass;

  const getFontSize = () => {
    if (isGroupHeader) return "48px";
    if (diagramType === "STEP1" || diagramType === "STEP2") return "26px";
    return "16px";
  };

  // 호버 시 프리패치
  const handleMouseEnter = () => {
    if (!isHighlighted || !data.path || !params.analysisId) return;
    const decoded = maybeDecode(data.path) ?? data.path;
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
  };

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
