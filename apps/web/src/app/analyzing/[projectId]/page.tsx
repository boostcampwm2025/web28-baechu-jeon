import AnalyzingView from "@/components/analyzing/AnalyzingView";

export default async function AnalyzingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <AnalyzingView projectId={projectId} />;
}
