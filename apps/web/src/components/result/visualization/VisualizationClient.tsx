"use client";

import { BaseNodeData } from "@/utils/layouts/layoutSettings";
import { useEffect, useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { type Node, type Edge } from "@xyflow/react";
import type { VisualizationResponse } from "@/api/visualization";
import NodeDetails from "./NodeDetails";
import ProjectDetails from "./ProjectDetails";
import SaveButtons from "./SaveButtons";
import VisualizationView from "./VisualizationView";
import { NodeData, ProjectDetailsData } from "@/types/visualization";
import { findInitialNode } from "@/utils/nodeHelpers";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { useExplorerStore } from "@/stores/useExplorerStore";

interface VisualizationClientProps {
  initialNodes?: Node<BaseNodeData>[];
  initialEdges?: Edge[];
  initialPurposes?: ProjectDetailsData;
  visualizationId: string;
}

export default function VisualizationClient({
  initialNodes = [],
  initialEdges = [],
  initialPurposes,
  visualizationId,
}: VisualizationClientProps) {
  const {
    setSelectedNodeId,
    setSelectedFilePath,
    panelNode,
    setPanelNode,
    isNodeOpen,
    setIsNodeOpen,
    isProjectOpen,
    setIsProjectOpen,
  } = useVisualizationStore();

  const initialData = useMemo(
    () => findInitialNode(initialNodes),
    [initialNodes],
  );

  useEffect(() => {
    if (initialData && !panelNode) {
      setSelectedNodeId(initialData.id);
      setPanelNode(initialData);
      setIsNodeOpen(true);
      setIsProjectOpen(true);
    }
  }, [
    initialData,
    panelNode,
    setSelectedNodeId,
    setPanelNode,
    setIsNodeOpen,
    setIsProjectOpen,
  ]);

  // 서버에서 초기 데이터를 넘기지 않더라도 마운트 후 필요 시 시각화 데이터를 가져오기
  const [nodes, setNodes] = useState<Node<BaseNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [purposes, setPurposes] = useState<ProjectDetailsData | undefined>(
    initialPurposes,
  );
  const [loading, setLoading] = useState(
    () => !(initialNodes && initialNodes.length) && !!visualizationId,
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchVisual() {
      if ((initialNodes && initialNodes.length) || !visualizationId) return;
      setLoading(true);
      try {
        const { getIntentions } = await import("@/api/intention");
        const { getVisualization } = await import("@/api/visualization");

        const [intentions, ver] = await Promise.all([
          getIntentions(visualizationId),
          getVisualization(visualizationId),
        ]);

        if (cancelled) return;

        const { transformApiToReactFlow } =
          await import("@/utils/transformNodes");
        const { reactFlowNodes, reactFlowEdges } = transformApiToReactFlow(
          ver as VisualizationResponse,
        );

        setNodes(reactFlowNodes);
        setEdges(reactFlowEdges);
        setPurposes(intentions.contents);
      } catch (e) {
        console.error("Client fetch visualization failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVisual();
    return () => {
      cancelled = true;
    };
  }, [initialNodes, visualizationId]);

  const params = useParams();
  const analysisIdParam = params?.analysisId as string | undefined;

  // 코드 탭 컴포넌트 번들 프리패치
  useEffect(() => {
    import("@/components/result/code/CodeView").catch(() => {});
  }, []);

  // nodes가 로드되면 STEP1의 모든 relatedPaths를 수집하여 indicatedPaths에 설정
  const setIndicatedPaths = useExplorerStore((s) => s.setIndicatedPaths);
  const clearIndicatedPaths = useExplorerStore((s) => s.clearIndicatedPaths);

  useEffect(() => {
    if (nodes.length === 0) return;

    const allRelatedPaths = new Set<string>();
    nodes.forEach((node) => {
      if (node.data.diagramType === "STEP1" && node.data.relatedPaths) {
        node.data.relatedPaths.forEach((path: string) =>
          allRelatedPaths.add(path),
        );
      }
    });
    console.log("Setting indicated paths:", allRelatedPaths);
    if (allRelatedPaths.size > 0) {
      setIndicatedPaths([...allRelatedPaths]);
    }

    return () => {
      clearIndicatedPaths();
    };
  }, [nodes, setIndicatedPaths, clearIndicatedPaths]);

  // STEP1 클릭으로 하이라이트된 경로가 바뀌면 첫 파일의 코드를 프리패치합니다.
  const highlightedPaths = useExplorerStore((s) => s.highlightedPaths);
  const setCachedCode = useVisualizationStore((s) => s.setCachedCode);

  useEffect(() => {
    if (!analysisIdParam || highlightedPaths.length === 0) return;
    const firstPath = highlightedPaths[0];
    if (
      useVisualizationStore.getState().getCachedCode(analysisIdParam, firstPath)
    )
      return;

    (async () => {
      try {
        const { getCode } = await import("@/api/code");
        const result = await getCode(analysisIdParam, firstPath);
        setCachedCode(analysisIdParam, firstPath, result.markdownContent);
      } catch {
        /* ignore */
      }
    })();
  }, [analysisIdParam, highlightedPaths, setCachedCode]);

  const handleNodeClick = useCallback(
    (node: NodeData | null) => {
      if (!node) return;

      if (node.diagramType === "STEP1") {
        setSelectedNodeId(null);
        return;
      }
      setSelectedNodeId(node.id);

      if (node.diagramType === "STEP2" && node.nodeType !== "FILE") {
        setPanelNode(node);
        setIsNodeOpen(true);
      }
    },
    [setSelectedNodeId, setPanelNode, setIsNodeOpen],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedFilePath(null);
    setIsNodeOpen(false);
    setIsProjectOpen(false);
  }, [setSelectedNodeId, setSelectedFilePath, setIsNodeOpen, setIsProjectOpen]);

  if (loading) {
    return (
      <div className="bg-page relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-8">
          {/* 노드 스켈레톤 */}
          <div className="flex items-center gap-6">
            <div className="bg-hover h-16 w-28 animate-pulse rounded-lg" />
            <div className="bg-hover h-1 w-10 animate-pulse rounded" />
            <div className="bg-hover h-16 w-28 animate-pulse rounded-lg" />
            <div className="bg-hover h-1 w-10 animate-pulse rounded" />
            <div className="bg-hover h-16 w-28 animate-pulse rounded-lg" />
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-hover h-12 w-24 animate-pulse rounded-lg" />
            <div className="bg-hover h-1 w-8 animate-pulse rounded" />
            <div className="bg-hover h-12 w-24 animate-pulse rounded-lg" />
            <div className="bg-hover h-1 w-8 animate-pulse rounded" />
            <div className="bg-hover h-12 w-24 animate-pulse rounded-lg" />
            <div className="bg-hover h-1 w-8 animate-pulse rounded" />
            <div className="bg-hover h-12 w-24 animate-pulse rounded-lg" />
          </div>
          <p className="text-muted text-sm">다이어그램을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="bg-page relative h-full w-full overflow-hidden">
        {/* 모바일/작은 화면 경고 메시지 */}
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm md:hidden">
          <div className="bg-surface mx-4 max-w-md rounded-lg p-8 text-center shadow-2xl">
            <div className="mb-4 text-5xl">💻</div>
            <h2 className="text-heading mb-3 text-xl font-bold">
              데스크톱 환경 권장
            </h2>
            <p className="text-body mb-2 text-sm leading-relaxed">
              이 서비스는 <strong>데스크톱 환경</strong>에 최적화되어 있습니다.
            </p>
            <p className="text-muted text-xs">
              더 나은 사용 경험을 위해 PC 또는 태블릿의 가로 모드를
              이용해주세요.
            </p>
          </div>
        </div>
      </div>

      <VisualizationView
        initialNodes={nodes}
        initialEdges={edges}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        visualizationId={visualizationId}
      />

      <aside
        id="details-panel"
        className="pointer-events-none absolute top-6 right-6 bottom-6 z-50 flex w-96 flex-col gap-4"
      >
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            panelNode && isNodeOpen
              ? "h-80 translate-x-0 opacity-100"
              : "h-0 translate-x-10 opacity-0"
          }`}
        >
          <div className="pointer-events-auto h-full">
            {panelNode && (
              <NodeDetails
                node={panelNode}
                isOpen={isNodeOpen}
                onClose={() => setIsNodeOpen(false)}
              />
            )}
          </div>
        </div>

        {purposes && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isProjectOpen
                ? "flex-1 translate-x-0 opacity-100"
                : "h-0 translate-x-10 opacity-0"
            }`}
          >
            <div className="pointer-events-auto h-full">
              <ProjectDetails
                data={purposes}
                onClose={() => setIsProjectOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="pointer-events-auto mt-auto">
          <SaveButtons
            isProjectOpen={isProjectOpen}
            onProjectDetails={() => setIsProjectOpen(true)}
            onFolderDetails={() => setIsNodeOpen(true)}
          />
        </div>
      </aside>
    </div>
  );
}
