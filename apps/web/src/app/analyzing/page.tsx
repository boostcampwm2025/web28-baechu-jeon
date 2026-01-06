"use client";

import ProgressBar from "@/components/analyzing/ProgressBar";

export default function AnalyzingPage() {

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
          <ProgressBar />
          <p className="mt-3 text-center text-xs text-gray-500">
            약 40초~1분 소요 예상
          </p>
        </div>
      </div>
    </div>
  );
}

