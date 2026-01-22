"use client";

import NodeCard from "./NodeCard";
import { useState, useRef } from "react";
import { NodeData } from "./VisualizationClient";
import { mockNodes } from "@/mocks/detailData";

interface VisualizationViewProps {
  projectId: string;
  onNodeClick: (node: NodeData) => void; // NodeData 타입 사용
}

export default function VisualizationView({
  onNodeClick,
}: VisualizationViewProps) {
  const [zoom, setZoom] = useState(100);
  const [position] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  // 노드 mock 데이터 - 위치 정보 추가
  const nodesWithPosition = mockNodes.map((node, index) => ({
    ...node,
    x: 200 + index * 300,
    y: 200,
    color: node.type === "group" ? "purple" : "blue",
  }));

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-lg">
        <button
          onClick={handleZoomReset}
          className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          title="Fit Screen"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
        <div className="h-4 w-px bg-slate-700"></div>
        <button
          onClick={handleZoomOut}
          className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        >
          -
        </button>
        <span className="min-w-12 px-2 text-center font-mono text-xs text-slate-400 select-none">
          {zoom}%
        </span>
        <button
          onClick={handleZoomIn}
          className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        >
          +
        </button>
      </div>

      <div
        ref={canvasRef}
        className="h-full w-full bg-slate-900"
        style={{
          backgroundImage: "radial-gradient(#334155 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          transform: `scale(${zoom / 100}) translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <div className="h-full w-full bg-slate-900">
          <div className="relative h-full w-full p-20">
            {nodesWithPosition.map((node) => (
              <NodeCard
                key={node.id}
                title={node.label}
                x={node.x}
                y={node.y}
                color={node.color as "blue" | "purple"}
                onClick={() => {
                  // NodeData 형식에 맞게 필요한 속성만 전달
                  const nodeData: NodeData = {
                    id: node.id,
                    label: node.label,
                    groups: node.groups,
                    contents: node.contents,
                    type: node.type as "group" | "folder",
                  };
                  onNodeClick(nodeData);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
