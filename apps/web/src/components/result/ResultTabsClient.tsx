"use client";

import { useRef, useMemo } from "react";
import CodeView from "@/components/result/code/CodeView";
import VisualizationClient from "@/components/result/visualization/VisualizationClient";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { transformApiToReactFlow } from "@/utils/transformNodes";
import type { VisualizationResponse } from "@/api/visualization";
import type { GetIntentionsResponse } from "@/types/intentionApi";

type Props = {
  projectId: string;
  analysisId: string;
  initialTab?: "code" | "visualization";
  initialFilePath?: string | null;
  initialVisualizationData?: VisualizationResponse | null;
  initialIntentionsData?: GetIntentionsResponse | null;
};

export default function ResultTabsClient({
  analysisId,
  initialTab = "visualization",
  initialFilePath = null,
  initialVisualizationData = null,
  initialIntentionsData = null,
}: Props) {
  const activeTab = useVisualizationStore((s) => s.activeTab);
  const initialized = useRef(false);

  // 마운트 시 서버에서 내려준 initialTab으로 동기 세팅 (useEffect 대신 ref로 1회만)
  if (!initialized.current) {
    initialized.current = true;
    useVisualizationStore.getState().setActiveTab(initialTab);
  }

  // 서버에서 받은 raw 데이터를 ReactFlow 형식으로 변환
  const { initialNodes, initialEdges, initialPurposes } = useMemo(() => {
    if (!initialVisualizationData) {
      return { initialNodes: [], initialEdges: [], initialPurposes: undefined };
    }
    const { reactFlowNodes, reactFlowEdges } = transformApiToReactFlow(
      initialVisualizationData,
    );
    return {
      initialNodes: reactFlowNodes,
      initialEdges: reactFlowEdges,
      initialPurposes: initialIntentionsData?.contents,
    };
  }, [initialVisualizationData, initialIntentionsData]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className={`absolute inset-0 transition-all duration-300 ease-in-out ${
          activeTab === "code"
            ? "z-10 translate-x-0 opacity-100"
            : "pointer-events-none z-0 -translate-x-8 opacity-0"
        }`}
      >
        <CodeView initialFilePath={initialFilePath} />
      </div>

      <div
        className={`absolute inset-0 transition-all duration-300 ease-in-out ${
          activeTab === "visualization"
            ? "z-10 translate-x-0 opacity-100"
            : "pointer-events-none z-0 translate-x-8 opacity-0"
        }`}
      >
        <VisualizationClient
          visualizationId={analysisId}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          initialPurposes={initialPurposes}
        />
      </div>
    </div>
  );
}
