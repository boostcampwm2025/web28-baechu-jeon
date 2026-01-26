"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function ResultTabs() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params?.projectId;
  const analysisId = params?.analysisId;

  const basePath = `/result/${projectId}/${analysisId}`;

  const tabs = [
    {
      id: "visualization",
      label: "Visual Graph",
      href: `${basePath}/visualization`,
    },
    { id: "json", label: "JSON Mode", href: `${basePath}/json` },
    { id: "ai", label: "AI Analysis", href: `${basePath}/ai` },
  ];

  return (
    <nav className="flex items-center gap-1 rounded-lg border-2 border-sky-100 bg-sky-50 p-1 shadow-sm">
      {tabs.map((tab) => (
        <TabLink
          key={tab.id}
          href={tab.href}
          label={tab.label}
          isActive={pathname === tab.href}
        />
      ))}
    </nav>
  );
}

function TabLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  const baseStyles =
    "rounded-lg px-5 py-1.5 text-sm font-semibold transition-all";
  const activeStyles = "border border-sky-200 bg-white text-sky-500 shadow-sm";
  const inactiveStyles =
    "text-slate-500 hover:bg-slate-50 hover:text-slate-900";

  return (
    <Link
      href={href}
      className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
    >
      {label}
    </Link>
  );
}
