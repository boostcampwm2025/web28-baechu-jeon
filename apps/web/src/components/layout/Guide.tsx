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
import { useSearchParams } from "next/navigation";
import { useReactFlow } from "@xyflow/react";
import {
  HiMiniDocumentDuplicate,
  HiMiniRectangleGroup,
  HiUser,
  HiStar,
  HiRocketLaunch,
  HiChatBubbleOvalLeftEllipsis,
  HiLink,
} from "react-icons/hi2";

/**
 * 가이드 내부 스타일을 위한 공통 레이아웃 컴포넌트
 */
const GuideStep = ({
  title,
  icon,
  children,
  tip,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  tip?: string;
}) => (
  <div className="flex flex-col gap-2 p-1 text-left">
    <div className="mb-1 flex items-center gap-2 border-b border-slate-100 pb-3">
      {icon && (
        <span className="flex items-center justify-center p-2">{icon}</span>
      )}
      <h3 className="text-lg font-bold tracking-tight text-slate-800">
        {title}
      </h3>
    </div>
    <div className="text-[14.5px] leading-relaxed text-slate-600">
      {children}
    </div>
    {tip && (
      <div className="mt-3 rounded-xl border border-blue-100/50 bg-blue-50/50 p-3 text-[13px] leading-5 text-blue-700">
        {tip}
      </div>
    )}
  </div>
);

export default function Guide() {
  const params = useSearchParams();
  const isCodePage = params.get("tab") === "code";

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
            <GuideStep
              title="파일 탐색기"
              icon={
                <HiMiniDocumentDuplicate size={22} className="text-blue-500" />
              }
              tip="마커가 표시된 파일은 AI 코드 요약이 포함되어 있습니다."
            >
              <p>전체 소스코드 파일 목록을 확인합니다.</p>
            </GuideStep>
          ),
          placement: "right",
          disableBeacon: true,
        },
        {
          target: "#result-tabs-nav",
          content: (
            <GuideStep
              title="시각화로 돌아가기"
              icon={
                <HiMiniRectangleGroup className="text-emerald-600" size={20} />
              }
            >
              <p>시각화 탭을 클릭하면 다시 다이어그램 화면으로 이동합니다.</p>
            </GuideStep>
          ),
          placement: "bottom",
        },
        {
          target: "#header-export-btn",
          content: (
            <GuideStep
              title="공유하기"
              icon={<HiLink className="text-slate-500" size={20} />}
            >
              링크로 복사하여 분석 결과를 공유해보세요!
            </GuideStep>
          ),
          placement: "bottom",
        },
      ];
    }

    return [
      {
        target: "#folder-sidebar",
        content: (
          <GuideStep
            title="파일 탐색기"
            icon={
              <HiMiniDocumentDuplicate size={22} className="text-blue-500" />
            }
            tip="마커가 표시된 파일은 AI 코드 요약이 포함되어 있습니다."
          >
            <p>전체 소스코드 파일 목록을 확인합니다.</p>
          </GuideStep>
        ),
        placement: "right",
        disableBeacon: true,
      },
      {
        target: ".react-flow",
        content: (
          <GuideStep
            title="다이어그램 탐색"
            icon={
              <HiMiniRectangleGroup size={22} className="text-emerald-600" />
            }
            tip="Shift + 드래그 시 특정 영역의 노드들을 한 번에 선택할 수 있습니다."
          >
            <p>프로젝트 구조를 자유롭게 탐색하세요.</p>
            <p className="mt-2 text-sm font-medium text-slate-400 italic">
              * 하단 컨트롤러: +, -, Fit, 잠금 기능 지원
            </p>
          </GuideStep>
        ),
        placement: "center",
      },
      {
        target: ".react-flow",
        content: (
          <GuideStep
            title="유저 스토리"
            icon={<HiUser size={22} className="text-indigo-500" />}
            tip=" 노드 클릭 시 연관 파일이 하이라이팅 됩니다."
          >
            <p>사용자 시점의 핵심 기능 흐름을 확인할 수 있습니다.</p>
          </GuideStep>
        ),
        placement: "bottom",
      },
      {
        target: ".react-flow",
        content: (
          <GuideStep
            title="핵심 파일 트리"
            icon={<HiStar size={22} className="text-amber-500" />}
          >
            <p>주요 폴더와 파일의 구조가 연결되어 표시됩니다.</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>
                  <strong>폴더(실선):</strong> 클릭 시 폴더 역할 확인
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>
                  <strong>파일(점선):</strong> 클릭 시 코드 요약 확인
                </span>
              </li>
            </ul>
          </GuideStep>
        ),
        placement: "bottom",
      },
      {
        target: ".react-flow",
        content: (
          <GuideStep
            title="기술 스택"
            icon={<HiRocketLaunch size={22} className="text-rose-500" />}
          >
            <p>
              FE, BE, DB, Infra 영역별로 사용된
              <br />
              주요 라이브러리와 기술을 확인할 수 있습니다.
            </p>
          </GuideStep>
        ),
        placement: "bottom",
      },
      {
        target: "#details-panel",
        content: (
          <GuideStep
            title="상세 설명 패널"
            icon={
              <HiChatBubbleOvalLeftEllipsis
                size={22}
                className="text-sky-400"
              />
            }
            tip="하단 버튼을 통해 언제든 열고 닫을 수 있습니다."
          >
            <p>프로젝트의 목적, 개요 등 상세 정보를 확인하세요.</p>
          </GuideStep>
        ),
        placement: "left",
      },
      {
        target: "#header-export-btn",
        content: (
          <GuideStep
            title="공유하기"
            icon={<HiLink className="text-slate-500" size={20} />}
          >
            링크로 복사하여 분석 결과를 공유해보세요!
          </GuideStep>
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
          overlayColor: "rgba(15, 23, 42, 0.65)",
          backgroundColor: "#ffffff",
        },
        spotlight: {
          borderRadius: "16px",
        },
        tooltip: {
          borderRadius: "16px",
          padding: "16px",
        },
        buttonNext: {
          borderRadius: "8px",
          fontWeight: 600,
          padding: "8px 16px",
        },
        buttonBack: {
          marginRight: 10,
          fontSize: 14,
          color: "#64748b",
        },
        buttonClose: {
          marginTop: "10px",
          marginRight: "10px",
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
