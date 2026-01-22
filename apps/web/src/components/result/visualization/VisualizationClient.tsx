"use client";

import { useState } from "react";
import NodeDetails from "./NodeDetails";
import ProjectDetails from "./ProjectDetails";
import SaveButtons from "./SaveButtons";
import VisualizationView from "./VisualizationView";

export default function VisualizationClient({
  initialNodes,
  initialPurposes,
}: any) {
  // 서버에서 받은 노드 배열 중 첫 번째를 기본 선택 상태로 지정
  const [selectedNode, setSelectedNode] = useState(initialNodes[0] || null);
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isNodeOpen, setIsNodeOpen] = useState(true);

  // TODO: 노드 클릭 핸들러 (다이어그램에서 호출될 함수)
  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setIsNodeOpen(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      {/* 메인 시각화 영역 */}
      <VisualizationView projectId="1" onNodeClick={handleNodeClick} />

      {/* 우측 사이드바 레이아웃 */}
      <aside className="pointer-events-none absolute top-6 right-6 bottom-6 z-50 flex w-96 flex-col gap-4">
        {/* Node Details */}
        <div className="h-56">
          {selectedNode && isNodeOpen && (
            <div className="pointer-events-auto h-full">
              <NodeDetails
                node={selectedNode}
                onClose={() => setIsNodeOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Project Details */}
        <div
          className={`pointer-events-auto flex-1 overflow-hidden transition-all duration-300 ${
            isProjectOpen
              ? "translate-x-0 opacity-100"
              : "invisible translate-x-10 opacity-0"
          }`}
        >
          <ProjectDetails
            data={initialPurposes}
            onClose={() => setIsProjectOpen(false)}
          />
        </div>

        {/* 버튼 그룹 */}
        <div className="pointer-events-auto">
          <SaveButtons
            isProjectOpen={isProjectOpen}
            onReopen={() => setIsProjectOpen(true)}
          />
        </div>
      </aside>
    </div>
  );
}
