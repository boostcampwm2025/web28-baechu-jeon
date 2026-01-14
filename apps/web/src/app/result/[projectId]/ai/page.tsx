import { getAiAnalysisResult } from '@/api/analysis';

export default async function AiAnalysisPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  let aiAnalysisJson: string;
  try {
    const data = await getAiAnalysisResult(projectId);
    aiAnalysisJson = JSON.stringify(data, null, 2);
  } catch (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            AI 분석 결과
          </h1>
          <p className="text-gray-600">
            프로젝트 ID:{" "}
            <span className="font-mono text-blue-500">{projectId}</span>
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
          프로젝트 ID:{" "}
          <span className="font-mono text-blue-500">{projectId}</span>
        </p>
      </div>

      <div className="overflow-auto rounded-lg bg-gray-800 p-4 font-mono text-sm text-green-300 shadow-md">
        <pre>{aiAnalysisJson}</pre>
      </div>
    </div>
  );
}
