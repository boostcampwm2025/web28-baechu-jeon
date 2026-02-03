import { ApiNode, ApiEdge } from "@/api/visualization";
import { layoutStep1 } from "./layoutStep1";
import { layoutStep2 } from "./layoutStep2";
import { layoutStep3 } from "./layoutStep3";

// 단계별 간격 설정
const GAP_BETWEEN_STEPS = 500;

export const calculateInitialLayout = (
  nodes: { STEP1: ApiNode[]; STEP2: ApiNode[]; STEP3: ApiNode[] },
  edges: ApiEdge[],
) => {
  const s1 = layoutStep1(nodes.STEP1);

  const step2StartX = s1.width + GAP_BETWEEN_STEPS;
  const s2 = layoutStep2(nodes.STEP2, edges, step2StartX, 0);

  const step3StartX = step2StartX + s2.width + GAP_BETWEEN_STEPS;
  const s3 = layoutStep3(nodes.STEP3, step3StartX, 0);

  return {
    nodes: {
      STEP1: s1.nodes,
      STEP2: s2.nodes,
      STEP3: s3.nodes,
    },
    edges,
  };
};
