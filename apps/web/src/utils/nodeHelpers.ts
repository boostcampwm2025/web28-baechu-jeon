import type { Node } from "@xyflow/react";
import { BaseNodeData } from "@/utils/transformNodes";
import { NodeData } from "@/types/visualization";

export function convertToNodeData(node: Node<BaseNodeData>): NodeData {
  return {
    id: node.id,
    label: node.data.label,
    groups: node.data.groups || "",
    contents: node.data.contents || "",
    type: node.type,
    diagramType: node.data.diagramType,
  };
}

// 초기 상세 설명 노드
export function findInitialNode(nodes: Node<BaseNodeData>[]): NodeData | null {
  const firstStep2Node = nodes.find((n) => n.data.diagramType === "STEP2");
  return firstStep2Node ? convertToNodeData(firstStep2Node) : null;
}
