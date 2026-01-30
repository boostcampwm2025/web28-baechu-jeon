import { Node } from "@xyflow/react";
import { ApiNode } from "@/api/visualization";
import { BaseNodeData, NodeTheme } from "./layoutSettings";

// React Flow 노드 객체 생성 헬퍼
export function createReactFlowNode(
  n: ApiNode,
  x: number,
  y: number,
  settings: { w: number; h: number; theme: NodeTheme },
): Node<BaseNodeData> {
  return {
    id: n.id,
    type: "baseNode",
    data: {
      label: n.label,
      contents: n.contents || "",
      groups: n.groups || "",
      width: settings.w,
      height: settings.h,
      theme: settings.theme,
      diagramType: n.diagramType,
      relatedNodeIds: n.relatedNodeIds || [],
      relatedPaths: n.relatedPaths || [],
      type: n.type,
      path: n.path,
    },
    position: { x, y },
  };
}

export function calculateTextDimensions(
  text: string,
  targetWidth: number = 300,
  fontSize: number = 20,
) {
  let estimatedTotalLength = 0;
  for (const char of text) {
    estimatedTotalLength += /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(char)
      ? fontSize
      : fontSize * 0.7; // 영문 비율 조정
  }

  const availableWidth = targetWidth - 50;
  const lines = Math.ceil(estimatedTotalLength / availableWidth);

  const lineHeight = fontSize * 1.6;
  const verticalPadding = 70;

  const height = Math.max(90, lines * lineHeight + verticalPadding);

  return { width: targetWidth, height };
}
