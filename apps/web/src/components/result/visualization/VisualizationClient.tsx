"use client";

import { useState, useCallback } from "react";
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
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(() =>
    findInitialNode(initialNodes),
  );

  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isNodeOpen, setIsNodeOpen] = useState(!!selectedNode);

  const handleNodeClick = useCallback((node: NodeData | null) => {
    setSelectedNode(node);

    // STEP2일 때만 상세 패널 열기
    if (node && node.diagramType === "STEP2") {
      setIsNodeOpen(true);
    } else {
      setIsNodeOpen(false);
    }
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      <VisualizationView
        onNodeClick={handleNodeClick}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        visualizationId={visualizationId}
        selectedNodeId={selectedNode?.id}
      />

      <aside className="pointer-events-none absolute top-6 right-6 bottom-6 z-50 flex w-96 flex-col gap-4">
        <div className="h-56">
          {selectedNode && isNodeOpen && (
            <div className="pointer-events-auto h-full">
              <NodeDetails
                node={selectedNode}
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
