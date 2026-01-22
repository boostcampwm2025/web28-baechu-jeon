export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
}

// 플랫한 파일/폴더 경로 리스트를 계층 구조(Tree)로 변환하는 함수
export function buildProjectTree(data: {
  files: string[];
  folders: string[];
}): FileNode[] {
  const root: FileNode[] = [];

  const pathToTree = (path: string, isFile: boolean) => {
    const parts = path.split("/"); // 경로를 '/' 기준으로 분리 (예: 'src/components' -> ['src', 'components'])
    let currentLevel = root; // 탐색을 시작할 현재 레벨
    let currentPath = ""; // 누적 경로 저장용

    parts.forEach((part) => {
      const nodeType = isFile ? "file" : "folder";
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // 현재 레벨에서 같은 이름을 가진 노드가 이미 있는지 확인
      let existingNode = currentLevel.find((node) => node.name === part);

      if (existingNode) {
        if (existingNode.children) {
          // 이미 노드가 존재한다면 다음 탐색을 위해 해당 노드의 자식 레벨로 이동
          currentLevel = existingNode.children;
        }
      } else {
        // 노드가 존재하지 않는다면 새로 생성
        const newNode: FileNode = {
          name: part,
          path: currentPath,
          type: nodeType,
          children: nodeType === "folder" ? [] : undefined,
        };
        currentLevel.push(newNode);
        if (nodeType === "folder") {
          currentLevel = newNode.children!;
        }
      }
    });
  };

  // 폴더 경로들을 먼저 처리하여 트리 구조 생성
  data.folders.forEach((p) => pathToTree(p, false));
  data.files.forEach((p) => pathToTree(p, true));

  return sortTree(root);
}

// 생성된 트리를 정렬(폴더 우선, 그다음 이름순)
function sortTree(nodes: FileNode[]): FileNode[] {
  nodes.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "folder" ? -1 : 1;
  });
  nodes.forEach((node) => {
    if (node.children) sortTree(node.children);
  });
  return nodes;
}
