"use client";

import { IoClose } from "react-icons/io5";
import { ProjectDetailsData } from "./VisualizationClient";

interface ProjectDetailsProps {
  data: ProjectDetailsData;
  onClose: () => void;
}

export default function ProjectDetails({ data, onClose }: ProjectDetailsProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-700 bg-slate-800/90 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-700 p-4">
        <h2 className="text-lg font-bold text-white">프로젝트 상세</h2>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <IoClose size={20} />
        </button>
      </div>

      <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            개요 (OVERVIEW)
          </h3>
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4 text-sm leading-relaxed text-slate-300">
            {data.overview}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            목적 (PURPOSE)
          </h3>
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4 text-sm leading-relaxed text-slate-300">
            {data.purpose}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            주요 기능 (KEY FEATURES)
          </h3>
          <ul className="space-y-2">
            {data.keyFeatures.map((feature, idx) => (
              <li
                key={idx}
                className="rounded-md border border-slate-700/30 bg-slate-800/50 p-3 text-sm text-slate-300"
              >
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            기술 스택 (TECHNOLOGY STACK)
          </h3>
          <div className="space-y-3">
            {Object.entries(data.technologyStack).map(([key, stacks]) => (
              <div key={key}>
                <span className="text-[11px] text-slate-500 capitalize">
                  {key}
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {stacks.map((stack) => (
                    <span
                      key={stack}
                      className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs text-blue-400"
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
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            아키텍처 성향 (ARCHITECTURAL TENDENCIES)
          </h3>
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4 text-sm leading-relaxed text-slate-300">
            {data.architecturalTendencies}
          </div>
        </section>
      </div>
    </div>
  );
}
