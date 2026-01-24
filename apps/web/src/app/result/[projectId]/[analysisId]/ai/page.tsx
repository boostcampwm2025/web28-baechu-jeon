import AiAnalysisView from "@/components/result/ai/AiAnalysisView";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default async function AiAnalysisPage({
  params,
}: {
  params: Promise<{ projectId: string; analysisId: string }>;
}) {
  const { projectId, analysisId } = await params;

  // 백엔드 API 호출
  let data;
  try {
    const response = await fetch(`${API_BASE_URL}/ai/${analysisId}/result`, {
      cache: "no-store", // 항상 최신 데이터 가져오기
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    data = await response.json();
  } catch (error) {
    // 에러 발생 시 에러 메시지 표시
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            AI 분석 결과
          </h1>
          <p className="text-gray-600">
            분석 ID:{" "}
            <span className="font-mono text-blue-500">{analysisId}</span>
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">
            데이터를 불러올 수 없습니다
          </h2>
          <p className="text-red-600">
            {error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다."}
          </p>
          <p className="mt-2 text-sm text-red-500">
            백엔드 서버가 실행 중인지 확인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">AI 분석 결과</h1>
        <p className="text-gray-600">
          분석 ID:{" "}
          <span className="font-mono text-blue-500">{analysisId}</span>
        </p>
      </div>

      <AiAnalysisView data={data} />
    </div>
  );
}
