"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  type Node,
  type NodeTypes,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { NodeDetailsProps } from "./NodeDetails";
import { transformApiToReactFlow } from "./transformNodes";
import {
  getVisualization,
  updateVisualization,
  VisualizationError,
} from "@/api/visualization";

interface VisualizationViewProps {
  analysisId: string;
  onNodeClick: (node: NodeDetailsProps["node"]) => void;
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
  analysisId,
  onNodeClick,
}: VisualizationViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchVisualization() {
      try {
        setLoading(true);
        setError(null);
        const data = await getVisualization(analysisId, controller.signal);
        const { reactFlowNodes, updatedApiNodes } = transformApiToReactFlow(data);
        setNodes(reactFlowNodes);

        // dagre로 계산된 위치를 서버에 저장
        await updateVisualization(data.visualizationId, updatedApiNodes);
      } catch (err) {
        if (err instanceof VisualizationError && err.statusCode === 0) {
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (analysisId) {
      fetchVisualization();
    }

    return () => controller.abort();
  }, [analysisId, setNodes]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
          <span className="animate-pulse text-sm text-slate-400">
            시각화 데이터를 불러오는 중...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    onNodeClick({
      title: String(node.data.label),
      path: `/${node.id}`,
      description: `Node ${node.data.label} description`,
      dependencies: [],
      metrics: { testCoverage: 80, complexity: "Medium" },
    });
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        fitView
        className="bg-slate-900"
      >
        <Background color="#334155" gap={24} />
        <Controls className="!rounded-lg !border-slate-700 !bg-slate-800 [&>button]:!border-slate-700 [&>button]:!bg-slate-800 [&>button]:!text-slate-400 [&>button:hover]:!bg-slate-700" />
        <MiniMap
          className="!rounded-lg !border-slate-700 !bg-slate-800"
          nodeColor="#3b82f6"
          maskColor="rgba(15, 23, 42, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
