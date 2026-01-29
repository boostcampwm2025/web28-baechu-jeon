"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useVisualizationStore } from "@/stores/useVisualizationStore";
import { getCode } from "@/api/code";

export default function CodeView() {
  const params = useParams<{ analysisId: string }>();
  const selectedFilePath = useVisualizationStore((s) => s.selectedFilePath);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFilePath || !params.analysisId) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getCode(params.analysisId, selectedFilePath, controller.signal)
      .then((res) => setContent(res.markdownContent))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("파일을 불러올 수 없습니다.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [selectedFilePath, params.analysisId]);

  if (!selectedFilePath) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        왼쪽 파일 탐색기에서 파일을 선택하세요.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-slate-200 bg-slate-50 px-4 py-2">
        <span className="text-sm font-medium text-slate-700">
          {selectedFilePath}
        </span>
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center text-slate-400">
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
