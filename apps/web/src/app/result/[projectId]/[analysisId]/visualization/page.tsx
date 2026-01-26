import type { Node, Edge } from "@xyflow/react";
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
  let initialEdges: Edge[] = [];
  const visualizationId = visualization?.visualizationId;

  if (visualization) {
    const { reactFlowNodes, reactFlowEdges, updatedApiNodes } =
      transformApiToReactFlow(visualization);
    initialNodes = reactFlowNodes;
    initialEdges = reactFlowEdges;

    // layoutState가 INITIAL인 경우만 좌표 업데이트
    if (visualization.layoutState === "INITIAL") {
      await updateVisualization(visualization.visualizationId, updatedApiNodes);
    }
  }

  return (
    <VisualizationClient
      initialPurposes={intentions}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      visualizationId={visualizationId}
    />
  );
}
