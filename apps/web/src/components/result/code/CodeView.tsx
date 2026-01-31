"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { getCode } from "@/api/code";

type Props = {
  initialFilePath?: string | null;
  initialContent?: string | null;
};

export default function CodeView({ initialFilePath, initialContent }: Props) {
  const params = useParams<{ analysisId: string }>();
  const selectedFilePath = useVisualizationStore((s) => s.selectedFilePath);
  const setSelectedFilePath = useVisualizationStore(
    (s) => s.setSelectedFilePath,
  );

  const [content, setContent] = useState(initialContent ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFilePath && selectedFilePath !== initialFilePath) {
      setSelectedFilePath(initialFilePath);
    }
  }, [initialFilePath, selectedFilePath, setSelectedFilePath]);

  useEffect(() => {
    const file = selectedFilePath ?? initialFilePath;
    if (!file || !params.analysisId) return;

    // 서버에서 이미 받아온 내용이면 재요청하지 않음
    if (initialContent && initialFilePath === file) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    // 일시적 네트워크/서버 오류로 인해 서버에서 못 받아온 겨웅 사용자 경험 개선을 위한 1회 재시도
    getCode(params.analysisId, file, controller.signal)
      .then((res) => setContent(res.markdownContent))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("파일을 불러올 수 없습니다.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [selectedFilePath, params.analysisId, initialFilePath, initialContent]);

  const fileToShow = selectedFilePath ?? initialFilePath;

  if (!fileToShow) {
    return (
      <div className="text-muted flex h-full items-center justify-center">
        왼쪽 파일 탐색기에서 파일을 선택하세요.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-line bg-surface flex shrink-0 items-center border-b px-4 py-2">
        <span className="text-body text-sm font-medium">{fileToShow}</span>
      </div>

      {loading && (
        <div className="text-muted flex flex-1 items-center justify-center">
          불러오는 중...
        </div>
      )}

      {error && (
        <div className="flex flex-1 items-center justify-center text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex-1 overflow-auto p-6">
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
