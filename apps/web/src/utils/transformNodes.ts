import type { Node, Edge } from "@xyflow/react";
import type {
  VisualizationResponse,
  ApiNode,
  ApiEdge,
} from "@/api/visualization";
import dagre from "dagre";

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
      if (edge.sourceNodeId && edge.targetNodeId) {
        reactFlowEdges.push({
          id: String(edge.id),
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          label: edge.label,
          animated: edge.type === "DASHED",
          style: { stroke: "#475569", strokeWidth: 2 },
        });
      }
    });
  });

  if (apiResponse.layoutState === "INITIAL") {
    const nodeGroups = apiResponse.nodes;
    // key를 string이 아닌 정확한 타입으로 제한 (STEP1 | STEP2)
    const groupKeys = Object.keys(nodeGroups) as (keyof typeof nodeGroups)[];

    groupKeys.forEach((key, index) => {
      const nodesInGroup = nodeGroups[key] || [];
      if (nodesInGroup.length === 0) return;

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

      // n에 ApiNode 타입 명시
      nodesInGroup.forEach((n: ApiNode) => {
        g.setNode(n.id, { width: settings.w, height: settings.h });
      });

      reactFlowEdges.forEach((e) => {
        if (
          nodesInGroup.some((n: ApiNode) => n.id === e.source) &&
          nodesInGroup.some((n: ApiNode) => n.id === e.target)
        ) {
          g.setEdge(e.source, e.target);
        }
      });

      dagre.layout(g);

      nodesInGroup.forEach((n: ApiNode) => {
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
      .forEach((n: ApiNode) => {
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
