import dagre from "dagre";
import { ApiNode, ApiEdge } from "@/api/visualization";
import { LAYOUT_SETTINGS } from "@/utils/layouts/layoutSettings";
import { calculateTextDimensions } from "./layoutUtils";

export const layoutStep2 = (
  nodes: ApiNode[],
  edges: ApiEdge[],
  xOffset: number,
  yOffset: number,
) => {
  if (nodes.length === 0) {
    return { nodes: [], width: 0, height: 0 };
  }
  const SETTING = LAYOUT_SETTINGS.diagram2;

  // Dagre 그래프 생성
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "LR", // 왼쪽 -> 오른쪽
    nodesep: SETTING.nodeSep, // 세로 간격
    ranksep: SETTING.rankSep, // 가로 간격
    marginx: 0,
    marginy: 0,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // 노드 크기 계산 및 등록
  nodes.forEach((node) => {
    const { width } = calculateTextDimensions(node.label || "", {
      fontSize: SETTING.font.size,
      lineHeight: SETTING.font.lineHeight,

      // 줄바꿈하지 않고 너비 늘리기
      maxWidth: Infinity,
      paddingX: SETTING.font.xPadding * 2,
      minWidth: SETTING.minW,
    });

    // Dagre에 등록
    g.setNode(node.id, { width, height: SETTING.h });
  });

  // 엣지 등록
  const nodeIds = new Set(nodes.map((n) => n.id));
  edges.forEach((edge) => {
    if (nodeIds.has(edge.sourceNodeId) && nodeIds.has(edge.targetNodeId)) {
      g.setEdge(edge.sourceNodeId, edge.targetNodeId);
    }
  });

  dagre.layout(g);

  // 부모-자식 관계를 고려하여 X 좌표를 재조정
  const calculatedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    const incomingEdge = edges.find((e) => e.targetNodeId === node.id);

    let finalX: number;

    if (incomingEdge) {
      const parentId = incomingEdge.sourceNodeId;
      const parentPos = g.node(parentId);

      // 부모의 실제 오른쪽 끝 좌표 + 설정된 rankSep을 사용하여 자식의 시작점 맞추기
      const parentRight = parentPos.x + parentPos.width / 2;
      finalX = xOffset + parentRight + SETTING.rankSep;
    } else {
      finalX = xOffset + pos.x - pos.width / 2;
    }

    return {
      ...node,
      x: Math.round(finalX),
      y: Math.round(yOffset + pos.y - pos.height / 2),
      width: Math.round(pos.width),
      height: Math.round(pos.height),
    };
  });

  // 전체 크기 반환
  const graphWidth = g.graph().width || 0;
  const graphHeight = g.graph().height || 0;

  return {
    nodes: calculatedNodes,
    width: graphWidth,
    height: graphHeight,
  };
};
