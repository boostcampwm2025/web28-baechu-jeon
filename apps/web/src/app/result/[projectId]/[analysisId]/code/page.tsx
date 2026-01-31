import CodeView from "@/components/result/code/CodeView";
import { getCode } from "@/api/code";
import { maybeDecode } from "@/utils/url";

interface Props {
  params: { projectId: string; analysisId: string };
  searchParams?: { filePath?: string };
}

export default async function CodePage({ params, searchParams }: Props) {
  const rawFilePath = searchParams?.filePath;
  const filePath = rawFilePath ? maybeDecode(rawFilePath) : undefined;
  let initialContent: string | undefined = undefined;

  if (filePath) {
    try {
      const res = await getCode(params.analysisId, filePath);
      initialContent = res.markdownContent;
    } catch (e) {
      console.error("SSR getCode failed:", e);
    }
  }

  return (
    <CodeView initialFilePath={filePath} initialContent={initialContent} />
  );
}
