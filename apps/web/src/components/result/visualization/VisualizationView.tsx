"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { type BaseNodeData } from "@/utils/layouts/layoutSettings";
import BaseNode from "@/components/result/visualization/nodes/BaseNode";

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
  // visualizationId,
}: VisualizationViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isReseting, setIsReseting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 노드 하이라이트 관리
  const { toggleHighlight, resetHighlights } = useNodeHighlight(setNodes);

  // 상위 컴포넌트에서 selectedNodeId가 바뀌면 nodes 상태 업데이트
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

      // 하이라이트 로직 (STEP1 노드 클릭 시 연관 폴더 강조)
      if (node.data.diagramType === "STEP1") {
        if (node.data.relatedFolders && node.data.relatedFolders.length > 0) {
          // 자기 자신 포함해서 하이라이트
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

  // 서버에서 초기화된 데이터를 GET 해옴
  // const handleReset = useCallback(async () => {
  //   if (!visualizationId || isReseting) return;

  //   try {
  //     setIsReseting(true);
  //     const data = await resetVisualization(visualizationId);
  //     const { reactFlowNodes, reactFlowEdges } = transformApiToReactFlow(data);

  //     setNodes(reactFlowNodes);
  //     setEdges(reactFlowEdges);
  //   } catch (err) {
  //     console.error("Reset failed:", err instanceof Error ? err.message : err);
  //   } finally {
  //     setIsReseting(false);
  //   }
  // }, [visualizationId, isReseting, setNodes, setEdges]);

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
        onInit={(instance) => {
          setIsInitialized(true);
          // STEP1 그룹의 위치와 크기 찾기
          const step1Group = nodes.find((n) => n.id === "group-STEP1");
          if (step1Group) {
            instance.setViewport({
              x: -step1Group.position.x + 50,
              y: -step1Group.position.y + 150,
              zoom: 0.6,
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
            width: 20,
            height: 20,
            color: "#64748b",
          },
        }}
        className="bg-slate-900"
      >
        <Background color="#334155" gap={24} />
        <Controls className="rounded-lg border-slate-700 bg-slate-800 [&>button]:border-slate-700 [&>button]:bg-slate-800 [&>button]:text-slate-400 [&>button:hover]:bg-slate-700" />
      </ReactFlow>

      {/* 초기화 버튼 (현재 기능 연결은 안 되어 있음 - handleReset 필요) */}
      <button
        // onClick={handleReset}
        disabled={isReseting}
        title="초기화"
        className="absolute top-4 right-4 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Image src={resetIcon} alt="초기화" width={32} height={32} />
      </button>
    </div>
  );
}
