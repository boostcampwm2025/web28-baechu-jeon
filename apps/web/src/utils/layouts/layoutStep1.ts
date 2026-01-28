import { Node } from "@xyflow/react";
import dagre from "dagre";
import { ApiNode } from "@/api/visualization";
import { BaseNodeData, LAYOUT_SETTINGS } from "./layoutSettings";
import { calculateTextDimensions } from "./layoutUtils";

export function layoutStep1(
  apiNodes: ApiNode[],
  xOffset: number,
  yOffset: number,
  maxWidth: number,
  maxHeight: number,
) {
  // 1. 텍스트 길이에 맞춰 박스 크기 계산
  let calculatedMaxWidth = maxWidth;
  let calculatedMaxHeight = maxHeight;

  apiNodes.forEach((node) => {
    const dims = calculateTextDimensions(node.label);
    calculatedMaxWidth = Math.max(calculatedMaxWidth, dims.width + 50);
    calculatedMaxHeight = Math.max(calculatedMaxHeight, dims.height);
  });

  const NODE_W = calculatedMaxWidth;
  const NODE_H = calculatedMaxHeight;

  // 2. Dagre 그래프 생성
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB", // 위에서 아래로
    nodesep: 50, // 노드 간 간격 (가로) - 증가
    ranksep: 80, // 랭크 간 간격 (세로) - 대폭 증가
    align: "UL", // 정렬 방식 (UL=상단좌측 기준, 중앙 정렬 효과)
    marginx: 40, // X축 패딩
    marginy: 60, // Y축 패딩 - 증가
  });
  g.setDefaultEdgeLabel(() => ({}));

  const groupId = "group-STEP1";
  const headerId = `${groupId}-header`;
  const HEADER_H = 50;

  // (1) 아이템 노드들만 Dagre에 추가 (헤더는 제외!)
  let previousNodeId: string | null = null;

  apiNodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_W, height: NODE_H });

    // 순서 강제를 위해 가상의 엣지 연결 (화면엔 안 그림)
    if (previousNodeId) {
      g.setEdge(previousNodeId, node.id);
    }
    previousNodeId = node.id;
  });

  // 3. 레이아웃 계산 실행!
  dagre.layout(g);

  // 4. 결과 노드 생성
  const groupNodes: Node<BaseNodeData>[] = [];
  const childNodes: Node<BaseNodeData>[] = [];
  const updatedApiNodes: ApiNode[] = [];

  // Dagre가 계산한 전체 그래프 크기
  const graphWidth = g.graph().width || 500;
  const graphHeight = g.graph().height || 500;

  // (1) 배경 그룹 박스 (Dagre가 계산한 크기 그대로 사용)
  groupNodes.push({
    id: groupId,
    type: "baseNode",
    data: {
      label: "",
      contents: "",
      groups: "GROUP_PARENT",
      width: graphWidth,
      height: graphHeight,
      theme: LAYOUT_SETTINGS.diagram1Group.theme,
      diagramType: "STEP1",
    },
    position: { x: xOffset, y: yOffset },
    style: { zIndex: -1 },
  });

  // ✅ 수정: 헤더를 그룹 외부 독립 노드로 변경
  groupNodes.push({
    id: headerId,
    type: "baseNode",
    // parentId 제거 - 독립 노드로 만듦
    draggable: false, // 드래그 비활성화
    data: {
      label: "User Stories & Features",
      contents: "",
      groups: "GROUP_HEADER",
      width: graphWidth - 80,
      height: HEADER_H,
      theme: {
        borderColor: "transparent",
        bgColor: "transparent",
        textColor: LAYOUT_SETTINGS.diagram1Group.theme.borderColor,
      },
      diagramType: "STEP1",
    },
    // 절대 좌표로 배치 (그룹 상단 위에 고정)
    position: {
      x: xOffset + 40,
      y: yOffset - HEADER_H - 30, // 그룹 위에 여유있게 배치 (10 -> 30)
    },
    style: {
      zIndex: 10, // 최상위로
      fontWeight: "bold",
      fontSize: "1.5rem",
      textAlign: "center",
    },
  });

  // 2-2. 아이템 노드 배치
  apiNodes.forEach((node) => {
    const pos = g.node(node.id);

    // 그룹 내부 상대 좌표
    const relativeX = pos.x - NODE_W / 2;
    const relativeY = pos.y - NODE_H / 2;

    childNodes.push({
      id: node.id,
      type: "baseNode",
      parentId: groupId,
      extent: "parent",
      data: {
        label: node.label,
        contents: node.contents || "",
        groups: "STEP1_CHILD",
        width: NODE_W,
        height: NODE_H,
        theme: LAYOUT_SETTINGS.diagram1.theme,
        diagramType: "STEP1",
        relatedFolders: node.relatedFolders || [],
      },
      position: { x: relativeX, y: relativeY },
    });

    // API 업데이트용 절대 좌표
    updatedApiNodes.push({
      ...node,
      x: Math.round(xOffset + relativeX),
      y: Math.round(yOffset + relativeY),
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
