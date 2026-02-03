"use client";

import { useMemo, useEffect, useLayoutEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { transformApiToReactFlow } from "@/utils/transformNodes";
import type { VisualizationResponse } from "@/api/visualization";
import type { GetIntentionsResponse } from "@/types/intentionApi";
import { Node, Edge } from "@xyflow/react";
import { BaseNodeData } from "@/utils/layouts/layoutSettings";

const CodeView = dynamic(() => import("@/components/result/code/CodeView"), {
  ssr: false,
});

const VisualizationClient = dynamic(
  () => import("@/components/result/visualization/VisualizationClient"),
  { ssr: false },
);

type Props = {
  projectId: string;
  analysisId: string;
  visualizationId: string;
  initialTab?: "code" | "visualization";
  initialFilePath?: string | null;
  initialVisualizationData?: VisualizationResponse | null;
  initialIntentionsData?: GetIntentionsResponse | null;
};

export default function ResultTabsClient({
  visualizationId,
  analysisId,
  initialTab = "visualization",
  initialFilePath = null,
  initialVisualizationData = null,
  initialIntentionsData = null,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL을 소스 오브 트루스로 사용
  const activeTab =
    (searchParams.get("tab") as "code" | "visualization") ?? "visualization";
  const setSelectedFilePath = useVisualizationStore(
    (s) => s.setSelectedFilePath,
  );

  // 한번 로드된 탭은 계속 유지 (상태 보존)
  const [codeLoaded, setCodeLoaded] = useState(initialTab === "code");
  const [vizLoaded, setVizLoaded] = useState(initialTab === "visualization");

  useEffect(() => {
    if (activeTab === "code") setCodeLoaded(true);
    if (activeTab === "visualization") setVizLoaded(true);
  }, [activeTab]);

  // filePath만 store에 동기화 (코드 프리페치 캐시용)
  useLayoutEffect(() => {
    const filePathFromUrl = searchParams.get("filePath");
    if (filePathFromUrl) {
      setSelectedFilePath(filePathFromUrl);
    }
  }, [searchParams, setSelectedFilePath]);

  // 첫 진입 시 URL에 쿼리 파라미터가 없으면 초기화
  useEffect(() => {
    if (!searchParams.has("tab")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", initialTab);
      if (initialFilePath) {
        params.set("filePath", initialFilePath);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, []);

  // 서버에서 받은 raw 데이터를 ReactFlow 형식으로 변환
  const { initialNodes, initialEdges, initialPurposes } = useMemo(() => {
    if (!initialVisualizationData) {
      return {
        initialNodes: [] as Node<BaseNodeData>[],
        initialEdges: [] as Edge[],
        initialPurposes: undefined,
      };
    }
    const { reactFlowNodes, reactFlowEdges } = transformApiToReactFlow(
      initialVisualizationData,
    );
    return {
      initialNodes: reactFlowNodes as Node<BaseNodeData>[],
      initialEdges: reactFlowEdges as Edge[],
      initialPurposes: initialIntentionsData?.contents,
    };
  }, [initialVisualizationData, initialIntentionsData]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className={`absolute inset-0 ${
          activeTab === "code"
            ? "z-10 opacity-100"
            : "pointer-events-none z-0 opacity-0"
        }`}
      >
        {codeLoaded && <CodeView initialFilePath={initialFilePath} />}
      </div>

      <div
        className={`absolute inset-0 ${
          activeTab === "visualization"
            ? "z-10 opacity-100"
            : "pointer-events-none z-0 opacity-0"
        }`}
      >
        {vizLoaded && (
          <VisualizationClient
            visualizationId={visualizationId}
            analysisId={analysisId}
            initialNodes={initialNodes}
            initialEdges={initialEdges}
            initialPurposes={initialPurposes}
          />
        )}
      </div>
    </div>
  );
}
