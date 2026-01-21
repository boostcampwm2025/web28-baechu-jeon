import type { Node } from "@xyflow/react";
import type { VisualizationResponse, ApiNode } from "@/api/visualization";
import dagre from "dagre";

// 1. 상수
const COLOR_PALETTE = [
  {
    name: "blue",
    border: "border-blue-500",
    bg: "bg-blue-500",
    text: "text-blue-400",
  },
  {
    name: "green",
    border: "border-green-500",
    bg: "bg-green-500",
    text: "text-green-400",
  },
  {
    name: "purple",
    border: "border-purple-500",
    bg: "bg-purple-500",
    text: "text-purple-400",
  },
  {
    name: "orange",
    border: "border-orange-500",
    bg: "bg-orange-500",
    text: "text-orange-400",
  },
  {
    name: "yellow",
    border: "border-yellow-500",
    bg: "bg-yellow-500",
    text: "text-yellow-400",
  },
  {
    name: "pink",
    border: "border-pink-500",
    bg: "bg-pink-500",
    text: "text-pink-400",
  },
  {
    name: "cyan",
    border: "border-cyan-500",
    bg: "bg-cyan-500",
    text: "text-cyan-400",
  },
  {
    name: "red",
    border: "border-red-500",
    bg: "bg-red-500",
    text: "text-red-400",
  },
];

const NODE_CONFIG = {
  folderWidth: 280,
  folderHeight: 70,
  groupPadding: 40,
  groupHeaderHeight: 40,
};

// 내부 레이아웃 결과 저장을 위한 타입
interface LayoutInfo {
  width: number;
  height: number;
  nodes: { id: string; x: number; y: number }[];
}

/**
 * 그룹 내 노드들의 상대적 위치와 그룹의 전체 크기를 계산
 */
function calculateInnerLayout(nodesInGroup: ApiNode[]): LayoutInfo {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 20, ranksep: 30 });
  g.setDefaultEdgeLabel(() => ({}));

  nodesInGroup.forEach((node) => {
    g.setNode(node.id, {
      width: NODE_CONFIG.folderWidth,
      height: NODE_CONFIG.folderHeight,
    });
  });

  dagre.layout(g);

  let maxX = 0;
  let maxY = 0;
  const positions = g.nodes().map((id) => {
    const n = g.node(id);
    maxX = Math.max(maxX, n.x + NODE_CONFIG.folderWidth / 2);
    maxY = Math.max(maxY, n.y + NODE_CONFIG.folderHeight / 2);
    return { id, x: n.x, y: n.y };
  });

  return {
    width: maxX + NODE_CONFIG.groupPadding * 2,
    height: maxY + NODE_CONFIG.groupPadding + NODE_CONFIG.groupHeaderHeight,
    nodes: positions,
  };
}

export function transformApiToReactFlow(
  apiResponse: VisualizationResponse,
): Node[] {
  // 1. 그룹핑 및 내부 레이아웃 미리 계산
  const groupMap: Record<string, { apiNodes: ApiNode[]; layout?: LayoutInfo }> =
    {};
  apiResponse.nodes.forEach((node) => {
    if (!groupMap[node.group]) groupMap[node.group] = { apiNodes: [] };
    groupMap[node.group].apiNodes.push(node);
  });

  Object.keys(groupMap).forEach((groupName) => {
    groupMap[groupName].layout = calculateInnerLayout(
      groupMap[groupName].apiNodes,
    );
  });

  // 2. 외부(그룹 간) 레이아웃 계산
  const groupGraph = new dagre.graphlib.Graph();
  groupGraph.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 80 });

  Object.entries(groupMap).forEach(([name, data]) => {
    groupGraph.setNode(name, {
      width: data.layout!.width,
      height: data.layout!.height,
    });
  });

  dagre.layout(groupGraph);

  // 3. 최종노드 생성
  const reactFlowNodes: Node[] = [];

  Object.keys(groupMap).forEach((groupName, idx) => {
    const groupData = groupMap[groupName];
    const groupPos = groupGraph.node(groupName);
    const layout = groupData.layout!;
    const colors = COLOR_PALETTE[idx % COLOR_PALETTE.length];

    const groupX = groupPos.x - layout.width / 2;
    const groupY = groupPos.y - layout.height / 2;

    // 그룹 노드 추가
    const groupNodeId = `group-${groupName}`;
    reactFlowNodes.push({
      id: groupNodeId,
      type: "group",
      data: {
        label: formatGroupName(groupName),
        colors: {
          border: `${colors.border}/30`,
          bg: `${colors.bg}/10`,
          text: colors.text,
        },
      },
      position: { x: groupX, y: groupY },
      style: { width: layout.width, height: layout.height },
    });

    // 폴더 노드 추가
    layout.nodes.forEach((posInfo) => {
      const apiNode = groupData.apiNodes.find((n) => n.id === posInfo.id)!;

      reactFlowNodes.push({
        id: `folder-${apiNode.id}`,
        type: "folder",
        data: {
          label: apiNode.label,
          path: apiNode.contents,
          group: groupName,
          colors: {
            border: colors.border,
            bg: `${colors.bg}/20`,
            text: colors.text,
          },
        },
        // 보정된 상대 좌표
        position: {
          x: posInfo.x - NODE_CONFIG.folderWidth / 2 + NODE_CONFIG.groupPadding,
          y:
            posInfo.y -
            NODE_CONFIG.folderHeight / 2 +
            NODE_CONFIG.groupHeaderHeight,
        },
        parentId: groupNodeId,
        extent: "parent",
        style: {
          width: NODE_CONFIG.folderWidth,
          height: NODE_CONFIG.folderHeight,
        },
      });
    });
  });

  return reactFlowNodes;
}

function formatGroupName(name: string): string {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
