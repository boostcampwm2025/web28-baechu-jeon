import { HiOutlineDocumentText, HiFolderAdd } from "react-icons/hi";
import { useVisualizationStore } from "@/store/useVisualizationStore";

interface SaveButtonsProps {
  isProjectOpen: boolean;
  onProjectDetails: () => void;
  onFolderDetails: () => void;
}

export default function ActionButtons({
  onProjectDetails,
  onFolderDetails,
}: SaveButtonsProps) {
  const { isNodeOpen } = useVisualizationStore();
  const { isProjectOpen } = useVisualizationStore();

  return (
    <div className="flex items-center justify-end gap-2">
      {!isNodeOpen && (
        <button
          onClick={onFolderDetails}
          className={`flex cursor-pointer items-center justify-center rounded-lg border border-slate-700 p-3 shadow-lg transition-all hover:bg-slate-700 hover:text-white ${
            isNodeOpen
              ? "bg-slate-600 text-white"
              : "bg-slate-800 text-slate-400"
          }`}
          title="폴더 상세 정보 보기"
        >
          <HiFolderAdd size={24} />
        </button>
      )}

      {!isProjectOpen && (
        <button
          onClick={onProjectDetails}
          className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-400 shadow-lg transition-all hover:bg-slate-700 hover:text-white"
          title="프로젝트 상세 열기"
        >
          <HiOutlineDocumentText size={24} />
        </button>
      )}
    </div>
  );
}
