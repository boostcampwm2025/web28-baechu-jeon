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

        {/* 여기에 나중에 프로그레스 바와 분석 단계가 들어갈 자리 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-center text-gray-500">
            분석이 진행 중입니다...
          </p>
        </div>
      </div>
    </div>
  );
}

