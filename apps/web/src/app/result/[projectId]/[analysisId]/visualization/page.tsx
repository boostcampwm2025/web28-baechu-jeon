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

  if (visualization.layoutState === "INITIAL") {
    const groupedNodes = {
      STEP1: updatedApiNodes.nodes.filter((n) => n.diagramType === "STEP1"),
      STEP2: updatedApiNodes.nodes.filter((n) => n.diagramType === "STEP2"),
      STEP3: updatedApiNodes.nodes.filter((n) => n.diagramType === "STEP3"),
    };

    await updateVisualization(visualization.visualizationId, {
      nodes: groupedNodes,
      edges: updatedApiNodes.edges,
      layoutState: "FIXED",
    });
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
