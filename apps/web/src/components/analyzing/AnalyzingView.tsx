"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/analyzing/ProgressBar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 분석 단계 enum
enum AnalysisStep {
  PREPROCESSING = "preprocessing",
  DEPENDENCY_ANALYSIS = "dependency_analysis",
  AI_ANALYSIS = "ai_analysis",
  RESULT_GENERATION = "result_generation",
}

const STEP_MESSAGES: Record<AnalysisStep, string> = {
  [AnalysisStep.PREPROCESSING]: "폴더 구조 전처리 중...",
  [AnalysisStep.DEPENDENCY_ANALYSIS]: "의존성 분석 중...",
  [AnalysisStep.AI_ANALYSIS]: "AI 분석 중...",
  [AnalysisStep.RESULT_GENERATION]: "결과 생성 중...",
};

interface AnalyzingViewProps {
  projectId: string;
}

export default function AnalyzingView({ projectId }: AnalyzingViewProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<string>("분석 준비 중...");

  // SSE 연결 및 실시간 상태 업데이트
  useEffect(() => {
    const eventSource = new EventSource(
      `${API_BASE_URL}/analysis/${projectId}/stream`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // currentStep이 enum 값이면 매핑된 문구로 변환
        if (
          data.currentStep &&
          STEP_MESSAGES[data.currentStep as AnalysisStep]
        ) {
          setCurrentStep(STEP_MESSAGES[data.currentStep as AnalysisStep]);
        } else if (data.status === "completed") {
          setCurrentStep("분석 완료");
        }

        // 분석 완료 시 결과 페이지로 이동
        if (data.status === "completed") {
          eventSource.close();
          router.replace(`/result/${projectId}`);
        }
      } catch (error) {
        console.error("Failed to parse SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
    };

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      eventSource.close();
    };
  }, [projectId, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl px-6">
        {/* 제목 영역 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Analyzing Project Structure...
          </h1>
          <p className="text-gray-600">
            AI is parsing dependencies and mapping your components structure.
          </p>
        </div>

        {/* 프로그레스 바 영역 */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          {/* 현재 분석 단계 표시 */}
          <p className="mb-4 text-center text-sm font-medium text-gray-700">
            {currentStep}
          </p>

          <ProgressBar />

          <p className="mt-3 text-center text-xs text-gray-500">
            약 40초~1분 소요 예상
          </p>
        </div>
      </div>
    </div>
  );
}
