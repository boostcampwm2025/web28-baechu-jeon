import { useEffect } from "react";
import { useReactFlow, type Node } from "@xyflow/react";
import { useVisualizationStore } from "@/store/useVisualizationStore";
import { type BaseNodeData } from "@/utils/layouts/layoutSettings";

export function useVisualizationFocus() {
  const { getNodes, setCenter, fitView } = useReactFlow();
  const { focusTargetType, setFocusTargetType } = useVisualizationStore();

  useEffect(() => {
    if (!focusTargetType) return;

    const allNodes = getNodes() as Node<BaseNodeData>[];

    if (focusTargetType === "ALL") {
      fitView({ duration: 800 });
    } else {
      const stepNodes = allNodes.filter(
        (n) => n.data.diagramType === focusTargetType,
      );

      if (focusTargetType === "STEP1") {
        const groupNode = allNodes.find((n) => n.id === "group-STEP1-label");
        if (groupNode) {
          const zoom = 0.6;
          const centerX =
            groupNode.position.x + (groupNode.data.width || 700) / 2;
          const topY = groupNode.position.y;
          const targetCenterY = topY + 350 / zoom;

          setCenter(centerX, targetCenterY, { zoom, duration: 1000 });
        }
      } else if (focusTargetType === "STEP2") {
        const labelNode = allNodes.find((n) => n.id === "group-STEP2-label");
        if (labelNode) {
          const zoom = 0.5;
          const centerX =
            labelNode.position.x + (labelNode.data.width || 600) / 2;
          const targetCenterY = labelNode.position.y + 200 / zoom;

          setCenter(centerX, targetCenterY, { zoom, duration: 1000 });
        }
      } else if (focusTargetType === "STEP3") {
        fitView({
          nodes: stepNodes,
          duration: 1000,
          padding: 0.6,
        });
      }
    }
    // 처리가 끝나면 스토어의 focusTargetType을 초기화하여 중복 실행 방지
    setFocusTargetType(null);
  }, [focusTargetType, fitView, getNodes, setFocusTargetType, setCenter]);
}
