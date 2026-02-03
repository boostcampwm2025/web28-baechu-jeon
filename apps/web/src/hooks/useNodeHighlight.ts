import { useCallback } from "react";
import { type Node } from "@xyflow/react";
import { type BaseNodeData } from "@/utils/transformNodes";
import { useVisualizationStore } from "@/store/useVisualizationStore";

export function useNodeHighlight(
  setNodes: React.Dispatch<React.SetStateAction<Node<BaseNodeData>[]>>,
) {
  // 현재 하이라이트를 유발한 STEP1 노드의 ID
  const { activeStep1Id, setActiveStep1Id, setHighlights } =
    useVisualizationStore();

  // 하이라이트 초기화
  const resetHighlights = useCallback(() => {
    setActiveStep1Id(null);
    setHighlights([]);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, highlightClass: "" },
      })),
    );
  }, [setNodes, setActiveStep1Id, setHighlights]);

  // 하이라이트 토글 (STEP1 노드 클릭 시)
  // 반환값: true = 하이라이트 설정됨, false = 하이라이트 해제됨
  const toggleHighlight = useCallback(
    (triggerNodeId: string, targetIds: string[]): boolean => {
      if (activeStep1Id === triggerNodeId) {
        resetHighlights();
        return false;
      }

      setActiveStep1Id(triggerNodeId);
      setHighlights(targetIds);

      setNodes((prevNodes) =>
        prevNodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            highlightClass: targetIds.includes(n.id) ? "highlight-fixed" : "",
          },
        })),
      );
      return true;
    },
    [activeStep1Id, setNodes, setActiveStep1Id, setHighlights, resetHighlights],
  );

  return { toggleHighlight, resetHighlights };
}
