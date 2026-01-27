"use client";

import { useState } from "react";
import { HiFolder, HiDocument, HiOutlineChevronRight } from "react-icons/hi";
import { FileNode } from "@/utils/pathTree";

interface FileItemProps {
  node: FileNode;
  depth: number;
}

export const FileItem = ({ node, depth }: FileItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === "folder";

  const handleClick = () => {
    if (isFolder) setIsOpen(!isOpen);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        title={node.path}
        className={`group flex items-center gap-1 px-2 py-1 pr-4 text-sm transition-colors select-none ${
          isFolder
            ? "cursor-pointer font-medium text-slate-700 hover:bg-slate-100"
            : "text-slate-600 hover:bg-slate-50"
        } `}
        style={{ paddingLeft: `${depth * 10 + 5}px` }}
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center transition-transform duration-100 ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          {isFolder && (
            <HiOutlineChevronRight className="h-3 w-3 text-slate-400" />
          )}
        </span>

        <span className="flex shrink-0 items-center justify-center text-lg">
          {isFolder ? (
            <HiFolder className="text-amber-300" />
          ) : (
            <HiDocument className="text-blue-200" />
          )}
        </span>

        <span className="ml-1 truncate pt-0.5">{node.name}</span>
      </div>

      {/* 자식 그리기 (재귀) */}
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileItem
              key={child.path || child.name + depth}
              node={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
