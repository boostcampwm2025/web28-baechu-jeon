"use client";

import { useState } from "react";
import { IoNotificationsOutline, IoCheckmarkCircle } from "react-icons/io5";

interface NotificationButtonProps {
  isGranted: boolean;
  onRequest: () => void;
}

export default function NotificationButton({
  isGranted,
  onRequest,
}: NotificationButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (isGranted) {
    return (
      <div className="mt-6 flex justify-center">
        <div className="bg-primary/10 border-primary/30 flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium text-green-400">
          <IoCheckmarkCircle size={18} />
          브라우저 알림 설정 완료
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-6 flex justify-center">
      <button
        onClick={onRequest}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-surface-alt hover:bg-surface-alt/80 border-line flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium text-gray-400 transition-all hover:text-white"
      >
        <IoNotificationsOutline size={18} />
        완료 시 알림 받기
      </button>

      {/* 호버 툴팁 */}
      {isHovered && (
        <div className="bg-surface border-line absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border px-4 py-2 text-xs text-gray-300 shadow-lg">
          완료 시 브라우저 알림을 보내드려요.
          <div className="border-surface absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r bg-inherit" />
        </div>
      )}
    </div>
  );
}
