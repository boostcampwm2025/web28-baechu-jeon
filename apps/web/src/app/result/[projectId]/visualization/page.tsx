import { mockNodes } from "@/mocks/detailData";
import VisualizationClient from "@/components/result/visualization/VisualizationClient";
import { getIntentions } from "@/api/intention";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function VisualizationPage({ params }: PageProps) {
  const { projectId } = await params;

  try {
    const intentionsData = await getIntentions(projectId);

    return (
      <VisualizationClient
        projectId={projectId}
        initialPurposes={intentionsData.contents}
        initialNodes={mockNodes}
      />
    );
  } catch (error) {
    console.error("Failed to load intentions:", error);
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }
}
