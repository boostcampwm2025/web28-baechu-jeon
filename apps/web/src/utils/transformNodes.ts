import type { Node, Edge } from "@xyflow/react";
import type {
  VisualizationResponse,
  ApiNode,
  ApiEdge,
} from "@/api/visualization";
import dagre from "dagre";

interface NodeTheme {
  borderColor: string;
  bgColor: string;
  textColor: string;
}

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  contents: string;
  groups: string;
  width: number;
  height: number;
  theme: NodeTheme;
}

interface LayoutSettingItem {
  w: number;
  h: number;
  nSep: number;
  rSep: number;
  theme: NodeTheme;
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
  // Edge부터 변환
  const reactFlowEdges = getReactFlowEdges(apiResponse.edges);

  // Node는 좌표 초기화 상태에 따라 다르게 처리
  let nodesResult: {
    reactFlowNodes: Node<BaseNodeData>[];
    updatedApiNodes: ApiNode[];
  };

  if (apiResponse.layoutState === "INITIAL") {
    nodesResult = calculateLayout(apiResponse.nodes, reactFlowEdges);
  } else {
    nodesResult = transformNodes(apiResponse.nodes);
  }

  return {
    reactFlowEdges,
    reactFlowNodes: nodesResult.reactFlowNodes,
    updatedApiNodes: {
      nodes: nodesResult.updatedApiNodes,
      edges: apiResponse.edges,
    },
  };
}

// API Edge -> React Flow Edge 변환
function getReactFlowEdges(apiEdges: Record<string, ApiEdge[]>): Edge[] {
  const edges: Edge[] = [];

  Object.values(apiEdges).forEach((edgeGroup: ApiEdge[]) => {
    edgeGroup.forEach((edge) => {
      if (edge.sourceNodeId && edge.targetNodeId) {
        edges.push({
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

  return edges;
}

// 초기 레이아웃 계산
function calculateLayout(nodeGroups: Record<string, ApiNode[]>, edges: Edge[]) {
  const reactFlowNodes: Node<BaseNodeData>[] = [];
  const updatedApiNodes: ApiNode[] = [];

  const groupKeys = Object.keys(nodeGroups) as (keyof typeof nodeGroups)[];

  groupKeys.forEach((key, index) => {
    const nodesInGroup = nodeGroups[key] || [];
    if (nodesInGroup.length === 0) return;

    const xOffset = index * 1200;

    const settings: LayoutSettingItem =
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

    edges.forEach((e) => {
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

      reactFlowNodes.push(createReactFlowNode(n, finalX, finalY, settings));

      updatedApiNodes.push({
        ...n,
        x: Math.round(finalX),
        y: Math.round(finalY),
      });
    });
  });

  return { reactFlowNodes, updatedApiNodes };
}

// 단순 API Node -> React Flow Node 변환
function transformNodes(apiNodes: Record<string, ApiNode[]>) {
  const reactFlowNodes: Node<BaseNodeData>[] = [];
  const updatedApiNodes: ApiNode[] = [];

  Object.values(apiNodes)
    .flat()
    .forEach((n) => {
      const settings: LayoutSettingItem =
        n.diagramType === "STEP1"
          ? LAYOUT_SETTINGS.diagram1
          : LAYOUT_SETTINGS.diagram2;

      reactFlowNodes.push(
        createReactFlowNode(n, Number(n.x), Number(n.y), settings),
      );

      updatedApiNodes.push(n);
    });

  return { reactFlowNodes, updatedApiNodes };
}

// React Flow 노드 객체 생성
function createReactFlowNode(
  n: ApiNode,
  x: number,
  y: number,
  settings: LayoutSettingItem,
): Node<BaseNodeData> {
  return {
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
    position: { x, y },
  };
}
