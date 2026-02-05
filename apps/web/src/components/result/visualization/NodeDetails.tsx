"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { NodeData } from "@/types/visualization";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HiOutlineFolder } from "react-icons/hi";

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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(!document.documentElement.classList.contains("light"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!isOpen || !node) return null;

  return (
    <div className="border-line bg-surface/90 flex h-full flex-col overflow-hidden rounded-xl border shadow-2xl backdrop-blur-md">
      <div className="border-line/50 flex items-center justify-between border-b p-4">
        <span className="flex items-center gap-2">
          <HiOutlineFolder size={24} />
          <h2 className="text-heading text-lg font-bold">폴더 역할 상세</h2>
        </span>
        <button
          onClick={onClose}
          className="text-subtle hover:text-heading cursor-pointer"
        >
          <IoClose size={18} />
        </button>
      </div>

      <div className="thin-scrollbar flex-1 space-y-3 overflow-y-auto p-5">
        <div className="space-y-1.5">
          <h3 className="text-heading text-xl leading-tight font-bold">
            {node.label}
          </h3>
        </div>
        <div className="text-body text-sm leading-relaxed">
          <div
            className={`prose max-w-none ${isDark ? "prose-invert" : ""} prose-headings:text-heading prose-strong:text-heading prose-code:bg-hover prose-code:text-body prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-p:text-body prose-li:text-body`}
          >
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
