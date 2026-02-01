import { Node, Edge } from "@xyflow/react";
import { ApiNode } from "@/api/visualization";
import { BaseNodeData, LAYOUT_SETTINGS } from "./layoutSettings";
import { calculateTextDimensions, createReactFlowNode } from "./layoutUtils";

const FIXED_CATEGORIES = ["FE", "BE", "DB", "INFRA"];

export function layoutStep3(
  apiNodes: ApiNode[],
  xOffset: number,
  yOffset: number,
) {
  const groupNodes: Node<BaseNodeData>[] = [];
  const childNodes: Node<BaseNodeData>[] = [];
  const updatedApiNodes: ApiNode[] = [];

  // 그룹핑
  const groupMap = new Map<string, ApiNode[]>();
  FIXED_CATEGORIES.forEach((cat) => groupMap.set(cat, []));

  apiNodes.forEach((node) => {
    const groupName = node.groups ? node.groups.toUpperCase() : "";
    if (groupMap.has(groupName)) {
      groupMap.get(groupName)!.push(node);
    }
  });

  const ROOT_ID = "group-STEP3-ROOT";
  const HEAD_W = LAYOUT_SETTINGS.diagram3CategoryNode.w;
  const HEAD_H = LAYOUT_SETTINGS.diagram3CategoryNode.h;
  const CHILD_W = 240;

  const CONTAINER_PADDING = 30;
  const ITEM_GAP = 15;

  const COL_GAP = 150; // 그룹 간 간격
  const HEAD_TO_BOX_GAP = 50;
  const ROOT_PADDING = 60;

  const columnHeights = new Map<string, number>();
  let maxColumnHeight = 200;

  FIXED_CATEGORIES.forEach((catName) => {
    const children = groupMap.get(catName) || [];
    let neededHeight = CONTAINER_PADDING;

    children.forEach((child) => {
      const { height } = calculateTextDimensions(child.label, CHILD_W, 16);
      neededHeight += height + ITEM_GAP;
    });

    neededHeight += CONTAINER_PADDING; // 하단 패딩 추가
    columnHeights.set(catName, neededHeight);

    // 가장 높은 컬럼의 높이를 전체 높이로 결정
    if (neededHeight > maxColumnHeight) maxColumnHeight = neededHeight;
  });

  // --- [2단계: 결정된 maxColumnHeight로 모든 노드 배치] ---
  let currentX = ROOT_PADDING;

  FIXED_CATEGORIES.forEach((catName) => {
    const children = groupMap.get(catName) || [];
    const containerId = `container-${catName}`;
    const headerId = `header-${catName}`;

    let currentChildY = CONTAINER_PADDING;

    children.forEach((child) => {
      const { height: dynamicH } = calculateTextDimensions(
        child.label,
        CHILD_W,
        16,
      );

      const childNode = createReactFlowNode(
        child,
        CONTAINER_PADDING,
        currentChildY,
        {
          w: CHILD_W,
          h: dynamicH,
          theme: LAYOUT_SETTINGS.diagram3Child.theme,
        },
      );
      childNode.parentId = containerId;
      childNode.extent = "parent";
      childNodes.push(childNode);

      updatedApiNodes.push({
        ...child,
        x: Math.round(xOffset + currentX + CONTAINER_PADDING),
        y: Math.round(
          yOffset + ROOT_PADDING + HEAD_H + HEAD_TO_BOX_GAP + currentChildY,
        ),
      });

      currentChildY += dynamicH + ITEM_GAP;
    });

    const centerX = currentX + (CHILD_W + CONTAINER_PADDING * 2) / 2;

    // 헤더 배치
    groupNodes.push({
      id: headerId,
      type: "baseNode",
      parentId: ROOT_ID,
      extent: "parent",
      data: {
        label: catName,
        contents: `${children.length}`,
        groups: "CATEGORY_HEADER",
        width: HEAD_W,
        height: HEAD_H,
        theme: LAYOUT_SETTINGS.diagram3CategoryNode.theme,
        diagramType: "STEP3",
      },
      position: { x: centerX - HEAD_W / 2, y: ROOT_PADDING },
    });

    groupNodes.push({
      id: containerId,
      type: "baseNode",
      parentId: ROOT_ID,
      extent: "parent",
      data: {
        label: "",
        contents: "",
        groups: "ITEM_CONTAINER",
        width: CHILD_W + CONTAINER_PADDING * 2,
        height: maxColumnHeight,
        theme: LAYOUT_SETTINGS.diagram3Container.theme,
        diagramType: "STEP3",
      },
      position: { x: currentX, y: ROOT_PADDING + HEAD_H + HEAD_TO_BOX_GAP },
    });

    currentX += CHILD_W + CONTAINER_PADDING * 2 + COL_GAP;
  });

  const totalRootWidth = currentX - COL_GAP + ROOT_PADDING;
  const totalRootHeight =
    ROOT_PADDING + HEAD_H + HEAD_TO_BOX_GAP + maxColumnHeight + ROOT_PADDING;

  groupNodes.unshift({
    id: ROOT_ID,
    type: "baseNode",
    data: {
      label: "",
      contents: "",
      groups: "ROOT_CONTAINER",
      width: totalRootWidth,
      height: totalRootHeight,
      theme: LAYOUT_SETTINGS.diagram3Root.theme,
      diagramType: "STEP3",
    },
    position: { x: xOffset, y: yOffset },
  });

  return {
    groupNodes,
    childNodes,
    apiNodes: updatedApiNodes,
    width: totalRootWidth,
  };
}
