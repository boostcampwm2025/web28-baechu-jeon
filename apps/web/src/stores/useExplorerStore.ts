import { create } from "zustand";

interface ExplorerState {
  highlightedPaths: string[];
  setHighlightedPaths: (paths: string[]) => void;
  clearHighlightedPaths: () => void;
  // step1에서 수집한 모든 클릭 가능한 파일 경로들 (파란 원 표시)
  indicatedPaths: Set<string>;
  setIndicatedPaths: (paths: string[]) => void;
  clearIndicatedPaths: () => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
  highlightedPaths: [],
  setHighlightedPaths: (paths) => set({ highlightedPaths: paths }),
  clearHighlightedPaths: () => set({ highlightedPaths: [] }),
  indicatedPaths: new Set(),
  setIndicatedPaths: (paths) => set({ indicatedPaths: new Set(paths) }),
  clearIndicatedPaths: () => set({ indicatedPaths: new Set() }),
}));
