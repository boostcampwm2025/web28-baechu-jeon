import type { Node } from "@xyflow/react";
import VisualizationClient from "@/components/result/visualization/VisualizationClient";
import { getIntentions } from "@/api/intention";
import { getVisualization, updateVisualization } from "@/api/visualization";
import { transformApiToReactFlow } from "@/utils/transformNodes";

interface PageProps {
  params: Promise<{ projectId: string; analysisId: string }>;
}

export default async function VisualizationPage({ params }: PageProps) {
  const { analysisId } = await params;

  const [intentionsResult, visualizationResult] = await Promise.allSettled([
    getIntentions(analysisId),
    getVisualization(analysisId),
  ]);

  const intentions =
    intentionsResult.status === "fulfilled"
      ? intentionsResult.value.contents
      : undefined;
  const visualization =
    visualizationResult.status === "fulfilled"
      ? visualizationResult.value
      : undefined;

  let initialNodes: Node[] = [];
  const visualizationId = visualization?.visualizationId;

  if (visualization) {
    const { reactFlowNodes, updatedApiNodes } =
      transformApiToReactFlow(visualization);
    initialNodes = reactFlowNodes;

    // 모든 노드가 "default"(초기 상태)인지 확인
    const isInitialState = visualization.nodes.every(
      (node) => node.x === "default" && node.y === "default",
    );

    // 기존 데이터가 초기 상태인 경우만 서버에 처음 계산한 좌표 업데이트
    if (isInitialState) {
      await updateVisualization(visualization.visualizationId, updatedApiNodes);
    }
  }

  return (
    <VisualizationClient
      initialPurposes={intentions}
      initialNodes={initialNodes}
      visualizationId={visualizationId}
    />
  );
}
