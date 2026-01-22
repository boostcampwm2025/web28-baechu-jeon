import {
  HiOutlineDocumentText,
  HiPhotograph,
  HiOutlineArchive,
} from "react-icons/hi";

interface SaveButtonsProps {
  isProjectOpen: boolean;
  onReopen: () => void;
}

export default function ActionButtons({
  isProjectOpen,
  onReopen,
}: SaveButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 프로젝트 복구 버튼 창이 닫혀있을 때만 표시 */}
      {!isProjectOpen && (
        <button
          onClick={onReopen}
          className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-400 shadow-lg transition-all hover:bg-slate-700 hover:text-white"
          title="프로젝트 상세 열기"
        >
          <HiOutlineDocumentText size={24} />
        </button>
      )}

      {/* PNG 추출 버튼 */}
      <button className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-400 shadow-lg transition-all hover:bg-slate-700 hover:text-white">
        <HiPhotograph size={24} />
      </button>

      {/* 아카이브 저장 버튼 */}
      <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500">
        <HiOutlineArchive size={20} />
        Save to Archive
      </button>
    </div>
  );
}
