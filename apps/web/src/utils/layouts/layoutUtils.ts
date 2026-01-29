import { Node } from "@xyflow/react";
import { ApiNode } from "@/api/visualization";
import { BaseNodeData, NodeTheme } from "./layoutSettings";

// React Flow 노드 객체 생성 헬퍼
export function createReactFlowNode(
  n: ApiNode,
  x: number,
  y: number,
  settings: { w: number; h: number; theme: NodeTheme },
): Node<BaseNodeData> {
  return {
    id: n.id,
    type: "baseNode",
    data: {
      label: n.label,
      contents: n.contents || "",
      groups: n.groups || "",
      width: settings.w,
      height: settings.h,
      theme: settings.theme,
      diagramType: n.diagramType,
      relatedFolders: n.relatedFolders || [],
<<<<<<< feature/78
      relatedPaths: n.relatedPaths || [],
=======
      nodeType: n.nodeType,
      path: n.path,
>>>>>>> dev
    },
    position: { x, y },
  };
}

export function getFolderName(path: string): string {
  if (!path) return "";
  const parts = path.split("/");
  return parts[parts.length - 1];
}

export function calculateTextDimensions(text: string) {
  let totalWidth = 0;
  for (const char of text) {
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(char)) {
      totalWidth += 11;
    } else {
      totalWidth += 7;
    }
  }
  const width = Math.max(600, Math.min(totalWidth + 120, 900));
  const charsPerLine = Math.floor(width / 10);
  const lines = Math.ceil(text.length / charsPerLine);
  const height = Math.max(100, lines * 35 + 30);

  return { width, height };
}
