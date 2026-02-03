"use client";

import { IoClose } from "react-icons/io5";
// Fix: Import from types file instead of VisualizationClient
import { ProjectDetailsData } from "@/types/visualization";

interface ProjectDetailsProps {
  data: ProjectDetailsData;
  onClose: () => void;
}

export default function ProjectDetails({ data, onClose }: ProjectDetailsProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface/90 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-line p-4">
        <h2 className="text-lg font-bold text-heading">프로젝트 상세</h2>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-md p-1 text-subtle transition-colors hover:bg-hover hover:text-heading"
        >
          <IoClose size={20} />
        </button>
      </div>

      <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">
            개요 (OVERVIEW)
          </h3>
          <div className="rounded-lg border border-line/50 bg-page/50 p-4 text-sm leading-relaxed text-body">
            {data.overview}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">
            목적 (PURPOSE)
          </h3>
          <div className="rounded-lg border border-line/50 bg-page/50 p-4 text-sm leading-relaxed text-body">
            {data.purpose}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">
            주요 기능 (KEY FEATURES)
          </h3>
          <ul className="space-y-2">
            {data.keyFeatures.map((feature: string, idx: number) => (
              <li
                key={idx}
                className="rounded-md border border-line/30 bg-surface/50 p-3 text-sm text-body"
              >
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">
            기술 스택 (TECHNOLOGY STACK)
          </h3>
          <div className="space-y-3">
            {Object.entries(data.technologyStack).map(([key, stacks]) => (
              <div key={key}>
                <span className="text-[11px] text-muted capitalize">
                  {key}
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(stacks as string[]).map((stack: string) => (
                    <span
                      key={stack}
                      className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-accent"
                    >
                      {stack}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">
            아키텍처 성향 (ARCHITECTURAL TENDENCIES)
          </h3>
          <div className="rounded-lg border border-line/50 bg-page/50 p-4 text-sm leading-relaxed text-body">
            {data.architecturalTendencies}
          </div>
        </section>
      </div>
    </div>
  );
}
