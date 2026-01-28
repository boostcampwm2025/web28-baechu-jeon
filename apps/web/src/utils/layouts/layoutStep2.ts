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
    rankdir: "TB",
    nodesep: settings.nSep,
    ranksep: settings.rSep,
  });
  g.setDefaultEdgeLabel(() => ({}));

  apiNodes.forEach((n) => {
    g.setNode(n.id, { width: settings.w, height: settings.h });
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

  // 그래프 전체 너비 구하기 (다음 단계 오프셋용)
  const graphWidth = g.graph().width || 500;

  apiNodes.forEach((n) => {
    const pos = g.node(n.id);
    const finalX = pos.x - settings.w / 2 + xOffset;
    const finalY = pos.y - settings.h / 2 + yOffset;

    reactFlowNodes.push(createReactFlowNode(n, finalX, finalY, settings));

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
