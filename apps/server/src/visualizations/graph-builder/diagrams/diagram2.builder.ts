import {
  EdgeInput,
  NodeTemp,
  Step2Analysis,
} from '../types/graph-builder.type';
import {
  normalize,
  inferPathType,
  getLastSegment,
  getParentPath,
} from '../utils/graph-builder.util';

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
    const type = inferPathType(item.folder_path, path, maxDepth);

    if (!map.has(path)) {
      map.set(path, {
        path,
        label: getLastSegment(path),
        contents: item.hypothesis,
        type,
      });
    } else if (type === 'FOLDER') {
      const existing = map.get(path);
      if (existing) {
        existing.type = 'FOLDER';
      }
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
