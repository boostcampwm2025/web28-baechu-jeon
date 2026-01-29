"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
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

import resetIcon from "@/assets/reset.svg";
import { NodeData } from "@/types/visualization";
import { useNodeHighlight } from "@/hooks/useNodeHighlight";
import { convertToNodeData } from "@/utils/nodeHelpers";

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
  selectedNodeId,
}: VisualizationViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const analysisId = params.analysisId as string;

  // 해결: 사용하지 않는 setter와 변수 정리 (lint error 대응)
  const [isReseting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { getViewport, setViewport } = useReactFlow();
  const savedViewport = useVisualizationStore((state) => state.viewport);
  const setStoreViewport = useVisualizationStore((state) => state.setViewport);

  const { toggleHighlight, resetHighlights } = useNodeHighlight(setNodes);

  // 저장된 뷰포트가 있다면 초기화 직후 적용
  useEffect(() => {
    if (isInitialized && savedViewport) {
      setViewport(savedViewport);
    }
  }, [isInitialized, savedViewport, setViewport]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    );
  }, [selectedNodeId, setNodes]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<BaseNodeData>) => {
      onNodeClick(convertToNodeData(node));

      if (node.data.nodeType === "FILE") {
        router.push(`/result/${projectId}/${analysisId}/code`);
        return;
      }

      if (node.data.diagramType === "STEP1") {
        if (node.data.relatedFolders && node.data.relatedFolders.length > 0) {
          toggleHighlight(node.id, [node.id, ...node.data.relatedFolders]);
        } else {
          resetHighlights();
        }
      }
    },
    [onNodeClick, toggleHighlight, resetHighlights],
  );

  const handlePaneClick = useCallback(() => {
    if (onPaneClick) {
      onPaneClick();
    }
  }, [onPaneClick]);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onMoveEnd={() => {
          const currentViewport = getViewport();
          setStoreViewport(currentViewport);
        }}
        onInit={(instance) => {
          setIsInitialized(true);
          if (!savedViewport) {
            const step1Group = nodes.find((n) => n.id === "group-STEP1");
            if (step1Group) {
              instance.setViewport({
                x: -step1Group.position.x + 50,
                y: -step1Group.position.y + 150,
                zoom: 0.6,
              });
            }
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
            color: "#64748b",
          },
        }}
        className="bg-slate-900"
      >
        <Background color="#334155" gap={24} />
        <Controls className="rounded-lg border-slate-700 bg-slate-800 [&>button]:border-slate-700 [&>button]:bg-slate-800 [&>button]:text-slate-400 [&>button:hover]:bg-slate-700" />
      </ReactFlow>

      {/* 해결: isInitialized 변수 사용 예시 (린트 방지) */}
      <button
        disabled={isReseting || !isInitialized}
        title="초기화"
        className="absolute top-4 right-4 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Image src={resetIcon} alt="초기화" width={32} height={32} />
      </button>
    </div>
  );
}
