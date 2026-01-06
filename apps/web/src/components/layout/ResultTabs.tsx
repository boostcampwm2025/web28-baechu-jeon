"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function ResultTabs() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params?.id;

  const tabs = [
    {
      id: "visualization",
      label: "Visual Graph",
      href: `/result/${projectId}/visualization`,
    },
    { id: "json", label: "JSON Mode", href: `/result/${projectId}/json` },
    { id: "ai", label: "AI Analysis", href: `/result/${projectId}/ai` },
  ];

  return (
    <nav className="flex items-center gap-1 rounded-lg border-2 border-sky-100 bg-sky-50 p-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = pathname?.includes(tab.id);

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition-all ${
              isActive
                ? "border border-sky-200 bg-white text-sky-500 shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
