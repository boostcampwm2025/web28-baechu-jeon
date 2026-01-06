"use client";

import { useState } from "react";
import VisualizationView from "@/components/result/visualization/VisualizationView";
import DetailsPanel from "@/components/result/visualization/DetailsPanel";

export default function VisualizationPage({
  params,
}: {
  params: { id: string };
}) {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <div className="flex h-full">
      <main className="relative flex-1 bg-slate-900">
        <VisualizationView
          projectId={params.id}
          onNodeClick={handleNodeClick}
        />
      </main>

      <DetailsPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        node={selectedNode}
      />
    </div>
  );
}
