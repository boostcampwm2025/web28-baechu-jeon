"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import VisualizationView from "@/components/result/visualization/VisualizationView";

import NodeDetails, {
  NodeDetailsProps,
} from "@/components/result/visualization/NodeDetails";

export default function VisualizationPage() {
  const params = useParams();
  const analysisId = params?.analysisId as string;
  const [selectedNode, setSelectedNode] = useState<
    NodeDetailsProps["node"] | null
  >(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleNodeClick = (node: NodeDetailsProps["node"]) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <div className="relative h-full">
      <main className="h-full bg-slate-900">
        <VisualizationView
          analysisId={analysisId}
          onNodeClick={handleNodeClick}
        />
      </main>
      {selectedNode && (
        <NodeDetails
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          node={selectedNode}
        />
      )}
    </div>
  );
}
