import { Node, Edge } from "@xyflow/react";
import { VisualizationResponse, ApiNode, ApiEdge } from "@/api/visualization";
import { BaseNodeData, LAYOUT_SETTINGS } from "./layouts/layoutSettings";
import { createReactFlowNode } from "./layouts/layoutUtils";
import { layoutStep1 } from "./layouts/layoutStep1";
import { layoutStep2 } from "./layouts/layoutStep2";
import { layoutStep3 } from "./layouts/layoutStep3";

export type { BaseNodeData };

export function transformApiToReactFlow(apiResponse: VisualizationResponse) {
  const reactFlowEdges = getReactFlowEdges(apiResponse.edges);
  let layoutEdges: Edge[] = [];

  let nodesResult: {
    reactFlowNodes: Node<BaseNodeData>[];
    updatedApiNodes: ApiNode[];
    generatedEdges?: Edge[];
  };

  if (apiResponse.layoutState === "INITIAL") {
    const calcResult = calculateLayout(apiResponse.nodes, reactFlowEdges);
    nodesResult = {
      reactFlowNodes: calcResult.reactFlowNodes,
      updatedApiNodes: calcResult.updatedApiNodes,
    };
    if (calcResult.generatedEdges) {
      layoutEdges = calcResult.generatedEdges;
    }
  } else {
    nodesResult = transformExistingNodes(apiResponse.nodes);
  }

  const finalEdges = [...reactFlowEdges, ...layoutEdges];

  return {
    reactFlowEdges: finalEdges,
    reactFlowNodes: nodesResult.reactFlowNodes,
    updatedApiNodes: {
      nodes: nodesResult.updatedApiNodes,
      edges: apiResponse.edges,
    },
  };
}

function calculateLayout(nodeGroups: Record<string, ApiNode[]>, edges: Edge[]) {
  const reactFlowNodes: Node<BaseNodeData>[] = [];
  const updatedApiNodes: ApiNode[] = [];
  const generatedEdges: Edge[] = [];

  const TOP_MARGIN = 100;

  // STEP1 배치
  let step1Width = 0;
  if (nodeGroups.STEP1) {
    // yOffset에 TOP_MARGIN 전달
    const s1 = layoutStep1(nodeGroups.STEP1, 0, TOP_MARGIN, 600, 100);
    reactFlowNodes.push(...s1.groupNodes, ...s1.childNodes);
    updatedApiNodes.push(...s1.apiNodes);
    step1Width = s1.width;
  }

  // STEP2 배치 (STEP1 우측)
  const STEP1_GAP = 200;
  const step2X = step1Width + STEP1_GAP;
  let step2Width = 0;

  if (nodeGroups.STEP2) {
    // STEP1과 높이 맞춤
    const s2 = layoutStep2(nodeGroups.STEP2, edges, step2X, TOP_MARGIN);
    reactFlowNodes.push(...s2.reactFlowNodes);
    updatedApiNodes.push(...s2.apiNodes);
    step2Width = s2.width;
  }

  // STEP3 배치 (STEP2 우측)
  const STEP2_GAP = 200;
  const validStep2Width = step2Width > 0 ? step2Width : 500;
  const step3X = step2X + validStep2Width + STEP2_GAP;

  if (nodeGroups.STEP3) {
    const s3 = layoutStep3(nodeGroups.STEP3, step3X, TOP_MARGIN);

    reactFlowNodes.push(...s3.groupNodes, ...s3.childNodes);
    updatedApiNodes.push(...s3.apiNodes);

    if (s3.generatedEdges) {
      generatedEdges.push(...s3.generatedEdges);
    }
  }

  return { reactFlowNodes, updatedApiNodes, generatedEdges };
}

function transformExistingNodes(apiNodes: Record<string, ApiNode[]>) {
  const reactFlowNodes: Node<BaseNodeData>[] = [];
  const updatedApiNodes: ApiNode[] = [];

  Object.values(apiNodes)
    .flat()
    .forEach((n) => {
      let settings;
      if (n.diagramType === "STEP1") settings = LAYOUT_SETTINGS.diagram1;
      else if (n.diagramType === "STEP2") settings = LAYOUT_SETTINGS.diagram2;
      else settings = LAYOUT_SETTINGS.diagram3Child;

      reactFlowNodes.push(
        createReactFlowNode(n, Number(n.x), Number(n.y), settings),
      );
      updatedApiNodes.push(n);
    });

  return { reactFlowNodes, updatedApiNodes };
}

function getReactFlowEdges(apiEdges: ApiEdge[]): Edge[] {
  if (!apiEdges) return [];

  return apiEdges
    .filter((edge) => edge.sourceNodeId && edge.targetNodeId)
    .map((edge) => ({
      id: String(edge.id),
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      style: { stroke: "#475569", strokeWidth: 5 },
    }));
}
