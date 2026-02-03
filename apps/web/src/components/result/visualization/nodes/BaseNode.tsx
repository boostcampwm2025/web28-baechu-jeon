"use client";

import { Handle, Position, NodeProps, type Node } from "@xyflow/react";
import { type BaseNodeData } from "@/utils/layouts/layoutSettings";

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
  } = data;
  // 하이라이트 여부
  const isHighlighted = !!highlightClass;

  const getFontSize = () => {
    if (diagramType === "STEP1" || diagramType === "STEP2") return "1.6rem";
    return "1.2rem";
  };

  const baseStyle: React.CSSProperties = {
    width: `${width}px`,
    minHeight: `${height}px`,
    height: "auto",
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
  }

  let containerClasses = `flex flex-col items-center justify-center rounded-xl shadow-lg`;
  if (highlightClass) containerClasses += ` ${highlightClass}`;

  const hiddenHandleStyle: React.CSSProperties = {
    visibility: "hidden",
    pointerEvents: "none",
  };

  return (
    <div style={baseStyle} className={containerClasses}>
      <Handle
        type="target"
        position={Position.Left}
        style={hiddenHandleStyle}
      />
      <div className="flex w-full flex-1 items-center justify-center p-4 text-center">
        <span
          style={{
            color: theme.textColor,
            lineHeight: 1.5,
            fontSize: getFontSize(),
            fontWeight: diagramType === "STEP1" ? 800 : 600,
            whiteSpace: "pre-wrap",
            display: "block",
            width: "100%",
            textAlign: "center",
            paddingLeft: `${paddingX}px`,
            paddingRight: `${paddingX}px`,
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
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
