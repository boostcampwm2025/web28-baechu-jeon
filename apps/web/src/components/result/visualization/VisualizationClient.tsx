"use client";

import { useState, useCallback, useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import { BaseNodeData } from "@/utils/transformNodes";
import NodeDetails from "./NodeDetails";
import ProjectDetails from "./ProjectDetails";
import SaveButtons from "./SaveButtons";
import VisualizationView from "./VisualizationView";
import { NodeData, ProjectDetailsData } from "@/types/visualization";
import { findInitialNode } from "@/utils/nodeHelpers";

interface VisualizationClientProps {
  initialNodes?: Node<BaseNodeData>[];
  initialEdges?: Edge[];
  initialPurposes?: ProjectDetailsData;
  visualizationId?: string;
}

export default function VisualizationClient({
  initialNodes = [],
  initialEdges = [],
  initialPurposes,
  visualizationId,
}: VisualizationClientProps) {
  const initialData = useMemo(
    () => findInitialNode(initialNodes),
    [initialNodes],
  );

  // 패널에 보여줄 데이터
  const [panelNode, setPanelNode] = useState<NodeData | null>(initialData);

  // 클릭한 노드 ID (STEP2/STEP3만)
  const [visualSelectedId, setVisualSelectedId] = useState<string | undefined>(
    initialData?.id,
  );

  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isNodeOpen, setIsNodeOpen] = useState(!!panelNode);

  const handleNodeClick = useCallback((node: NodeData | null) => {
    if (!node) return;

    if (node.diagramType === "STEP1") {
      setVisualSelectedId(undefined);
      return;
    }
    setVisualSelectedId(node.id);

    if (node.diagramType === "STEP2") {
      setPanelNode(node);
      setIsNodeOpen(true);
    }
  }, []);

  const handlePaneClick = useCallback(() => {
    // 배경 클릭 시 선택 해제 (STEP1 하이라이트와 패널은 유지)
    setVisualSelectedId(undefined);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      <VisualizationView
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        visualizationId={visualizationId}
        selectedNodeId={visualSelectedId}
      />

      <aside className="pointer-events-none absolute top-6 right-6 bottom-6 z-50 flex w-96 flex-col gap-4">
        <div className="h-56">
          {panelNode && isNodeOpen && (
            <div className="pointer-events-auto h-full">
              <NodeDetails
                node={panelNode}
                isOpen={isNodeOpen}
                onClose={() => setIsNodeOpen(false)}
              />
            </div>
          )}
        </div>

        {initialPurposes && (
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
        )}

        <div className="pointer-events-auto mt-auto">
          <SaveButtons
            isProjectOpen={isProjectOpen}
            onReopen={() => setIsProjectOpen(true)}
          />
        </div>
      </aside>
    </div>
  );
}
