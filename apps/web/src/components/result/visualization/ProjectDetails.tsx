"use client";

import { IoClose } from "react-icons/io5";
// Fix: Import from types file instead of VisualizationClient
import { ProjectDetailsData } from "@/types/visualization";
import { HiOutlineDocumentSearch } from "react-icons/hi";

interface ProjectDetailsProps {
  data: ProjectDetailsData;
  onClose: () => void;
}

export default function ProjectDetails({ data, onClose }: ProjectDetailsProps) {
  return (
    <div className="border-line bg-surface/90 flex h-full flex-col rounded-xl border shadow-2xl backdrop-blur-md">
      <div className="border-line flex items-center justify-between border-b p-4">
        <span className="flex items-center gap-2">
          <HiOutlineDocumentSearch size={25} />
          <h2 className="text-heading text-lg font-bold">프로젝트 상세</h2>
        </span>
        <button
          onClick={onClose}
          className="text-subtle hover:bg-hover hover:text-heading cursor-pointer rounded-md p-1 transition-colors"
        >
          <IoClose size={20} />
        </button>
      </div>

      <div className="thin-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
        <section>
          <h3 className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
            개요 (OVERVIEW)
          </h3>
          <div className="border-line/50 bg-page/50 text-body rounded-lg border p-4 text-sm leading-relaxed">
            {data.overview}
          </div>
        </section>

        <section>
          <h3 className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
            목적 (PURPOSE)
          </h3>
          <div className="border-line/50 bg-page/50 text-body rounded-lg border p-4 text-sm leading-relaxed">
            {data.purpose}
          </div>
        </section>

        <section>
          <h3 className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
            주요 기능 (KEY FEATURES)
          </h3>
          <ul className="space-y-2">
            {data.keyFeatures.map((feature: string, idx: number) => (
              <li
                key={idx}
                className="border-line/30 bg-surface/50 text-body rounded-md border p-3 text-sm"
              >
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
            기술 스택 (TECHNOLOGY STACK)
          </h3>
          <div className="space-y-3">
            {Object.entries(data.technologyStack).map(([key, stacks]) => (
              <div key={key}>
                <span className="text-muted text-[11px] capitalize">{key}</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(stacks as string[]).map((stack: string) => (
                    <span
                      key={stack}
                      className="border-primary/20 bg-primary/10 text-accent rounded border px-2 py-1 text-xs"
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
          <h3 className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
            아키텍처 성향 (ARCHITECTURAL TENDENCIES)
          </h3>
          <div className="border-line/50 bg-page/50 text-body rounded-lg border p-4 text-sm leading-relaxed">
            {data.architecturalTendencies}
          </div>
        </section>
      </div>
    </div>
  );
}
