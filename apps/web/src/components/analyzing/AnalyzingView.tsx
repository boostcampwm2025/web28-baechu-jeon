"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/analyzing/ProgressBar";
import { startAnalysis, AnalysisError } from "@/api/analysis";
import NotificationButton from "@/components/analyzing/NotificationButton";
import MemeSlider from "@/components/analyzing/MemeSlider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 분석 단계 타입 (3단계: 1=기능분석, 2=가설+의도, 3=코드설명)
type AnalysisStep =
  | "STEP1_FEATURE_ANALYSIS"
  | "STEP2_HYPOTHESIS_AND_INTENT"
  | "STEP3_CODE_SUMMARY";

// 단계별 메시지 매핑
const STEP_MESSAGES: Record<AnalysisStep, string> = {
  STEP1_FEATURE_ANALYSIS: "프로젝트 기능 분석 중...",
  STEP2_HYPOTHESIS_AND_INTENT:
    "폴더·파일 가설 및 프로젝트 의도 분석 중...",
  STEP3_CODE_SUMMARY: "코드 설명 생성 중...",
};

// 각 단계별 예상 소요 시간 (초)
const STEP_DURATIONS: Record<AnalysisStep, number> = {
  STEP1_FEATURE_ANALYSIS: 30,
  STEP2_HYPOTHESIS_AND_INTENT: 90,
  STEP3_CODE_SUMMARY: 60,
};

interface AnalyzingViewProps {
  projectId: string;
}

export default function AnalyzingView({ projectId }: AnalyzingViewProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<string>("분석 시작 중...");
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(180); // 총 예상 시간 (초, 3단계)
  const [error, setError] = useState<string | null>(null);
  const [isNotiGranted, setIsNotiGranted] = useState(false);
  const [isNotiDenied, setIsNotiDenied] = useState(false);
  const totalSteps = 3;

  // 알림 권한 확인
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsNotiGranted(Notification.permission === "granted");
      setIsNotiDenied(Notification.permission === "denied");
    }
  }, []);

  // 알림 신청 함수
  const requestNotification = async () => {
    if (!("Notification" in window)) {
      alert("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setIsNotiGranted(true);
      setIsNotiDenied(false);
      new Notification("알림 설정 완료!", {
        body: "분석이 완료되면 알려드릴게요. 편하게 다른 일을 보셔도 됩니다!",
      });
    } else if (permission === "denied") {
      setIsNotiDenied(true);
    }
  };
  // 분석 시작 및 SSE 연결
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const initializeAnalysis = async () => {
      try {
        // 1. 분석 시작 API 호출
        const result = await startAnalysis(projectId);

        // 2. SSE 연결 (analysisId 사용)
        eventSource = new EventSource(
          `${API_BASE_URL}/analyses/${result.analysisId}/events`,
        );

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // 이벤트 타입에 따라 처리
            if (data.type === "step_started") {
              const step = data.step as AnalysisStep;
              if (STEP_MESSAGES[step]) {
                setCurrentStep(STEP_MESSAGES[step]);
              }
            } else if (data.type === "step_completed") {
              setCompletedSteps((prev) => {
                const newCompleted = prev + 1;

                // 남은 시간 계산
                const remainingTime = Object.values(STEP_DURATIONS)
                  .slice(newCompleted)
                  .reduce((sum, duration) => sum + duration, 0);
                setEstimatedTime(remainingTime);

                return newCompleted;
              });
            } else if (data.type === "completed") {
              setCurrentStep("분석 완료");
              setCompletedSteps(totalSteps);
              setEstimatedTime(0);
              eventSource?.close();

              if (typeof window !== "undefined" && "Notification" in window) {
                if (Notification.permission === "granted") {
                  new Notification("분석 완료! 🚀", {
                    body: "프로젝트 분석이 끝났습니다. 결과를 확인해보세요!",
                  });
                }
              }

              router.replace(`/result/${projectId}/${result.analysisId}`);
            } else if (data.type === "failed") {
              setCurrentStep("분석 실패");
              setError(data.reason || "분석 중 오류가 발생했습니다.");
              eventSource?.close();
            }
          } catch (error) {
            console.error("Failed to parse SSE data:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("SSE connection error:", error);
          setError("연결 오류가 발생했습니다.");
          eventSource?.close();
        };
      } catch (error) {
        console.error("Failed to start analysis:", error);
        if (error instanceof AnalysisError) {
          setError(error.message);
        } else {
          setError("분석 시작에 실패했습니다.");
        }
      }
    };

    initializeAnalysis();

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [projectId, router]);

  // 예상 시간 포맷팅 (초 → 분:초)
  const formatEstimatedTime = (seconds: number): string => {
    if (seconds <= 0) return "곧 완료됩니다";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `예상 소요 시간: ${secs}초`;
    return `예상 소요 시간: ${mins}분 ${secs}초`;
  };

  return (
    <div className="thin-scrollbar bg-page flex h-full flex-col items-center justify-center overflow-y-auto">
      <div className="w-full max-w-2xl px-6">
        {/* 제목 영역 */}
        <div className="mb-8 text-center">
          <h1 className="text-heading mb-2 text-3xl font-bold">
            AI 분석 중...
          </h1>
          <p className="text-subtle">프로젝트 구조를 분석하고 있습니다.</p>
        </div>

        {/* 밈 슬라이더 */}
        <MemeSlider />

        {/* 프로그레스 바 영역 */}
        <div className="bg-surface rounded-lg p-8 shadow-md">
          {/* 현재 분석 단계 표시 */}
          <p className="text-body mb-4 text-center text-sm font-medium">
            {currentStep}
          </p>

          {/* 에러 표시 */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {/* 애니메이션 프로그레스 바 */}
          <ProgressBar />

          {/* 알림 신청 버튼 */}
          <NotificationButton
            isGranted={isNotiGranted}
            isDenied={isNotiDenied}
            onRequest={requestNotification}
          />
          {/* 단계 완료 및 예상 소요 시간 표시 */}
          <div className="text-muted mt-3 flex flex-col items-center gap-1 text-xs">
            {completedSteps > 0 && (
              <span className="text-body font-medium">
                {completedSteps}/{totalSteps} 단계 완료
              </span>
            )}
            <span>{formatEstimatedTime(estimatedTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

