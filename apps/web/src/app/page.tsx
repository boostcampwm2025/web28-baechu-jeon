"use client";

import { useState } from "react";
import FileUploader from "@/components/upload/FileUploader";
import PreprocessInfo from "@/components/analysis/PreprocessInfo";
import AnalysisResult from "@/components/analysis/AnalysisResult";
import { AnalysisResult as AnalysisResultType } from "@/types/analysis";

export default function HomePage() {
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadSuccess = (result: AnalysisResultType) => {
    setAnalysisResult(result);
  };

  const handleUploadStart = () => {
    setIsLoading(true);
    setAnalysisResult(null);
  };

  const handleUploadEnd = () => {
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">프로토타입</h1>
          <p className="text-gray-600">
            프로젝트 구조 분석 및 아키텍처 시각화 도구
          </p>
        </header>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 왼쪽: 업로드 */}
          <div>
            <FileUploader
              onUploadSuccess={handleUploadSuccess}
              onUploadStart={handleUploadStart}
              onUploadEnd={handleUploadEnd}
            />
          </div>

          {/* 오른쪽: 결과 */}
          <div className="space-y-6">
            {/* 로딩 상태 */}
            {isLoading && (
              <div className="rounded-lg bg-white p-12 text-center shadow">
                <div className="flex flex-col items-center">
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="font-medium text-gray-600">분석 중...</p>
                  <p className="mt-2 text-sm text-gray-500">
                    AI가 프로젝트 구조를 분석하고 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* 분석 결과 */}
            {analysisResult && !isLoading && (
              <>
                <PreprocessInfo data={analysisResult.data.projectInfo} />
                <AnalysisResult data={analysisResult.data} />
              </>
            )}

            {/* 초기 상태 안내 */}
            {!analysisResult && !isLoading && (
              <div className="rounded-lg bg-white p-12 text-center shadow">
                <div className="mb-4 text-gray-400">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">
                  프로젝트 ZIP 파일을 업로드하면
                  <br />
                  AI 분석 결과가 여기에 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 안내 */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            최대 250MB의 ZIP 파일을 업로드할 수 있습니다. <br />
            프로젝트 구조가 분석되면 아키텍처 패턴과 레이어 정보를 확인할 수
            있습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}
