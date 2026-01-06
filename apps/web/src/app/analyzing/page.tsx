"use client";

import { useState, useEffect } from "react";
import ProgressBar from "@/components/analyzing/ProgressBar";

// 분석 단계 목록
const ANALYSIS_STEPS = [
  "프로젝트 추출 중...",
  "폴더 구조 전처리 중...",
  "의존성 분석 중...",
  "AI 분석 중...",
  "결과 생성 중...",
];

export default function AnalyzingPage() {
  // 현재 분석 단계 (Mock 데이터)
  const [currentStep, setCurrentStep] = useState(0);

  // Mock 데이터: 분석 단계 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 2000); // 2초마다 단계 변경

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl px-6">
        {/* 제목 영역 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analyzing Project Structure...
          </h1>
          <p className="text-gray-600">
            AI is parsing dependencies and mapping your components structure.
          </p>
        </div>

        {/* 프로그레스 바 영역 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* 현재 분석 단계 표시 */}
          <p className="mb-4 text-center text-sm font-medium text-gray-700">
            {ANALYSIS_STEPS[currentStep]}
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

