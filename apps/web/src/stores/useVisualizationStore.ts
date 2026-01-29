import { create } from "zustand";

interface VisualizationState {
  // 뷰포트 상태 (좌표 및 줌)
  viewport: { x: number; y: number; zoom: number } | null;

  // 마지막으로 클릭한 노드 (포커싱용)
  selectedNodeId: string | null;
  selectedFilePath: string | null;

  // STEP 1 클릭으로 인한 하이라이트 상태
  highlightNodeIds: string[];

  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedFilePath: (path: string | null) => void;
  setHighlights: (ids: string[]) => void;
}

export const useVisualizationStore = create<VisualizationState>((set) => ({
  viewport: null,
  selectedNodeId: null,
  selectedFilePath: null,
  highlightNodeIds: [],

  setViewport: (viewport) => set({ viewport }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedFilePath: (path) => set({ selectedFilePath: path }),
  setHighlights: (ids) => set({ highlightNodeIds: ids }),
}));
