"use client";

import { HiOutlineChevronDoubleLeft } from "react-icons/hi";
import { FileNode } from "@/utils/pathTree";
import { FileItem } from "./FileItem";

interface FolderExplorerProps {
  tree: FileNode[];
  onClose?: () => void;
}

export default function FolderExplorer({ tree, onClose }: FolderExplorerProps) {
  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted uppercase">
          Project Files
        </h3>
        <button onClick={onClose} className="cursor-pointer">
          <HiOutlineChevronDoubleLeft className="transition-color text-muted hover:text-body" />
        </button>
      </div>

      <div className="thin-scrollbar grow space-y-0.5 overflow-y-auto">
        {tree.map((node) => (
          <FileItem key={node.path} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}
