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
  const { width, height, theme, label, highlightClass, diagramType } = data;
  const params = useParams<{ analysisId: string }>();
  const setCachedCode = useVisualizationStore((s) => s.setCachedCode);

  // 하이라이트 여부
  const isHighlighted = !!highlightClass;

  const getFontSize = () => {
    if (diagramType === "STEP1" || diagramType === "STEP2") return "1.6rem";
    return "1.2rem";
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
    height: `${height}px`,
    borderColor: isHighlighted ? undefined : theme.borderColor,
    backgroundColor: isHighlighted ? undefined : theme.bgColor,
    color: theme.textColor,
    borderWidth: "2px",
    borderStyle: "solid",
    transition: "all 0.3s ease",
  };

  if (selected && !isHighlighted) {
    baseStyle.borderColor = theme.borderColor;
    baseStyle.borderWidth = "4px";
    baseStyle.boxShadow = `0 0 25px ${theme.borderColor}`;
    baseStyle.fontWeight = "bold";
    baseStyle.zIndex = 50;
  }

  let containerClasses = `flex flex-col items-center justify-center rounded-xl px-6 py-4 shadow-lg`;
  if (highlightClass) containerClasses += ` ${highlightClass}`;

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
      <div className="flex h-full w-full items-center justify-center overflow-hidden p-2 text-center">
        <span
          style={{
            color: theme.textColor,
            wordBreak: "keep-all",
            lineHeight: 1.5,
            fontSize: getFontSize(),
            fontWeight: diagramType === "STEP1" ? 800 : 600,
            whiteSpace: "pre-wrap",
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
