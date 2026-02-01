import { create } from "zustand";
import { NodeData } from "@/types/visualization";
import { Viewport } from "@xyflow/react";

interface VisualizationState {
  // 뷰포트 상태 (좌표 및 줌)
  viewport: { x: number; y: number; zoom: number } | null;

  // 마지막으로 클릭한 노드 (포커싱용)
  selectedNodeId: string | null;
  selectedFilePath: string | null;

  // STEP 1 클릭으로 인한 하이라이트 상태
  activeStep1Id: string | null;
  highlightNodeIds: string[];

  // 상세 설명 관련
  panelNode: NodeData | null;
  isNodeOpen: boolean;
  isProjectOpen: boolean;

  isSidebarOpen: boolean;
  focusTargetType: "ALL" | "STEP1" | "STEP2" | "STEP3" | null;

  preGuideState: {
    viewport: Viewport;
    isSidebarOpen: boolean;
    isNodeOpen: boolean;
    isProjectOpen: boolean;
  } | null;

  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedFilePath: (path: string | null) => void;
  setActiveStep1Id: (id: string | null) => void;
  setHighlights: (ids: string[]) => void;
  setPanelNode: (node: NodeData | null) => void;
  setIsNodeOpen: (isOpen: boolean) => void;
  setIsProjectOpen: (isOpen: boolean) => void;

  setIsSidebarOpen: (isOpen: boolean) => void;
  setFocusTargetType: (
    type: "ALL" | "STEP1" | "STEP2" | "STEP3" | null,
  ) => void;

  setPreGuideState: (state: VisualizationState["preGuideState"]) => void; // ✅ 추가
}

export const useVisualizationStore = create<VisualizationState>((set) => ({
  viewport: null,
  selectedNodeId: null,
  selectedFilePath: null,
  activeStep1Id: null,
  highlightNodeIds: [],
  panelNode: null,
  isNodeOpen: false,
  isProjectOpen: true,
  isSidebarOpen: true,
  focusTargetType: "STEP1",
  preGuideState: null,

  setViewport: (viewport) => set({ viewport }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedFilePath: (path) => set({ selectedFilePath: path }),
  setActiveStep1Id: (id) => set({ activeStep1Id: id }),
  setHighlights: (ids) => set({ highlightNodeIds: ids }),
  setPanelNode: (node) => set({ panelNode: node }),
  setIsNodeOpen: (isOpen) => set({ isNodeOpen: isOpen }),
  setIsProjectOpen: (isOpen) => set({ isProjectOpen: isOpen }),
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setFocusTargetType: (type) => set({ focusTargetType: type }),
  setPreGuideState: (state) => set({ preGuideState: state }),
}));
