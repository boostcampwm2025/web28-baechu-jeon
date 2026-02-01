import { Node } from "@xyflow/react";
import { ApiNode } from "@/api/visualization";
import { BaseNodeData, LAYOUT_SETTINGS } from "./layoutSettings";
import { calculateTextDimensions } from "./layoutUtils";

// 레이아웃 상수
const STEP1_CONFIG = {
  NODE_MIN_W: 600,
  NODE_MAX_W: 800,
  NODE_GAP: 100,
  PADDING: { TOP: 70, SIDE: 80 },
  LABEL_OFFSET_Y: -120,
  LABEL_HEIGHT: 50,
};

export function layoutStep1(
  apiNodes: ApiNode[],
  xOffset: number,
  yOffset: number,
  maxWidth: number,
  maxHeight: number,
) {
  // 개별 노드 및 전체 그룹 크기 계산
  const { nodeW, nodeH, graphWidth, graphHeight } = calculateStep1Dimensions(
    apiNodes,
    maxWidth,
    maxHeight,
  );

  const groupNodes: Node<BaseNodeData>[] = [];
  const childNodes: Node<BaseNodeData>[] = [];
  const updatedApiNodes: ApiNode[] = [];

  const groupId = "group-STEP1";

  // 그룹 배경 노드 생성
  groupNodes.push(
    createContainerNode(groupId, xOffset, yOffset, graphWidth, graphHeight),
  );

  // 라벨 노드 생성
  groupNodes.push(createHeaderLabel(groupId, graphWidth));

  // 다이어그램1 노드 순회하면서 배치
  apiNodes.forEach((node, index) => {
    const relX = STEP1_CONFIG.PADDING.SIDE;
    const relY =
      STEP1_CONFIG.PADDING.TOP + index * (nodeH + STEP1_CONFIG.NODE_GAP);

    // React Flow용 노드
    childNodes.push({
      id: node.id,
      type: "baseNode",
      parentId: groupId,
      extent: "parent",
      position: { x: relX, y: relY },
      data: {
        ...node,
        width: nodeW,
        height: nodeH,
        theme: LAYOUT_SETTINGS.diagram1.theme,
        diagramType: "STEP1",
      },
    });

    // DB 저장용 좌표 업데이트
    updatedApiNodes.push({
      ...node,
      x: Math.round(xOffset + relX),
      y: Math.round(yOffset + relY),
    });
  });

  return {
    groupNodes,
    childNodes,
    apiNodes: updatedApiNodes,
    width: graphWidth,
    height: graphHeight,
  };
}

function calculateStep1Dimensions(
  nodes: ApiNode[],
  defaultW: number,
  defaultH: number,
) {
  if (nodes.length === 0)
    return {
      nodeW: defaultW,
      nodeH: defaultH,
      graphWidth: defaultW,
      graphHeight: defaultH,
    };

  // 제일 긴 노드 하나 찾기
  const longestNode = nodes.reduce((prev, curr) =>
    curr.label.length > prev.label.length ? curr : prev,
  );

  const targetW = Math.max(
    STEP1_CONFIG.NODE_MIN_W,
    Math.min(longestNode.label.length * 15, STEP1_CONFIG.NODE_MAX_W),
  );

  const { width: nodeW, height: nodeH } = calculateTextDimensions(
    longestNode.label,
    targetW,
    24,
  );

  // 결과값을 바탕으로 전체 크기 산출
  const graphWidth = nodeW + STEP1_CONFIG.PADDING.SIDE * 2;
  const graphHeight =
    nodes.length * nodeH +
    (nodes.length - 1) * STEP1_CONFIG.NODE_GAP +
    STEP1_CONFIG.PADDING.TOP * 2;

  return { nodeW, nodeH, graphWidth, graphHeight };
}

function createContainerNode(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
): Node<BaseNodeData> {
  return {
    id,
    type: "baseNode",
    position: { x, y },
    data: {
      label: "",
      width: w,
      height: h,
      theme: LAYOUT_SETTINGS.diagram1.theme,
      diagramType: "STEP1",
    },
    style: { zIndex: -1, width: w, height: h },
  };
}

function createHeaderLabel(parentId: string, w: number): Node<BaseNodeData> {
  return {
    id: `${parentId}-label`,
    type: "baseNode",
    parentId,
    position: { x: 0, y: STEP1_CONFIG.LABEL_OFFSET_Y },
    data: {
      label: "User Stories & Features",
      width: w,
      height: STEP1_CONFIG.LABEL_HEIGHT,
      theme: {
        borderColor: "transparent",
        bgColor: "transparent",
        textColor: LAYOUT_SETTINGS.diagram1.theme.borderColor,
      },
      diagramType: "STEP1",
      groups: "GROUP_HEADER",
    },
  };
}
