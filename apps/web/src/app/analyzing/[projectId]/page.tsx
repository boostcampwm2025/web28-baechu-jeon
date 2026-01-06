"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/analyzing/ProgressBar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export default function AnalyzingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<string>("분석 준비 중...");

  // params에서 projectId 추출
  useEffect(() => {
    params.then((resolvedParams) => {
      setProjectId(resolvedParams.projectId);
    });
  }, [params]);

  // SSE 연결 및 실시간 상태 업데이트
  useEffect(() => {
    if (!projectId) return;

    const eventSource = new EventSource(
      `${API_BASE_URL}/api/analysis/${projectId}/stream`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setCurrentStep(data.currentStep);

        // 분석 완료 시 결과 페이지로 이동
        if (data.status === "completed") {
          eventSource.close();
          router.push(`/result/${projectId}`);
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

