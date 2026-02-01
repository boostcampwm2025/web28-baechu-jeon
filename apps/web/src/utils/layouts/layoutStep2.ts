import { Node, Edge } from "@xyflow/react";
import dagre from "dagre";
import { ApiNode } from "@/api/visualization";
import { BaseNodeData, LAYOUT_SETTINGS } from "./layoutSettings";
import { createReactFlowNode } from "./layoutUtils";

export function layoutStep2(
  apiNodes: ApiNode[],
  edges: Edge[],
  xOffset: number,
  yOffset: number,
) {
  const reactFlowNodes: Node<BaseNodeData>[] = [];
  const updatedApiNodes: ApiNode[] = [];

  const settings = LAYOUT_SETTINGS.diagram2;

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "LR",
    nodesep: settings.nSep,
    ranksep: settings.rSep,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // 각 노드의 실제 너비를 저장할 객체
  const nodeDimensions: Record<string, { w: number; h: number }> = {};

  apiNodes.forEach((n) => {
    let calculatedWidth = settings.w as number;
    const charWidth = 18;
    const padding = 50;

    calculatedWidth = Math.max(
      settings.w,
      (n.label?.length || 0) * charWidth + padding,
    );

    const fixedHeight = settings.h;
    nodeDimensions[n.id] = { w: calculatedWidth, h: fixedHeight };
    g.setNode(n.id, { width: calculatedWidth, height: fixedHeight });
  });
  edges.forEach((e) => {
    if (
      apiNodes.some((n) => n.id === e.source) &&
      apiNodes.some((n) => n.id === e.target)
    ) {
      g.setEdge(e.source, e.target);
    }
  });

  dagre.layout(g);

  const graphWidth = g.graph().width || 500;

  apiNodes.forEach((n) => {
    const pos = g.node(n.id);
    const { w, h } = nodeDimensions[n.id];

    // 이 노드로 들어오는 엣지를 찾아 부모 노드를 확인
    const incomingEdge = edges.find((e) => e.target === n.id);

    let finalX: number;

    if (incomingEdge) {
      // 부모 노드의 정보를 가져옴
      const parentPos = g.node(incomingEdge.source);
      const parentW = nodeDimensions[incomingEdge.source]?.w || settings.w;

      // 부모의 끝 지점(오른쪽)에서 일정 간격만큼 떨어진 곳을 시작점으로 설정
      // 같은 부모를 둔 자식들은 같은 X축에서 시작
      const parentRightEdge = parentPos.x + parentW / 2;
      finalX = parentRightEdge + settings.rSep + xOffset;
    } else {
      // 부모가 없는 최상위 노드들의 경우
      finalX = pos.x - w / 2 + xOffset;
    }

    const finalY = pos.y - h / 2 + yOffset;

    const nodeSettings = { ...settings, w: w, h: h };
    reactFlowNodes.push(createReactFlowNode(n, finalX, finalY, nodeSettings));
    updatedApiNodes.push({
      ...n,
      x: Math.round(finalX),
      y: Math.round(finalY),
    });
  });

  return {
    reactFlowNodes,
    apiNodes: updatedApiNodes,
    width: graphWidth,
  };
}
