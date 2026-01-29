import { create } from "zustand";

interface ExplorerState {
  highlightedPaths: string[];
  setHighlightedPaths: (paths: string[]) => void;
  clearHighlightedPaths: () => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
  highlightedPaths: [],
  setHighlightedPaths: (paths) => set({ highlightedPaths: paths }),
  clearHighlightedPaths: () => set({ highlightedPaths: [] }),
}));
