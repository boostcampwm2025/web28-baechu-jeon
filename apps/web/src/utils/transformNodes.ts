import type { Node, Edge } from "@xyflow/react";
import type { VisualizationResponse, ApiNode } from "@/api/visualization";
import dagre from "dagre";
import { VisualizationResponse, ApiNode, ApiEdge } from "@/api/visualization";

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  contents: string;
  groups: string;
  width: number;
  height: number;
  theme: {
    borderColor: string;
    bgColor: string;
    textColor: string;
  };
}

const LAYOUT_SETTINGS = {
  diagram1: {
    w: 800,
    h: 160,
    nSep: 100,
    rSep: 150,
    theme: {
      borderColor: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      textColor: "#60a5fa",
    },
  },
  diagram2: {
    w: 220,
    h: 60,
    nSep: 120,
    rSep: 100,
    theme: {
      borderColor: "#a855f7",
      bgColor: "rgba(168, 85, 247, 0.1)",
      textColor: "#c084fc",
    },
  },
} as const;

export function transformApiToReactFlow(apiResponse: VisualizationResponse) {
  const reactFlowNodes: Node<BaseNodeData>[] = [];
  const allUpdatedApiNodes: ApiNode[] = [];
  const reactFlowEdges: Edge[] = [];

  Object.values(apiResponse.edges).forEach((edgeGroup: ApiEdge[]) => {
    edgeGroup.forEach((edge) => {
      if (edge.source && edge.target) {
        reactFlowEdges.push({
          id: String(edge.id),
          source: edge.source,
          target: edge.target,
          label: edge.label,
          animated: edge.type === "DASHED",
          style: { stroke: "#475569", strokeWidth: 2 },
        });
      }
    });
  });

  if (apiResponse.layoutState === "INITIAL") {
    const nodeGroups = apiResponse.nodes;
    const groupKeys = Object.keys(nodeGroups);

    groupKeys.forEach((key, index) => {
      const nodesInGroup = nodeGroups[key] || [];
      if (nodesInGroup.length === 0) return;

      // STEP1, STEP2 순서대로 가로로 1200px씩 띄워서 배치
      const xOffset = index * 1200;

      const settings =
        key === "STEP1" ? LAYOUT_SETTINGS.diagram1 : LAYOUT_SETTINGS.diagram2;

      const g = new dagre.graphlib.Graph();
      g.setGraph({
        rankdir: "TB",
        nodesep: settings.nSep,
        ranksep: settings.rSep,
      });
      g.setDefaultEdgeLabel(() => ({}));

      nodesInGroup.forEach((n) => {
        g.setNode(n.id, { width: settings.w, height: settings.h });
      });

      reactFlowEdges.forEach((e) => {
        if (
          nodesInGroup.some((n) => n.id === e.source) &&
          nodesInGroup.some((n) => n.id === e.target)
        ) {
          g.setEdge(e.source, e.target);
        }
      });

      dagre.layout(g);

      nodesInGroup.forEach((n) => {
        const pos = g.node(n.id);
        const finalX = pos.x - settings.w / 2 + xOffset;
        const finalY = pos.y - settings.h / 2;

        reactFlowNodes.push({
          id: n.id,
          type: "baseNode",
          data: {
            label: n.label,
            contents: n.contents,
            groups: n.group || "",
            width: settings.w,
            height: settings.h,
            theme: settings.theme,
          },
          position: { x: finalX, y: finalY },
        });

        allUpdatedApiNodes.push({
          ...n,
          x: Math.round(finalX),
          y: Math.round(finalY),
        });
      });
    });
  } else {
    Object.values(apiResponse.nodes)
      .flat()
      .forEach((n) => {
        const settings =
          n.diagramType === "STEP1"
            ? LAYOUT_SETTINGS.diagram1
            : LAYOUT_SETTINGS.diagram2;

        reactFlowNodes.push({
          id: n.id,
          type: "baseNode",
          data: {
            label: n.label,
            contents: n.contents,
            groups: n.group || "",
            width: settings.w,
            height: settings.h,
            theme: settings.theme,
          },
          position: { x: Number(n.x), y: Number(n.y) },
        });

        allUpdatedApiNodes.push(n);
      });
  }

  return {
    reactFlowNodes,
    reactFlowEdges,
    updatedApiNodes: {
      nodes: allUpdatedApiNodes,
      edges: apiResponse.edges,
    },
  };
}
