export interface NodeTheme {
  borderColor: string;
  bgColor: string;
  textColor: string;
}

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  contents?: string | null;
  groups?: string | null;
  width: number;
  height: number;
  theme: NodeTheme;
  diagramType: "STEP1" | "STEP2" | "STEP3";
  relatedNodeIds?: string[];
  relatedPaths?: string[];
  highlightClass?: string;
  type?: "FILE" | "FOLDER";
  path?: string;
  paddingX?: number;
  paddingY?: number;
}

export const LAYOUT_SETTINGS = {
  diagram1: {
    w: 700, // 노드 너비
    minH: 120, // 최소 높이
    nSep: 100, // 노드 사이 간격 (세로)

    // 배치 관련 패딩
    paddingTop: 120, // 전체 그룹 상단 여백 (라벨 들어갈 공간)
    paddingSide: 80, // 전체 그룹 좌우 여백

    font: {
      size: 26, // 폰트 크기
      lineHeight: 1.5, // 줄간격
      xPadding: 40, // 노드 내부 좌우 패딩
      yPadding: 40, // 노드 내부 상하 패딩
    },

    theme: {
      borderColor: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      textColor: "#60a5fa",
    },
  },
  diagram2: {
    minW: 200, // 최소 너비
    h: 100, // 고정 높이

    // 트리 간격
    rankSep: 150, // 가로 간격 (부모-자식 거리)
    nodeSep: 100, // 세로 간격 (형제 노드 거리)

    font: {
      size: 26,
      lineHeight: 1.5,
      xPadding: 20, // 노드 내부 좌우 패딩
      yPadding: 10, // 노드 내부 상하 패딩
    },

    theme: {
      borderColor: "#a855f7",
      bgColor: "rgba(168, 85, 247, 0.1)",
      textColor: "#c084fc",
    },

    fileTheme: {
      borderColor: "##75767B",
      bgColor: "rgba(211, 211, 211, 0.1)",
      textColor: "##75767B",
    },
  },
  diagram3: {
    // 배치 간격 설정
    columnGap: 100, // 기둥 사이 간격
    itemGap: 15, // 아이템 사이 간격
    paddingTop: 50, // Root 헤더 들어갈 공간
    paddingSide: 60, // Root 좌우 여백
    categoryPadding: 20, // 기둥 내부 여백

    headerGap: 20,

    // 크기 설정
    headerHeight: 50, // 카테고리 노드의 높이
    minW: 200, // 아이템/기둥 최소 너비
    h: 60, // 아이템 높이

    font: {
      size: 16,
      lineHeight: 1.5,
      xPadding: 20,
      yPadding: 10,
    },

    rootTheme: {
      borderColor: "#065f46",
      bgColor: "rgba(6, 95, 70, 0.1)",
      textColor: "#34d399",
    },

    // 그룹 껍데기 노드
    categoryTheme: {
      borderColor: "#059669",
      bgColor: "rgba(6, 95, 70, 0.3)",
      textColor: "transparent",
    },

    // 카테고리 노드
    headerTheme: {
      borderColor: "#34d399",
      bgColor: "rgba(16, 185, 129, 0.2)",
      textColor: "#34d399",
    },

    itemTheme: {
      borderColor: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.9)",
      textColor: "#ffffff",
    },
  },
} as const;
