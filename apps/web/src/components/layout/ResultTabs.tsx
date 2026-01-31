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
    { id: "code", label: "Code", href: `${basePath}/code` },
  ];

  return (
    <nav className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-hover)] p-1 shadow-sm">
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
  const base = "rounded-lg px-5 py-1.5 text-sm font-semibold transition-colors";

  const active = `
      bg-[var(--color-surface)]
      text-[var(--color-accent)]
      border
      border-[var(--color-line)]
      shadow-sm
    `;

  const inactive = `
      text-[var(--color-muted)]
      hover:bg-[var(--color-hover)]
      hover:text-[var(--color-heading)]
    `;

  return (
    <Link href={href} className={`${base} ${isActive ? active : inactive}`}>
      {label}
    </Link>
  );
}
