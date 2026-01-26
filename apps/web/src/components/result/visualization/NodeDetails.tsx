import { IoClose } from "react-icons/io5";
import { NodeData } from "./VisualizationClient";

export interface NodeDetailsProps {
  node: NodeData | null;
  onClose: () => void;
  isOpen: boolean;
}

export default function NodeDetails({
  node,
  onClose,
  isOpen,
}: NodeDetailsProps) {
  if (!isOpen || !node) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-800/90 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-700/50 p-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase">
          노드 상세
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <IoClose size={18} />
        </button>
      </div>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-5">
        <div className="space-y-1.5">
          <h3 className="text-xl leading-tight font-bold text-white">
            {node.label}
          </h3>
        </div>
        <div className="text-sm leading-relaxed text-slate-300">
          {node.contents}
        </div>
      </div>
    </div>
  );
}
