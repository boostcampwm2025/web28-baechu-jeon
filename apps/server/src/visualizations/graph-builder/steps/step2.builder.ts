import { EdgeInput, NodeTemp, Step2Json } from '../types/graph-builder.type';

export function buildStep2(step2: Step2Json, maxDepth: number) {
  const nodes: NodeTemp[] = [];
  const edges: EdgeInput[] = [];

  // apps 외에 다른 root 폴더도 포함되어 있어서 그거 필터링 해야 할 듯?
  // 트리 모양이 이상할 것 같음. 근데 흠...
  // 그냥 프롬프트에서 root의 애매한 폴더 빼달라고 하면 될 수도. git, docker 등등 그래서 apps만 받도록.

  const map = new Map<string, NodeTemp>();

  // 1. folder_path -> node (중복 제거)
  for (const item of step2.responsibility_hypotheses) {
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
        // type: 'folder',
      });
    }
  }

  return { nodes, edges };
}

// // {
// //   "responsibility_hypotheses": [
// //     {
// //       "folder_path": "폴더 경로",
// //       "hypothesis": "이 폴더가 무슨 일을 할 가능성이 있는지 가설",
// //       "evidence": "가설의 근거 (구조적 특징, 메타데이터 내용 등)",
// //       "confidence": 0.0 ~ 1.0
// //     }
// //   ]
// // }

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
