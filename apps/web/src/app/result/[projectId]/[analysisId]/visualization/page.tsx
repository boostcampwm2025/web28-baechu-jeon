import { Node, Edge } from "@xyflow/react";
import { BaseNodeData } from "@/utils/transformNodes";
import VisualizationClient from "@/components/result/visualization/VisualizationClient";
import { getIntentions } from "@/api/intention";
import { getVisualization, updateVisualization } from "@/api/visualization";
import { transformApiToReactFlow } from "@/utils/transformNodes";

interface PageProps {
  params: Promise<{ projectId: string; analysisId: string }>;
}

export default async function VisualizationPage({ params }: PageProps) {
  const { analysisId } = await params;

  const [intentions, visualization] = await Promise.all([
    getIntentions(analysisId),
    getVisualization(analysisId),
  ]);

  const { reactFlowNodes, reactFlowEdges, updatedApiNodes } =
    transformApiToReactFlow(visualization);

  // layoutState가 INITIAL인 경우만 좌표 업데이트
  if (visualization.layoutState === "INITIAL") {
    await updateVisualization(visualization.visualizationId, updatedApiNodes);
  }

  return (
    <VisualizationClient
      initialPurposes={intentions.contents}
      initialNodes={reactFlowNodes}
      initialEdges={reactFlowEdges}
      visualizationId={visualization.visualizationId}
    />
  );
}
