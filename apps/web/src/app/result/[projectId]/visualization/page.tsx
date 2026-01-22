"use client";

import { useState } from "react";
import VisualizationView from "@/components/result/visualization/VisualizationView";

import NodeDetails, {
  NodeDetailsProps,
} from "@/components/result/visualization/NodeDetails";

// TODO: 분석 완료 후 analysisId를 받아서 사용하도록 변경
const TEMP_ANALYSIS_ID = "e3c9a899-ffd3-41cd-9dc3-cedd00406e58";

export default function VisualizationPage() {
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
          analysisId={TEMP_ANALYSIS_ID}
          onNodeClick={handleNodeClick}
        />
      </main>
      <NodeDetails
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        node={selectedNode ?? undefined}
      />
    </div>
  );
}
