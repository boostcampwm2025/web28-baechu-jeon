"use client";

interface DetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  node?: {
    title: string;
    path: string;
    description: string;
    dependencies: Array<{
      name: string;
      type: "dependency" | "dependent";
      color: "green" | "orange" | "blue" | "gray";
    }>;
    metrics: {
      testCoverage: number;
      complexity: "Low" | "Medium" | "High";
    };
  };
}

export default function DetailsPanel({
  isOpen,
  onClose,
  node,
}: DetailsPanelProps) {
  if (!isOpen || !node) {
    return null;
  }

  const complexityColors = {
    Low: "text-green-400",
    Medium: "text-amber-400",
    High: "text-red-400",
  };

  return (
    <aside
      className={`flex w-96 flex-col border-l border-slate-800 bg-slate-900 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <svg
            className="h-5 w-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Node Details
        </h3>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{node.title}</h2>
          </div>
          <div className="mb-4 font-mono text-sm text-blue-400">
            {node.path}
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            {node.description}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Dependencies ({node.dependencies.length})
          </h4>
          <div className="space-y-2">
            {node.dependencies.map((dep, index) => (
              <div
                key={index}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-3 transition-colors hover:border-slate-600"
              >
                <svg
                  className={`h-5 w-5 ${
                    dep.type === "dependency"
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      dep.type === "dependency"
                        ? "M13 7l5 5m0 0l-5 5m5-5H6"
                        : "M11 17l-5-5m0 0l5-5m-5 5h12"
                    }
                  />
                </svg>
                <span className="text-sm font-medium text-slate-200">
                  {dep.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-slate-800 pt-6">
          <h4 className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
            Save Analysis
          </h4>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <button className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-300 transition-all hover:bg-slate-700 hover:text-white">
              <svg
                className="h-5 w-5 text-slate-500 transition-colors group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-medium">Save PNG</span>
            </button>
          </div>
          <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save to Archive
          </button>
        </div>
      </div>
    </aside>
  );
}
