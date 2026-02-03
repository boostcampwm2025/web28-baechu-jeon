import VisualizationClient from "@/components/result/visualization/VisualizationClient";
import { getIntentions } from "@/api/intention";
import { getVisualization, updateVisualization } from "@/api/visualization";
import { transformApiToReactFlow } from "@/utils/transformNodes";
import { calculateInitialLayout } from "@/utils/layouts/layoutCalculator";

interface PageProps {
  params: Promise<{ projectId: string; analysisId: string }>;
}

export default async function VisualizationPage({ params }: PageProps) {
  const { analysisId } = await params;

  const [intentions, visualization] = await Promise.all([
    getIntentions(analysisId),
    getVisualization(analysisId),
  ]);

  let nodesToRender = visualization.nodes;
  let edgesToRender = visualization.edges;

  if (visualization.layoutState === "INITIAL") {
    const layoutResult = calculateInitialLayout(nodesToRender, edgesToRender); //초기일 때만 레이아웃 좌표 계산

    await updateVisualization(visualization.visualizationId, {
      nodes: layoutResult.nodes,
      edges: layoutResult.edges,
      layoutState: "FIXED",
    });

    nodesToRender = layoutResult.nodes;
    edgesToRender = layoutResult.edges;
  }

  // 리액트 플로우에서 사용할 형태로 노드, 엣지 가공
  const { reactFlowNodes, reactFlowEdges } = transformApiToReactFlow({
    ...visualization,
    nodes: nodesToRender,
    edges: edgesToRender,
  });

  return (
    <VisualizationClient
      initialPurposes={intentions.contents}
      initialNodes={reactFlowNodes}
      initialEdges={reactFlowEdges}
      visualizationId={visualization.visualizationId}
    />
  );
}
