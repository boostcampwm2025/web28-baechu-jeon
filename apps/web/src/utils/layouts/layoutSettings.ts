export interface NodeTheme {
  borderColor: string;
  bgColor: string;
  textColor: string;
}

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  contents: string;
  groups: string;
  width: number;
  height: number;
  theme: NodeTheme;
  diagramType: "STEP1" | "STEP2" | "STEP3";
  relatedFolders?: string[];
  highlightClass?: string;
}

/*
interface LayoutSettingItem {
  w: number;
  h: number;
  nSep: number;
  rSep: number;
  theme: NodeTheme;
}
*/

export const LAYOUT_SETTINGS = {
  diagram1: {
    w: 500,
    h: 120,
    nSep: 80,
    rSep: 200,
    theme: {
      borderColor: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      textColor: "#60a5fa",
    },
  },
  diagram1Group: {
    theme: {
      borderColor: "#1d4ed8",
      bgColor: "rgba(30, 64, 175, 0.1)",
      textColor: "#bfdbfe",
    },
  },
  diagram2: {
    w: 250,
    h: 100,
    nSep: 80,
    rSep: 200,
    theme: {
      borderColor: "#a855f7",
      bgColor: "rgba(168, 85, 247, 0.1)",
      textColor: "#c084fc",
    },
  },
  diagram3: {
    w: 200,
    h: 80,
    nSep: 100,
    rSep: 100,
    theme: {
      borderColor: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      textColor: "#34d399",
    },
  },
  diagram3Child: {
    w: 220,
    h: 60,
    nSep: 20,
    rSep: 20,
    theme: {
      borderColor: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.9)",
      textColor: "#ffffff",
    },
  },

  // 아이템들을 묶을 컨테이너 박스 스타일
  diagram3Container: {
    theme: {
      borderColor: "#059669",
      bgColor: "rgba(6, 95, 70, 0.3)",
      textColor: "transparent",
    },
  },

  diagram3CategoryNode: {
    w: 120,
    h: 50,
    nSep: 0,
    rSep: 0,
    theme: {
      borderColor: "#34d399",
      bgColor: "rgba(16, 185, 129, 0.2)",
      textColor: "#34d399",
    },
  },
  diagram3Root: {
    theme: {
      borderColor: "#065f46",
      bgColor: "rgba(6, 95, 70, 0.1)",
      textColor: "#34d399",
    },
  },
} as const;
