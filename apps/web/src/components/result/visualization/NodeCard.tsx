interface NodeCardProps {
  title: string;
  path?: string;
  x: number;
  y: number;
  color?: "blue" | "purple";
  isActive?: boolean;
  onClick?: () => void;
}

export default function NodeCard({
  title,
  x,
  y,
  color = "blue",
  isActive,
  onClick,
}: NodeCardProps) {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-900/20",
    purple: "border-purple-500 bg-purple-900/20",
  };

  return (
    <div
      onClick={onClick}
      className={`absolute w-50 cursor-pointer rounded-xl border bg-slate-800 p-4 shadow-xl transition-all hover:shadow-2xl ${
        colorClasses[color]
      } ${isActive ? "ring-2 ring-blue-500" : ""}`}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}
        >
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-200">{title}</h4>
        </div>
      </div>
    </div>
  );
}
