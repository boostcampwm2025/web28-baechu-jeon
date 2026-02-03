"use client";

import { useCallback, useEffect, useState } from "react";
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
import { resetVisualization } from "@/api/visualization";
import { transformApiToReactFlow } from "@/utils/transformNodes";
import { HiOutlineRefresh } from "react-icons/hi";

const nodeTypes: NodeTypes = {
  baseNode: BaseNode,
};

interface VisualizationViewProps {
  visualizationId: string;
  initialNodes: Node<BaseNodeData>[];
  initialEdges: Edge[];
  onNodeClick: (node: NodeData) => void;
  onPaneClick?: () => void;
  selectedNodeId?: string;
}

export default function VisualizationView({
  visualizationId,
  onNodeClick,
  onPaneClick,
  initialNodes = [],
  initialEdges = [],
}: VisualizationViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [isResetting, setIsResetting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const analysisId = params.analysisId as string;

  const { toggleHighlight, resetHighlights } = useNodeHighlight(setNodes);
  const setHighlightedPaths = useExplorerStore((s) => s.setHighlightedPaths);
  const clearHighlightedPaths = useExplorerStore(
    (s) => s.clearHighlightedPaths,
  );
  const { fitView, getNodes, getViewport } = useReactFlow();
  const setStoreViewport = useVisualizationStore((state) => state.setViewport);

  const {
    selectedNodeId,
    highlightNodeIds,
    setSelectedNodeId,
    setSelectedFilePath,
    focusTargetType,
    setFocusTargetType,
  } = useVisualizationStore();

  useEffect(() => {
    if (!focusTargetType) return;

    if (focusTargetType === "ALL") {
      fitView({ duration: 800 });
    } else {
      const targetNodes = getNodes().filter(
        (n) => n.data.diagramType === focusTargetType,
      );
      if (targetNodes.length > 0) {
        fitView({
          nodes: targetNodes,
          duration: 1000,
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.0,
        });
      }
    }
    setFocusTargetType(null); // 실행 후 초기화
  }, [focusTargetType, fitView, getNodes, setFocusTargetType]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
        data: {
          ...node.data,
          highlightClass: highlightNodeIds.includes(node.id)
            ? "highlight-fixed"
            : "",
        },
      })),
    );
  }, [selectedNodeId, setNodes, highlightNodeIds]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<BaseNodeData>) => {
      setSelectedNodeId(node.id);
      onNodeClick(convertToNodeData(node));

      if (node.data.diagramType === "STEP1") {
        if (node.data.relatedNodeIds && node.data.relatedNodeIds.length > 0) {
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
        return;
      }
    },

    [
      onNodeClick,
      toggleHighlight,
      router,
      setSelectedNodeId,
      setSelectedFilePath,
      projectId,
      analysisId,
      resetHighlights,
      setHighlightedPaths,
      clearHighlightedPaths,
    ],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    if (onPaneClick) {
      onPaneClick();
    }
  }, [setSelectedNodeId, onPaneClick]);

  const handleMoveEnd = useCallback(() => {
    const currentViewport = getViewport();
    setStoreViewport(currentViewport);
  }, [getViewport, setStoreViewport]);

  const handleReset = useCallback(async () => {
    try {
      setIsResetting(true);
      const originalData = await resetVisualization(visualizationId);
      const { reactFlowNodes, reactFlowEdges } =
        transformApiToReactFlow(originalData);

      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);

      setSelectedNodeId(null);
      resetHighlights();
      clearHighlightedPaths();

      setTimeout(() => {
        fitView({ duration: 800 });
      }, 100);
    } catch (error) {
      console.error("레이아웃 초기화 실패:", error);
    } finally {
      setIsResetting(false);
    }
  }, [
    visualizationId,
    setNodes,
    setEdges,
    setSelectedNodeId,
    resetHighlights,
    clearHighlightedPaths,
    fitView,
  ]);

  return (
    <div className="relative h-full w-full" id="visualization-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onMoveEnd={handleMoveEnd}
        onInit={(instance) => {
          setIsInitialized(true);
          const state = useVisualizationStore.getState();
          if (state.viewport) {
            instance.setViewport(state.viewport);
          } else {
            const step1Group = nodes.find((n) => n.id === "group-STEP1");
            if (step1Group) {
              instance.setViewport({
                x: -step1Group.position.x + 50,
                y: -step1Group.position.y + 150,
                zoom: 0.5,
              });
            }
          }
        }}
        nodesConnectable={false}
        deleteKeyCode={null}
        elementsSelectable
        nodesDraggable
        minZoom={0.1}
        maxZoom={1.0}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: "#64748b",
          },
        }}
        className="bg-slate-900"
      >
        <Background color="#334155" gap={24} />
        <Controls className="rounded-lg border-slate-700 bg-slate-800 [&>button]:border-slate-700 [&>button]:bg-slate-800 [&>button]:text-slate-400 [&>button:hover]:bg-slate-700" />
      </ReactFlow>

      <button
        disabled={isResetting || !isInitialized}
        title="초기화"
        onClick={handleReset}
        className="absolute top-6 right-6 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-800/80 text-slate-300 shadow-xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-slate-700 hover:text-white active:scale-95 disabled:opacity-50"
      >
        {isResetting ? (
          <HiOutlineRefresh className="h-6 w-6 animate-spin text-blue-400" />
        ) : (
          <HiOutlineRefresh className="h-6 w-6 text-blue-400" />
        )}
      </button>
    </div>
  );
}
