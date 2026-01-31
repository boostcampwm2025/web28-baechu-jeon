import { create } from "zustand";
import { NodeData } from "@/types/visualization";

interface VisualizationState {
  // 뷰포트 상태 (좌표 및 줌)
  viewport: { x: number; y: number; zoom: number } | null;

  // 마지막으로 클릭한 노드 (포커싱용)
  selectedNodeId: string | null;
  selectedFilePath: string | null;

  // 현재 활성 탭 (code | visualization)
  activeTab: "code" | "visualization";

  // STEP 1 클릭으로 인한 하이라이트 상태
  activeStep1Id: string | null;
  highlightNodeIds: string[];

  // 상세 설명 관련
  panelNode: NodeData | null;
  isNodeOpen: boolean;
  isProjectOpen: boolean;

  // 코드 프리패치 캐시 (key: "analysisId::filePath", value: markdownContent)
  codeCache: Record<string, string>;

  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedFilePath: (path: string | null) => void;
  setActiveTab: (tab: "code" | "visualization") => void;
  setActiveStep1Id: (id: string | null) => void;
  setHighlights: (ids: string[]) => void;
  setPanelNode: (node: NodeData | null) => void;
  setIsNodeOpen: (isOpen: boolean) => void;
  setIsProjectOpen: (isOpen: boolean) => void;
  setCachedCode: (
    analysisId: string,
    filePath: string,
    content: string,
  ) => void;
  getCachedCode: (analysisId: string, filePath: string) => string | undefined;
}

export const useVisualizationStore = create<VisualizationState>((set, get) => ({
  viewport: null,
  selectedNodeId: null,
  selectedFilePath: null,
  activeTab: "visualization",
  activeStep1Id: null,
  highlightNodeIds: [],
  panelNode: null,
  isNodeOpen: false,
  isProjectOpen: true,
  codeCache: {},

  setViewport: (viewport) => set({ viewport }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedFilePath: (path) => set({ selectedFilePath: path }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveStep1Id: (id) => set({ activeStep1Id: id }),
  setHighlights: (ids) => set({ highlightNodeIds: ids }),
  setPanelNode: (node) => set({ panelNode: node }),
  setIsNodeOpen: (isOpen) => set({ isNodeOpen: isOpen }),
  setIsProjectOpen: (isOpen) => set({ isProjectOpen: isOpen }),
  setCachedCode: (analysisId, filePath, content) =>
    set((s) => ({
      codeCache: { ...s.codeCache, [`${analysisId}::${filePath}`]: content },
    })),
  getCachedCode: (analysisId, filePath) =>
    get().codeCache[`${analysisId}::${filePath}`],
}));
