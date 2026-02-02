"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useVisualizationStore } from "@/store/useVisualizationStore";

export default function ResultTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useVisualizationStore((s) => s.activeTab);
  const selectedFilePath = useVisualizationStore((s) => s.selectedFilePath);

  const tabs = [
    { id: "visualization", label: "시각화" },
    { id: "code", label: "코드" },
  ];

  const handleTabChange = (tabId: "code" | "visualization") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    if (tabId === "visualization") {
      params.delete("filePath");
    } else if (tabId === "code" && selectedFilePath) {
      params.set("filePath", selectedFilePath);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <nav className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-hover)] p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id as "code" | "visualization")}
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
