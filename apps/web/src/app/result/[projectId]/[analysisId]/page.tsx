import ResultTabsClient from "@/components/result/ResultTabsClient";
import { getVisualization, updateVisualization } from "@/api/visualization";
import { getIntentions } from "@/api/intention";
import { calculateInitialLayout } from "@/utils/layouts/layoutCalculator";
import type { VisualizationResponse } from "@/api/visualization";
import type { GetIntentionsResponse } from "@/types/intentionApi";
export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; analysisId: string }>;
  searchParams: Promise<{ tab?: string; filePath?: string }>;
}) {
  const { projectId, analysisId } = await params;
  const resolvedSearchParams = await searchParams;

  const initialTab =
    resolvedSearchParams?.tab === "code" ? "code" : "visualization";
  const initialFilePath = resolvedSearchParams?.filePath ?? null;

  let initialVisualizationData: VisualizationResponse | null = null;
  let initialIntentionsData: GetIntentionsResponse | null = null;

  try {
    const [vizData, intentionsData] = await Promise.all([
      getVisualization(analysisId),
      getIntentions(analysisId),
    ]);

    initialVisualizationData = vizData;
    initialIntentionsData = intentionsData;

    // 레이아웃이 초기 상태일 때만 서버에서 계산 및 DB 업데이트
    if (vizData.layoutState === "INITIAL") {
      const layoutResult = calculateInitialLayout(vizData.nodes, vizData.edges);

      await updateVisualization(vizData.visualizationId, {
        nodes: layoutResult.nodes,
        edges: layoutResult.edges,
        layoutState: "FIXED",
      });

      // 덮어씌워서 클라이언트에 최신 좌표를 보냄
      initialVisualizationData = {
        ...vizData,
        nodes: layoutResult.nodes,
        edges: layoutResult.edges,
        layoutState: "FIXED",
      };
    }
  } catch (error) {
    console.error("Data fetching failed:", error);
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
