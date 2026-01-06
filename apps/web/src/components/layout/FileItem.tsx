"use client";

interface FileItemProps {
  name: string;
  level?: number;
}

export default function FileItem({ name, level = 0 }: FileItemProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-slate-600`}
      style={{ paddingLeft: `${level * 12 + 32}px` }}
    >
      <svg
        className={`h-4 w-4 shrink-0 text-slate-400`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <span className="truncate font-mono text-sm">{name}</span>
    </div>
  );
}
