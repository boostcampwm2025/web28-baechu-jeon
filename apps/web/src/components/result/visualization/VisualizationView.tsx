"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { type BaseNodeData } from "@/utils/layouts/layoutSettings";
import BaseNode from "@/components/result/visualization/nodes/BaseNode";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { NodeData } from "@/types/visualization";
import { useNodeHighlight } from "@/hooks/useNodeHighlight";
import { convertToNodeData } from "@/utils/nodeHelpers";
import { useExplorerStore } from "@/stores/useExplorerStore";
import { maybeDecode } from "@/utils/url";

const nodeTypes: NodeTypes = {
  baseNode: BaseNode,
};

interface VisualizationViewProps {
  visualizationId?: string;
  initialNodes: Node<BaseNodeData>[];
  initialEdges: Edge[];
  onNodeClick: (node: NodeData) => void;
  onPaneClick?: () => void;
}

export default function VisualizationView({
  onNodeClick,
  onPaneClick,
  initialNodes = [],
  initialEdges = [],
}: VisualizationViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 데이터 도착 시 1회만 동기화 (빈 배열 → 데이터 로드 완료)
  const hasSynced = useRef(initialNodes.length > 0);
  useEffect(() => {
    if (!hasSynced.current && initialNodes.length > 0) {
      hasSynced.current = true;
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const { toggleHighlight, resetHighlights } = useNodeHighlight(setNodes);

  const setHighlightedPaths = useExplorerStore((s) => s.setHighlightedPaths);
  const clearHighlightedPaths = useExplorerStore(
    (s) => s.clearHighlightedPaths,
  );

  const { getViewport } = useReactFlow();
  const setStoreViewport = useVisualizationStore((state) => state.setViewport);

  const setSelectedNodeId = useVisualizationStore((s) => s.setSelectedNodeId);

  /**
   * 노드 클릭 핸들러
   */
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<BaseNodeData>) => {
      setSelectedNodeId(node.id);
      onNodeClick(convertToNodeData(node));

      if (node.data.diagramType === "STEP1") {
        if (node.data.relatedNodeIds?.length) {
          const isHighlighted = toggleHighlight(node.id, [
            node.id,
            ...node.data.relatedNodeIds,
          ]);

          if (isHighlighted) {
            setHighlightedPaths(node.data.relatedPaths || []);
            return;
          }

          clearHighlightedPaths();
          return;
        }
        resetHighlights();
        clearHighlightedPaths();
        return;
      }

      if (node.data.type === "FILE") {
        if (node.data.path) {
          const decoded = maybeDecode(node.data.path) ?? node.data.path;

          // URL만 변경 (상태는 ResultTabsClient에서 URL 감시하여 동기화)
          const params = new URLSearchParams(searchParams.toString());
          params.set("tab", "code");
          params.set("filePath", decoded);
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        } else {
          // 파일 경로 없이 코드 탭으로만 이동
          const params = new URLSearchParams(searchParams.toString());
          params.set("tab", "code");
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
      }
    },
    [
      onNodeClick,
      toggleHighlight,
      resetHighlights,
      clearHighlightedPaths,
      setHighlightedPaths,
      setSelectedNodeId,
      router,
      pathname,
      searchParams,
    ],
  );

  /**
   * Pane 클릭 → 선택 해제
   */
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    onPaneClick?.();
  }, [setSelectedNodeId, onPaneClick]);

  /**
   * 뷰포트 이동 종료 시 저장
   */
  const handleMoveEnd = useCallback(() => {
    const currentViewport = getViewport();
    setStoreViewport(currentViewport);
  }, [getViewport, setStoreViewport]);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onMoveEnd={handleMoveEnd}
        onInit={(instance) => {
          const state = useVisualizationStore.getState();

          if (state.viewport) {
            instance.setViewport(state.viewport);
            return;
          }

          const step1Group = nodes.find((n) => n.id === "group-STEP1");
          if (step1Group) {
            instance.setViewport({
              x: -step1Group.position.x + 50,
              y: -step1Group.position.y + 150,
              zoom: 0.5,
            });
          }
        }}
        nodesConnectable={false}
        deleteKeyCode={null}
        elementsSelectable
        nodesDraggable
        minZoom={0.2}
        maxZoom={1.0}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: "var(--color-muted)",
          },
        }}
        className="bg-[var(--color-page)]"
      >
        <Background color="var(--color-line)" gap={24} />

        <Controls className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] [&>button]:border-[var(--color-line)] [&>button]:bg-[var(--color-surface)] [&>button]:text-[var(--color-subtle)] [&>button:hover]:bg-[var(--color-hover)]" />
      </ReactFlow>
    </div>
  );
}
