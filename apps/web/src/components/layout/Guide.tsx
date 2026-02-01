"use client";

import { useEffect, useState, useMemo } from "react";
import Joyride, {
  CallBackProps,
  EVENTS,
  STATUS,
  Step,
  ACTIONS,
} from "react-joyride";
import { useGuideStore } from "@/stores/useGuideStore";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { usePathname } from "next/navigation";
import { useReactFlow } from "@xyflow/react";

export default function Guide() {
  const pathname = usePathname();
  const isCodePage = pathname?.includes("/code");

  const { getViewport, setViewport } = useReactFlow();

  const { run, stepIndex, setRun, setStepIndex } = useGuideStore();
  const {
    setIsSidebarOpen,
    setIsProjectOpen,
    setIsNodeOpen,
    setFocusTargetType,
    setPreGuideState,
    preGuideState,
    isSidebarOpen,
    isNodeOpen,
    isProjectOpen,
  } = useVisualizationStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps: Step[] = useMemo(() => {
    if (isCodePage) {
      return [
        {
          target: "#folder-sidebar",
          content: (
            <div className="text-left">
              <h3 className="text-lg font-bold">📂 파일 탐색기</h3>
              <p>다른 파일의 코드를 보고 싶다면 선택하세요.</p>
            </div>
          ),
          placement: "right",
          disableBeacon: true,
        },
        {
          target: "#result-tabs-nav",
          content: (
            <div className="text-left">
              <h3 className="text-lg font-bold">🔄 시각화로 돌아가기</h3>
              <p>
                Visual Graph 탭을 누르면
                <br />
                다이어그램 화면으로 돌아갑니다.
              </p>
            </div>
          ),
          placement: "bottom",
        },
      ];
    }

    return [
      {
        target: "#folder-sidebar",
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold">📂 파일 탐색기</h3>
            <p>전체 파일 목록을 확인하고 코드를 열람합니다.</p>
          </div>
        ),
        placement: "right",
        disableBeacon: true,
      },
      {
        target: ".react-flow",
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold">🗺️ 다이어그램 및 제어</h3>
            <p>프로젝트 구조를 자유롭게 탐색하세요.</p>
            <p className="mt-2 text-sm text-slate-500">
              💡 좌측 하단의 <strong>[+, -, Fit, 잠금]</strong> 버튼으로
              <br />
              화면을 제어할 수 있습니다.
            </p>
          </div>
        ),
        placement: "center",
      },
      {
        target: ".react-flow",
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold text-blue-600">👤 유저 스토리</h3>
            <p>
              프로젝트의 핵심 기능 흐름을 확인하세요.
              <br />
              노드 클릭 시 유저 스토리와 연관된 폴더 및 파일을 확인할 수
              있습니다.
            </p>
          </div>
        ),
        placement: "bottom",
      },
      {
        target: ".react-flow",
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold text-purple-600">
              🗂️ 핵심 파일트리
            </h3>
            <p>주요 폴더와 파일의 구조가 연결되어 표시됩니다.</p>
          </div>
        ),
        placement: "bottom",
      },
      {
        target: ".react-flow",
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold text-green-600">💻 기술 스택</h3>
            <p>사용된 라이브러리와 기술을 확인합니다.</p>
          </div>
        ),
        placement: "bottom",
      },
      {
        target: "#details-panel",
        content: (
          <div className="text-left">
            <h3 className="text-lg font-bold">🔎 프로젝트 상세 설명</h3>
            <p>
              선택한 <strong>폴더의 역할</strong>과
              <br />
              <strong>프로젝트의 전체 개요</strong>를 한눈에 확인하세요.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              💡 다이어그램에서 노드를 클릭하면 폴더 역할이 자동으로 표시됩니다.
            </p>
          </div>
        ),
        placement: "left",
      },
      {
        target: "#header-help-btn",
        content: (
          <div className="text-center">
            <p className="font-bold">여기서 사용법을 다시 볼 수 있습니다.</p>
          </div>
        ),
        placement: "bottom",
      },
    ];
  }, [isCodePage]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (
      action === ACTIONS.START &&
      type === EVENTS.STEP_BEFORE &&
      index === 0
    ) {
      if (!isCodePage) {
        setPreGuideState({
          viewport: getViewport(),
          isSidebarOpen,
          isNodeOpen,
          isProjectOpen,
        });

        setIsSidebarOpen(true);
        setIsNodeOpen(false);
        setIsProjectOpen(false);
      }
    }

    if (type === EVENTS.STEP_BEFORE) {
      if (!isCodePage) {
        if (index === 1) setFocusTargetType("ALL");
        if (index === 2) setFocusTargetType("STEP1");
        if (index === 3) setFocusTargetType("STEP2");
        if (index === 4) setFocusTargetType("STEP3");

        if (index === 5) {
          setIsNodeOpen(true);
          setIsProjectOpen(true);
        }
      }
    }

    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) setStepIndex(index + 1);
      else if (action === ACTIONS.PREV) setStepIndex(index - 1);
    } else if (type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + 1);
    }

    const isFinished = ([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(
      status,
    );
    const isCloseAction = action === ACTIONS.CLOSE;

    if (isFinished || isCloseAction) {
      setRun(false);
      setStepIndex(0);
      localStorage.setItem("has-seen-guide", "true");

      if (!isCodePage && preGuideState) {
        setViewport(preGuideState.viewport);
        setIsSidebarOpen(preGuideState.isSidebarOpen);
        setIsNodeOpen(preGuideState.isNodeOpen);
        setIsProjectOpen(preGuideState.isProjectOpen);
        setFocusTargetType(null);
      }
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      disableScrollParentFix={true}
      continuous
      disableOverlayClose
      disableScrolling={isCodePage ? false : true}
      callback={handleJoyrideCallback}
      floaterProps={{
        hideArrow: false,
        disableAnimation: false,
      }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#0ea5e9",
          textColor: "#334155",
          overlayColor: "rgba(0, 0, 0, 0.6)",
        },
        spotlight: {
          borderRadius: "12px",
        },
      }}
      locale={{
        back: "이전",
        close: "닫기",
        last: "완료",
        next: "다음",
      }}
    />
  );
}
