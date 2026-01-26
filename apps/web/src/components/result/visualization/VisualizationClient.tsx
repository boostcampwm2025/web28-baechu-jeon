"use client";

import { useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import { BaseNodeData } from "@/utils/transformNodes";
import NodeDetails from "./NodeDetails";
import ProjectDetails from "./ProjectDetails";
import SaveButtons from "./SaveButtons";
import VisualizationView from "./VisualizationView";

// NodeData 인터페이스 정의 및 export
export interface NodeData {
  id: string;
  label: string;
  groups: string | string[];
  contents: string;
  type?: "baseNode";
}

export interface ProjectDetailsData {
  overview: string;
  purpose: string;
  keyFeatures: string[];
  technologyStack: Record<string, string[]>;
  architecturalTendencies: string;
}

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
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isNodeOpen, setIsNodeOpen] = useState(true);

  const handleNodeClick = (node: NodeData | null) => {
    setSelectedNode(node);
    setIsNodeOpen(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      <VisualizationView
        onNodeClick={handleNodeClick}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        visualizationId={visualizationId}
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
