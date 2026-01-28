import { useRef, useCallback, useEffect } from "react";
import { type Node } from "@xyflow/react";
import { type BaseNodeData } from "@/utils/transformNodes";

export function useNodeHighlight(
  setNodes: React.Dispatch<React.SetStateAction<Node<BaseNodeData>[]>>,
) {
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 정리 함수
  const clearTimer = useCallback(() => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  }, []);

  // 하이라이트 초기화 (빈 배경 클릭 시)
  const resetHighlights = useCallback(() => {
    clearTimer();
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, highlightClass: "" },
      })),
    );
  }, [setNodes, clearTimer]);

  // 하이라이트 실행 (노드 클릭 시)
  const triggerHighlight = useCallback(
    (targetIds: string[]) => {
      clearTimer();

      // 1단계: 반짝이는 애니메이션 적용
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            highlightClass: targetIds.includes(n.id)
              ? "animate-blink-highlight"
              : "",
          },
        })),
      );

      // 2단계: 1.5초 후 고정 상태로 변경
      highlightTimerRef.current = setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) => {
            if (targetIds.includes(n.id)) {
              return {
                ...n,
                data: { ...n.data, highlightClass: "highlight-fixed" },
              };
            }
            return n;
          }),
        );
        highlightTimerRef.current = null;
      }, 1500);
    },
    [setNodes, clearTimer],
  );

  // 언마운트 시 정리
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { triggerHighlight, resetHighlights };
}
