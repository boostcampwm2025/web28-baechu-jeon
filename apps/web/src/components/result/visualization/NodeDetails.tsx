import { IoClose } from "react-icons/io5";
import { NodeData } from "@/types/visualization";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface/90 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-line/50 p-4">
        <h2 className="text-sm font-bold text-subtle">폴더 역할 상세</h2>
        <button onClick={onClose} className="cursor-pointer text-subtle hover:text-heading">
          <IoClose size={18} />
        </button>
      </div>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-5">
        <div className="space-y-1.5">
          <h3 className="text-heading text-xl leading-tight font-bold">
            {node.label}
          </h3>
        </div>
        <div className="text-body text-sm leading-relaxed">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {
                node.contents.replace(/\*\*(.*?)\*\*/g, " **$1** ") // **내용** 앞뒤에 공백 추가
              }
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
