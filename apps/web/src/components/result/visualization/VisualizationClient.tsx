import { useState } from "react";
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
  type: "group" | "folder";
}

export interface ProjectDetailsData {
  overview: string;
  purpose: string;
  key_features: string[];
  technology_stack: {
    backend: string[];
    frontend: string[];
    infrastructure: string[];
  };
  architectural_tendencies: string;
}

interface VisualizationClientProps {
  initialNodes: NodeData[];
  initialPurposes: ProjectDetailsData;
}

export default function VisualizationClient({
  initialNodes,
  initialPurposes,
}: VisualizationClientProps) {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(
    initialNodes[0] || null,
  );
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isNodeOpen, setIsNodeOpen] = useState(true);

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node);
    setIsNodeOpen(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      <VisualizationView projectId="1" onNodeClick={handleNodeClick} />

      <aside className="pointer-events-none absolute top-6 right-6 bottom-6 z-50 flex w-96 flex-col gap-4">
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
