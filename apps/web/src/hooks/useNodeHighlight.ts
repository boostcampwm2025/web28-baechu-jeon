import { useState, useCallback } from "react";
import { type Node } from "@xyflow/react";
import { type BaseNodeData } from "@/utils/transformNodes";

export function useNodeHighlight(
  setNodes: React.Dispatch<React.SetStateAction<Node<BaseNodeData>[]>>,
) {
  // 현재 하이라이트를 유발한 STEP1 노드의 ID
  const [activeStep1Id, setActiveStep1Id] = useState<string | null>(null);

  // 하이라이트 초기화
  const resetHighlights = useCallback(() => {
    setActiveStep1Id(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, highlightClass: "" },
      })),
    );
  }, [setNodes]);

  // 하이라이트 토글 (STEP1 노드 클릭 시)
  const toggleHighlight = useCallback(
    (triggerNodeId: string, targetIds: string[]) => {
      setNodes((prevNodes) => {
        // 이미 켜져있는 STEP1을 다시 눌렀다면? -> 끄기
        if (activeStep1Id === triggerNodeId) {
          setActiveStep1Id(null); // 상태 업데이트 (비동기지만 다음 렌더링에 반영)
          return prevNodes.map((n) => ({
            ...n,
            data: { ...n.data, highlightClass: "" },
          }));
        }

        // 새로운 STEP1을 눌렀다면? -> 켜기
        setActiveStep1Id(triggerNodeId);

        return prevNodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            // 타겟이면 하이라이트 클래스 적용, 아니면 초기화
            highlightClass: targetIds.includes(n.id) ? "highlight-fixed" : "",
          },
        }));
      });
    },
    [setNodes, activeStep1Id],
  );

  return { toggleHighlight, resetHighlights };
}
