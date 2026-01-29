"use client";

import { useEffect, useCallback, useMemo } from "react";
import { ReactFlowProvider, type Node, type Edge } from "@xyflow/react";
import { BaseNodeData } from "@/utils/transformNodes";
import NodeDetails from "./NodeDetails";
import ProjectDetails from "./ProjectDetails";
import SaveButtons from "./SaveButtons";
import VisualizationView from "./VisualizationView";
import { NodeData, ProjectDetailsData } from "@/types/visualization";
import { findInitialNode } from "@/utils/nodeHelpers";
import { useVisualizationStore } from "@/store/useVisualizationStore";

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
  const {
    setSelectedNodeId,
    setSelectedFilePath,
    panelNode,
    setPanelNode,
    isNodeOpen,
    setIsNodeOpen,
    isProjectOpen,
    setIsProjectOpen,
  } = useVisualizationStore();

  const initialData = useMemo(
    () => findInitialNode(initialNodes),
    [initialNodes],
  );

  useEffect(() => {
    if (initialData && !panelNode) {
      setSelectedNodeId(initialData.id);
      setPanelNode(initialData);
      setIsNodeOpen(true);
      setIsProjectOpen(true);
    }
  }, [initialData]);

  const handleNodeClick = useCallback(
    (node: NodeData | null) => {
      if (!node) return;

      if (node.diagramType === "STEP1") {
        setSelectedNodeId(null);
        return;
      }
      setSelectedNodeId(node.id);

      if (node.diagramType === "STEP2" && node.nodeType !== "FILE") {
        setPanelNode(node);
        setIsNodeOpen(true);
      }
    },
    [setSelectedNodeId, setPanelNode, setIsNodeOpen],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedFilePath(null);
    setIsNodeOpen(false);
    setIsProjectOpen(false);
  }, [setSelectedNodeId, setSelectedFilePath, setIsNodeOpen, setIsProjectOpen]);

  return (
    <ReactFlowProvider>
      <div className="relative h-full w-full overflow-hidden bg-slate-900">
        <VisualizationView
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          visualizationId={visualizationId}
        />

        <aside className="pointer-events-none absolute top-6 right-6 bottom-6 z-50 flex w-96 flex-col gap-4">
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              panelNode && isNodeOpen
                ? "h-80 translate-x-0 opacity-100"
                : "h-0 translate-x-10 opacity-0"
            }`}
          >
            <div className="pointer-events-auto h-full">
              {panelNode && (
                <NodeDetails
                  node={panelNode}
                  isOpen={isNodeOpen}
                  onClose={() => setIsNodeOpen(false)}
                />
              )}
            </div>
          </div>

          {initialPurposes && (
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isProjectOpen
                  ? "flex-1 translate-x-0 opacity-100"
                  : "h-0 translate-x-10 opacity-0"
              }`}
            >
              <div className="pointer-events-auto h-full">
                <ProjectDetails
                  data={initialPurposes}
                  onClose={() => setIsProjectOpen(false)}
                />
              </div>
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
    </ReactFlowProvider>
  );
}
