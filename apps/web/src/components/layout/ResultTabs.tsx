"use client";

import { useVisualizationStore } from "@/store/useVisualizationStore";

export default function ResultTabs() {
  const activeTab = useVisualizationStore((s) => s.activeTab);
  const setActiveTab = useVisualizationStore((s) => s.setActiveTab);

  const tabs = [
    { id: "visualization", label: "시각화" },
    { id: "code", label: "코드" },
  ];

  return (
    <nav className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-hover)] p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as "code" | "visualization")}
          className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition-colors ${
            activeTab === tab.id
              ? "border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-accent)] shadow-sm"
              : "text-[var(--color-muted)] hover:bg-[var(--color-hover)] hover:text-[var(--color-heading)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
