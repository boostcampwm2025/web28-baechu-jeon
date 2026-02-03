import { create } from "zustand";

interface GuideState {
  run: boolean;
  stepIndex: number;

  setRun: (run: boolean) => void;
  setStepIndex: (index: number) => void;
  startGuide: () => void;
  checkFirstVisit: () => void;
}

export const useGuideStore = create<GuideState>((set) => ({
  run: false,
  stepIndex: 0,

  setRun: (run) => set({ run }),
  setStepIndex: (stepIndex) => set({ stepIndex }),
  startGuide: () => set({ run: true, stepIndex: 0 }),
  checkFirstVisit: () => {
    const hasSeen = localStorage.getItem("has-seen-guide");
    // 아직 본 적 없으면 1초 뒤 자동 시작
    if (!hasSeen) {
      setTimeout(() => {
        set({ run: true, stepIndex: 0 });
      }, 1000);
    }
  },
}));
