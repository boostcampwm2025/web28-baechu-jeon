import type { Node } from "@xyflow/react";
import { BaseNodeData } from "./layouts/layoutSettings";
import { NodeData } from "@/types/visualization";

export function convertToNodeData(node: Node<BaseNodeData>): NodeData {
  return {
    id: node.id,
    label: node.data.label,
    groups: node.data.groups || "",
    contents: node.data.contents || "",
    type: node.type,
    diagramType: node.data.diagramType,
    nodeType: node.data.type,
    path: node.data.path,
  };
}

// 초기 상세 설명 노드
export function findInitialNode(nodes: Node<BaseNodeData>[]): NodeData | null {
  const initialNode = nodes.find((n) => {
    const { diagramType, groups } = n.data;
    if (diagramType !== "STEP2") return false;
    if (groups === "GROUP_HEADER") return false;
    return true;
  });

  return initialNode ? convertToNodeData(initialNode) : null;
}
