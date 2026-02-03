"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
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
  const [isDark, setIsDark] = useState(false);

  // 다크모드 감지 (light 클래스가 없으면 다크모드)
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(!document.documentElement.classList.contains("light"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // 최초 마운트 시 initialFilePath를 store에 동기화
  // initialFilePath는 서버에서 내려온 고정값이므로 실질적으로 1회만 실행됨
  useEffect(() => {
    if (!initialFilePath) return;
    const decodedInitial = maybeDecode(initialFilePath) ?? initialFilePath;
    setSelectedFilePath(decodedInitial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilePath]);

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
    if (cached !== undefined) {
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

  // 코드 탭이 초기 탭일 때만 백그라운드로 시각화 데이터를 프리패치합니다
  const hasPrefetched = useRef(false);
  useEffect(() => {
    if (!params.analysisId || hasPrefetched.current) return;
    if (useVisualizationStore.getState().activeTab !== "code") return;
    hasPrefetched.current = true;
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
        왼쪽 파일 탐색기에서 파일(점이 표시된 파일)을 선택하세요.
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
        <div className={`flex-1 overflow-auto bg-[var(--color-hover)] p-6`}>
          <div
            className={
              "prose prose-zinc prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-heading prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-p:text-[15px] prose-p:text-body prose-strong:font-semibold prose-strong:text-heading prose-code:rounded prose-code:bg-hover prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[14px] prose-code:font-normal prose-code:text-body prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:border-0 prose-pre:bg-transparent prose-pre:p-0 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:text-muted prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-li:text-body max-w-none" +
              (isDark
                ? " prose-invert prose-a:text-blue-400"
                : " prose-a:text-blue-600")
            }
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;

                  return isInline ? (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      style={isDark ? oneDark : oneLight}
                      language={match[1]}
                      PreTag="div"
                      customStyle={
                        {
                          margin: "1.5em 0",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                          lineHeight: "1.7",
                          border: "none",
                          boxShadow: "none",
                        } as React.CSSProperties
                      }
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
