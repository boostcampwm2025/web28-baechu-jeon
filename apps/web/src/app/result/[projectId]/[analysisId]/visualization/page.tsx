import VisualizationClient from "@/components/result/visualization/VisualizationClient";
import { getIntentions } from "@/api/intention";
import { getVisualization } from "@/api/visualization";
import { getProjectStructure } from "@/api/project";
import { transformApiToReactFlow } from "@/utils/transformNodes";

interface PageProps {
  params: Promise<{ projectId: string; analysisId: string }>;
}

// TODO: 백엔드 relatedPaths 구현 후 아래 함수 제거
function generateMockRelatedPaths(files: string[], nodeCount: number) {
  const chunkSize = Math.max(1, Math.floor(files.length / nodeCount));
  return Array.from({ length: nodeCount }, (_, i) =>
    files.slice(i * chunkSize, i * chunkSize + Math.min(chunkSize, 3)),
  );
}

export default async function VisualizationPage({ params }: PageProps) {
  const { projectId, analysisId } = await params;

  const [intentions, visualization, structure] = await Promise.all([
    getIntentions(analysisId),
    getVisualization(analysisId),
    getProjectStructure(projectId),
  ]);

  // TODO: 백엔드 relatedPaths 구현 후 아래 mock 제거
  const allFiles = structure.projectStructure.files;
  const step1Count = visualization.nodes.STEP1.length;
  const mockRelatedPaths = generateMockRelatedPaths(allFiles, step1Count);
  visualization.nodes.STEP1 = visualization.nodes.STEP1.map((node, i) => ({
    ...node,
    relatedPaths: node.relatedPaths?.length
      ? node.relatedPaths
      : mockRelatedPaths[i] || [],
  }));

  const { reactFlowNodes, reactFlowEdges } =
    transformApiToReactFlow(visualization);

  // TODO: 나중에 updateVisualization 기능 복구 시 아래 주석 해제
  // const { updatedApiNodes } = transformApiToReactFlow(visualization);
  // if (visualization.layoutState === "INITIAL") {
  //   const groupedNodes = {
  //     STEP1: updatedApiNodes.nodes.filter((n) => n.diagramType === "STEP1"),
  //     STEP2: updatedApiNodes.nodes.filter((n) => n.diagramType === "STEP2"),
  //     STEP3: updatedApiNodes.nodes.filter((n) => n.diagramType === "STEP3"),
  //   };

  //   await updateVisualization(visualization.visualizationId, {
  //     nodes: groupedNodes,
  //     edges: updatedApiNodes.edges,
  //     layoutState: "FIXED",
  //   });
  // }

  return (
    <VisualizationClient
      initialPurposes={intentions.contents}
      initialNodes={reactFlowNodes}
      initialEdges={reactFlowEdges}
      visualizationId={visualization.visualizationId}
    />
  );
}
