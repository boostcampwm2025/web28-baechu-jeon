import { Node, Edge } from "@xyflow/react";
import dagre from "dagre";
import {
  VisualizationResponse,
  ApiNode,
  InitialNodes,
} from "@/api/visualization";

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
  diagram3: {
    w: 250,
    h: 60,
    nSep: 80,
    rSep: 80,
    theme: {
      borderColor: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      textColor: "#34d399",
    },
  },
} as const;

export function transformApiToReactFlow(apiResponse: VisualizationResponse) {
  const reactFlowNodes: Node<BaseNodeData>[] = [];
  const allUpdatedApiNodes: ApiNode[] = [];

  const reactFlowEdges: Edge[] = apiResponse.edges
    .filter((edge) => edge.source && edge.target)
    .map((edge) => ({
      id: String(edge.id),
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.type === "DASHED",
      style: { stroke: "#475569", strokeWidth: 2 },
    }));

  if (apiResponse.layoutState === "INITIAL") {
    const diagrams = apiResponse.nodes as InitialNodes;

    const xOffsets = {
      diagram1: 0,
      diagram2: 1200, // diagram1 오른쪽에 배치
      diagram3: 2400, // diagram2 오른쪽에 배치
    };

    (["diagram1", "diagram2", "diagram3"] as const).forEach((key) => {
      const nodesInGroup = diagrams[key] || [];
      if (nodesInGroup.length === 0) return;

      const settings = LAYOUT_SETTINGS[key];
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

      apiResponse.edges.forEach((e) => {
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
        const finalX = pos.x - settings.w / 2 + xOffsets[key];
        const finalY = pos.y - settings.h / 2;

        reactFlowNodes.push({
          id: n.id,
          type: "baseNode",
          data: {
            label: n.label,
            contents: n.contents,
            groups: n.group,
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
    // 기존 LAYOUTED 로직 유지
    const nodes = apiResponse.nodes as ApiNode[];
    nodes.forEach((n) => {
      let groupKey: keyof typeof LAYOUT_SETTINGS = "diagram1";

      if (n.group?.includes("1") || n.group === "diagram1") {
        groupKey = "diagram1";
      } else if (n.group?.includes("2") || n.group === "diagram2") {
        groupKey = "diagram2";
      } else if (n.group?.includes("3") || n.group === "diagram3") {
        groupKey = "diagram3";
      }

      const settings = LAYOUT_SETTINGS[groupKey];

      reactFlowNodes.push({
        id: n.id,
        type: "baseNode",
        data: {
          label: n.label,
          contents: n.contents,
          groups: n.group,
          width: settings.w,
          height: settings.h,
          theme: settings.theme,
        },
        position: { x: Number(n.x) || 0, y: Number(n.y) || 0 },
      });
      allUpdatedApiNodes.push(n);
    });
  }

  return {
    reactFlowNodes,
    reactFlowEdges,
    updatedApiNodes: { nodes: allUpdatedApiNodes, edges: apiResponse.edges },
  };
}
