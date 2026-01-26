"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { NodeDetailsProps } from "./NodeDetails";
import { transformApiToReactFlow } from "@/utils/transformNodes";
import { resetVisualization, updateVisualization } from "@/api/visualization";
import resetIcon from "@/assets/reset.svg";

interface VisualizationViewProps {
  onNodeClick: (node: NodeDetailsProps["node"] | null) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  visualizationId?: string;
}

// 커스텀 그룹 노드 컴포넌트
function GroupNode({ data }: NodeProps) {
  const colors = data.colors as
    | { border: string; bg: string; text: string }
    | undefined;
  return (
    <div
      className={`h-full w-full rounded-xl border p-2 ${colors?.border || "border-blue-500/30"} ${colors?.bg || "bg-blue-500/10"}`}
    >
      <div
        className={`text-xs font-semibold ${colors?.text || "text-blue-400"}`}
      >
        {data.label as string}
      </div>
    </div>
  );
}

// 커스텀 폴더 노드 컴포넌트
function FolderNode({ data }: NodeProps) {
  const colors = data.colors as
    | { border: string; bg: string; text: string }
    | undefined;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border-2 bg-slate-900 px-4 py-3 shadow-lg ${colors?.border || "border-purple-500"} ${colors?.bg || ""}`}
    >
      <div className="flex flex-col">
        <span
          className={`text-sm font-semibold ${colors?.text || "text-white"}`}
        >
          {data.label as string}
        </span>
        <span className="text-xs text-slate-400">
          {(data.path as string) || `/${(data.label as string).toLowerCase()}`}
        </span>
      </div>
    </div>
  );
}

// 커스텀 노드 타입 등록
const nodeTypes: NodeTypes = {
  group: GroupNode,
  folder: FolderNode,
};

export default function VisualizationView({
  onNodeClick,
  initialNodes = [],
  initialEdges = [],
  visualizationId,
}: VisualizationViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    onNodeClick({
      id: node.id,
      label: String(node.data.label),
      contents: String(node.data.path || ""),
      groups: (node.data.groups as string | string[]) || "",
      type: (node.type as "group" | "folder") || "folder",
    });
  };

  const handleReset = async () => {
    if (!visualizationId) return;

    try {
      setLoading(true);
      const data = await resetVisualization(visualizationId);
      const { reactFlowNodes, reactFlowEdges, updatedApiNodes } =
        transformApiToReactFlow(data);
      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);

      // 초기화 후 다시 계산된 위치를 서버에 저장
      await updateVisualization(visualizationId, updatedApiNodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

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
        onClick={handleReset}
        disabled={!visualizationId || loading}
        title="초기화"
        className="absolute top-4 right-4 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Image src={resetIcon} alt="초기화" width={32} height={32} />
      </button>
    </div>
  );
}
