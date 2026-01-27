import {
  EdgeInput,
  NodeTemp,
  Step2Analysis,
} from '../types/graph-builder.type';

export function buildDiagram2(
  step2AnalysisResult: Step2Analysis,
  maxDepth: number,
) {
  const nodes: NodeTemp[] = [];
  const edges: EdgeInput[] = [];

  const map = new Map<string, NodeTemp>();

  // 1. folder_path -> node (중복 제거)
  for (const item of step2AnalysisResult.responsibility_hypotheses) {
    const path = normalize(item.folder_path, maxDepth);

    if (!map.has(path)) {
      map.set(path, {
        path,
        label: getLastSegment(path),
        contents: item.hypothesis,
      });
    }
  }

  // Map -> nodes 배열
  for (const node of map.values()) {
    nodes.push(node);
  }

  // 2. 부모 -> 자식 edge 생성 (트리 구조)
  for (const node of map.values()) {
    const parentPath = getParentPath(node.path);

    if (parentPath && map.has(parentPath)) {
      edges.push({
        sourcePath: parentPath,
        targetPath: node.path,
      });
    }
  }

  return { nodes, edges };
}

function normalize(path: string, maxDepth: number): string {
  const parts = path.split('/').filter(Boolean);
  return parts.slice(0, maxDepth).join('/');
}

function getLastSegment(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

function getParentPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join('/');
}
