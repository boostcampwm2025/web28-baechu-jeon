export async function getAiAnalysisResult(projectId: string): Promise<any> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/analysis/result/${projectId}/ai`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch AI analysis result");
  }

  return await response.json();
}
