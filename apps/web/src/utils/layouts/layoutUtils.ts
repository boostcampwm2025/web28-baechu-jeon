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

interface TextDimensionOptions {
  fontSize?: number; // 기본 16px
  lineHeight?: number; // 기본 1.5
  maxWidth?: number; // 이 너비를 넘으면 줄바꿈 (없으면 한 줄)
  paddingX?: number; // 좌우 패딩 합
  paddingY?: number; // 상하 패딩 합
  minWidth?: number; // 최소 너비 보장
  minHeight?: number; // 최소 높이 보장
}

// 노드의 { width, height }를 계산하는 함수
export const calculateTextDimensions = (
  text: string,
  options: TextDimensionOptions = {},
) => {
  const {
    fontSize = 16,
    lineHeight = 1.5,
    maxWidth = Infinity,
    paddingX = 40,
    paddingY = 40,
    minWidth = 0,
    minHeight = 0,
  } = options;

  if (!text) return { width: minWidth, height: minHeight };

  let totalLength = 30;
  for (const char of text) {
    totalLength += /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(char) ? fontSize : fontSize * 0.7; // 영문 비율 조정
  }

  // 너비와 높이 결정 로직
  let finalWidth = 0;
  let finalHeight = 0;

  if (totalLength <= maxWidth) {
    // 제한 너비보다 짧은 경우 -> 한 줄 표시
    // 텍스트 길이 + 패딩
    finalWidth = totalLength + paddingX;
    finalHeight = fontSize * lineHeight + paddingY;
  } else {
    // 제한 너비보다 긴 경우 -> 줄바꿈 발생
    finalWidth = maxWidth + paddingX; // 너비는 최대폭으로 고정

    // 줄 수 계산: (전체 길이 / 한 줄에 들어가는 길이)
    const lines = Math.ceil(totalLength / maxWidth);
    finalHeight = lines * fontSize * lineHeight + paddingY + 10;
  }

  // 노드 크기 반환
  return {
    width: Math.max(minWidth, Math.round(finalWidth)),
    height: Math.max(minHeight, Math.round(finalHeight)),
  };
};
