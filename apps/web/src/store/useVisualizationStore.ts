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
  // LRU 캐시를 위한 접근 순서 추적
  cacheAccessOrder: string[];

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

const MAX_CACHE_SIZE = 20;

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
  cacheAccessOrder: [],

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
    set((s) => {
      const key = `${analysisId}::${filePath}`;
      const newCache = { ...s.codeCache };
      const newAccessOrder = [...s.cacheAccessOrder];

      // 이미 존재하면 접근 순서에서 제거
      const existingIndex = newAccessOrder.indexOf(key);
      if (existingIndex > -1) {
        newAccessOrder.splice(existingIndex, 1);
      }

      // 새 데이터 추가
      newCache[key] = content;
      newAccessOrder.push(key); // 맨 뒤에 추가 (가장 최근)

      // LRU: 크기 초과 시 가장 오래된 항목 제거
      if (newAccessOrder.length > MAX_CACHE_SIZE) {
        const oldestKey = newAccessOrder.shift(); // 맨 앞 제거 (가장 오래됨)
        if (oldestKey) {
          delete newCache[oldestKey];
        }
      }

      return {
        codeCache: newCache,
        cacheAccessOrder: newAccessOrder,
      };
    }),
  getCachedCode: (analysisId, filePath) => {
    const key = `${analysisId}::${filePath}`;
    const state = get();
    const cached = state.codeCache[key];

    // 캐시 히트 시 접근 순서 갱신 (가장 최근으로 이동)
    if (cached) {
      const newAccessOrder = [...state.cacheAccessOrder];
      const index = newAccessOrder.indexOf(key);
      if (index > -1) {
        newAccessOrder.splice(index, 1);
        newAccessOrder.push(key);
        set({ cacheAccessOrder: newAccessOrder });
      }
    }

    return cached;
  },
}));
