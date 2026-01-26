"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  type BaseNodeData,
  transformApiToReactFlow,
} from "@/utils/transformNodes";
// import { resetVisualization } from "@/api/visualization";
import resetIcon from "@/assets/reset.svg";
import { NodeData } from "./VisualizationClient";
// 커스텀 노드 컴포넌트
function BaseNode({ data }: NodeProps<Node<BaseNodeData>>) {
  const { width, height, theme, label } = data;
  const isFirstNode = width >= 500;

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderColor: theme.borderColor,
        backgroundColor: theme.bgColor,
        color: theme.textColor,
      }}
      className="flex flex-col items-center justify-center rounded-xl border-2 px-6 py-4 shadow-lg transition-all"
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: theme.borderColor }}
        className={`!border-none ${isFirstNode ? "!h-4 !w-4" : "!h-3 !w-3"}`}
      />
      <div className="flex h-full w-full items-center justify-center overflow-hidden text-center">
        <span
          style={{
            color: theme.textColor,
            wordBreak: "keep-all",
            lineHeight: 1.3,
            fontSize: isFirstNode ? "2rem" : "0.95rem",
            fontWeight: isFirstNode ? 800 : 600,
          }}
        >
          {label}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: theme.borderColor }}
        className={`!border-none ${isFirstNode ? "!h-4 !w-4" : "!h-3 !w-3"}`}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  baseNode: BaseNode,
};

interface VisualizationViewProps {
  visualizationId?: string;
  initialNodes: Node<BaseNodeData>[];
  initialEdges: Edge[];
  onNodeClick: (node: NodeData) => void;
}

export default function VisualizationView({
  onNodeClick,
  initialNodes = [],
  initialEdges = [],
  visualizationId,
}: VisualizationViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isReseting, setIsReseting] = useState(false);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<BaseNodeData>) => {
      onNodeClick({
        id: node.id,
        label: node.data.label,
        contents: node.data.contents,
        groups: node.data.groups,
      });
    },
    [onNodeClick],
  );

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
        fitView
        className="bg-slate-900"
      >
        <Background color="#334155" gap={24} />
        <Controls className="!rounded-lg !border-slate-700 !bg-slate-800 [&>button]:!border-slate-700 [&>button]:!bg-slate-800 [&>button]:!text-slate-400 [&>button:hover]:!bg-slate-700" />
      </ReactFlow>
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
