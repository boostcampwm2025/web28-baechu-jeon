"use client";

import { useState } from "react";
import VisualizationView from "@/components/result/visualization/VisualizationView";
import DetailsPanel, {
  DetailsPanelProps,
} from "@/components/result/visualization/DetailsPanel";

export default function VisualizationPage({
  params,
}: {
  params: { id: string };
}) {
  const [selectedNode, setSelectedNode] = useState<
    DetailsPanelProps["node"] | null
  >(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleNodeClick = (node: DetailsPanelProps["node"]) => {
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
          projectId={params.id}
          onNodeClick={handleNodeClick}
        />
      </main>
      <DetailsPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        node={selectedNode ?? undefined}
      />
    </div>
  );
}
