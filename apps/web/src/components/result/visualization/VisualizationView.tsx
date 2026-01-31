"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

const nodeTypes: NodeTypes = {
  baseNode: BaseNode,
};

interface VisualizationViewProps {
  visualizationId?: string;
  initialNodes: Node<BaseNodeData>[];
  initialEdges: Edge[];
  onNodeClick: (node: NodeData) => void;
  onPaneClick?: () => void;
  selectedNodeId?: string;
}

export default function VisualizationView({
  onNodeClick,
  onPaneClick,
  initialNodes = [],
  initialEdges = [],
}: VisualizationViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const analysisId = params.analysisId as string;

  const { toggleHighlight, resetHighlights } = useNodeHighlight(setNodes);

  const setHighlightedPaths = useExplorerStore((s) => s.setHighlightedPaths);
  const clearHighlightedPaths = useExplorerStore(
    (s) => s.clearHighlightedPaths,
  );

  const { getViewport } = useReactFlow();
  const setStoreViewport = useVisualizationStore((state) => state.setViewport);

  const {
    selectedNodeId,
    highlightNodeIds,
    setSelectedNodeId,
    setSelectedFilePath,
  } = useVisualizationStore();

  /**
   * 노드 클릭 핸들러
   */
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<BaseNodeData>) => {
      setSelectedNodeId(node.id);
      onNodeClick(convertToNodeData(node));

      if (node.data.diagramType === "STEP1") {
        if (node.data.relatedNodeIds?.length) {
          toggleHighlight(node.id, [node.id, ...node.data.relatedNodeIds]);
          setHighlightedPaths(node.data.relatedPaths || []);
        } else {
          resetHighlights();
          clearHighlightedPaths();
        }
      }

      if (node.data.type === "FILE") {
        if (node.data.path) {
          setSelectedFilePath(node.data.path);
        }
        router.push(`/result/${projectId}/${analysisId}/code`);
      }
    },
    [
      onNodeClick,
      toggleHighlight,
      resetHighlights,
      clearHighlightedPaths,
      setHighlightedPaths,
      setSelectedNodeId,
      setSelectedFilePath,
      router,
      projectId,
      analysisId,
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
