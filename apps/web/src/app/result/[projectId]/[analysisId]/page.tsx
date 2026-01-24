export default async function ResultPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">프로젝트 결과</h1>
      <p>
        현재 접속한 프로젝트 ID:{" "}
        <span className="font-mono text-blue-500">{projectId}</span>
      </p>
    </div>
  );
}
