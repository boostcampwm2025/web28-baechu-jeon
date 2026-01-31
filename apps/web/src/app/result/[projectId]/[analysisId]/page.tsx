import ResultTabsClient from "@/components/result/ResultTabsClient";
import { getVisualization } from "@/api/visualization";
import { getIntentions } from "@/api/intention";
import type { VisualizationResponse } from "@/api/visualization";
import type { GetIntentionsResponse } from "@/types/intentionApi";

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; analysisId: string }>;
  searchParams?: { tab?: string; filePath?: string };
}) {
  const { projectId, analysisId } = await params;

  const initialTab = searchParams?.tab === "code" ? "code" : "visualization";
  const initialFilePath = searchParams?.filePath ?? null;

  // 서버에서 시각화 데이터를 미리 가져오기. 실패 시 클라이언트에서 재시도
  let initialVisualizationData: VisualizationResponse | null = null;
  let initialIntentionsData: GetIntentionsResponse | null = null;

  try {
    [initialVisualizationData, initialIntentionsData] = await Promise.all([
      getVisualization(analysisId),
      getIntentions(analysisId),
    ]);
  } catch {
    // 서버 fetch 실패 시 클라이언트에서 fallback
  }

  return (
    <ResultTabsClient
      projectId={projectId}
      analysisId={analysisId}
      initialTab={initialTab}
      initialFilePath={initialFilePath}
      initialVisualizationData={initialVisualizationData}
      initialIntentionsData={initialIntentionsData}
    />
  );
}
