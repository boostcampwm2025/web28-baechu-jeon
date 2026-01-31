"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { getCode } from "@/api/code";
import { maybeDecode } from "@/utils/url";

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
    if (!initialFilePath) return;
    const decodedInitial = maybeDecode(initialFilePath) ?? initialFilePath;
    if (selectedFilePath !== decodedInitial) {
      setSelectedFilePath(decodedInitial);
    }
  }, [initialFilePath, selectedFilePath, setSelectedFilePath]);

  useEffect(() => {
    const initialNormalized = initialFilePath
      ? maybeDecode(initialFilePath)
      : undefined;
    const file = selectedFilePath ?? initialNormalized ?? initialFilePath;
    if (!file || !params.analysisId) return;

    // 프리패치 캐시 확인
    const cached = useVisualizationStore
      .getState()
      .getCachedCode(params.analysisId, file);
    if (cached) {
      setContent(cached);
      setLoading(false);
      setError(null);
      return;
    }

    // initialContent가 있고 현재 파일과 일치하면 사용
    if (initialContent && initialNormalized === file) {
      setContent(initialContent);
      setLoading(false);
      return;
    }

    // 네트워크에서 가져옵니다
    const controller = new AbortController();
    setLoading(true);
    setError(null);

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

  // 첫 탭(코드) 렌더 직후 백그라운드로 시각화 데이터를 프리패치합니다
  useEffect(() => {
    if (!params.analysisId) return;
    // 비동기 프리패치, 실패해도 무시
    (async () => {
      try {
        const { getVisualization } = await import("@/api/visualization");
        await getVisualization(params.analysisId);
      } catch {
        /* ignore */
      }
    })();
  }, [params.analysisId]);

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
