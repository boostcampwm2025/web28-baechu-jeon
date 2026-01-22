"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/analyzing/ProgressBar";
import { startAnalysis, AnalysisError } from "@/api/analysis";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 분석 단계 타입
type AnalysisStep =
  | "STEP1_GROUPING"
  | "STEP2_HYPOTHESIS"
  | "STEP3_INTENT"
  | "STEP4_NLP";

// 단계별 메시지 매핑
const STEP_MESSAGES: Record<AnalysisStep, string> = {
  STEP1_GROUPING: "프로젝트 구조 그룹화 중...",
  STEP2_HYPOTHESIS: "폴더별 가설 생성 중...",
  STEP3_INTENT: "프로젝트 의도 분석 중...",
  STEP4_NLP: "자연어 처리 중...",
};

// 각 단계별 예상 소요 시간 (초)
const STEP_DURATIONS: Record<AnalysisStep, number> = {
  STEP1_GROUPING: 30,
  STEP2_HYPOTHESIS: 30,
  STEP3_INTENT: 30,
  STEP4_NLP: 30,
};

interface AnalyzingViewProps {
  projectId: string;
}

export default function AnalyzingView({ projectId }: AnalyzingViewProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<string>("분석 시작 중...");
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(50); // 총 예상 시간 (초)
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const totalSteps = 4;

  // 분석 시작 및 SSE 연결
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const initializeAnalysis = async () => {
      try {
        // 1. 분석 시작 API 호출
        const result = await startAnalysis(projectId);
        setAnalysisId(result.analysisId);

        // 2. SSE 연결 (analysisId 사용)
        eventSource = new EventSource(
          `${API_BASE_URL}/api/analyses/${analysisId}/events`,
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
              router.replace(`/result/${projectId}`);
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
    if (mins === 0) return `약 ${secs}초`;
    return `약 ${mins}분 ${secs}초`;
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl px-6">
        {/* 제목 영역 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            AI 분석 중...
          </h1>
          <p className="text-gray-600">
            프로젝트 구조를 분석하고 있습니다.
          </p>
        </div>

        {/* 프로그레스 바 영역 */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          {/* 현재 분석 단계 표시 */}
          <p className="mb-4 text-center text-sm font-medium text-gray-700">
            {currentStep}
          </p>

          {/* 에러 표시 */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {/* 애니메이션 프로그레스 바 */}
          <ProgressBar />

          {/* 단계 완료 및 예상 소요 시간 표시 */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            {completedSteps > 0 && (
              <span className="font-medium text-gray-700">
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
