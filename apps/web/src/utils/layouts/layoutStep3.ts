import { Node, Edge } from "@xyflow/react";
import { ApiNode } from "@/api/visualization";
import { BaseNodeData, LAYOUT_SETTINGS } from "./layoutSettings";

const FIXED_CATEGORIES = ["FE", "BE", "INFRA", "DB"];

export function layoutStep3(
  apiNodes: ApiNode[],
  xOffset: number,
  yOffset: number,
) {
  const groupNodes: Node<BaseNodeData>[] = [];
  const childNodes: Node<BaseNodeData>[] = [];
  const updatedApiNodes: ApiNode[] = [];
  const generatedEdges: Edge[] = [];

  // 그룹핑
  const groupMap = new Map<string, ApiNode[]>();
  FIXED_CATEGORIES.forEach((cat) => groupMap.set(cat, []));

  apiNodes.forEach((node) => {
    const groupName = node.groups ? node.groups.toUpperCase() : "";
    if (groupMap.has(groupName)) {
      groupMap.get(groupName)!.push(node);
    }
  });

  const HEAD_W = LAYOUT_SETTINGS.diagram3CategoryNode.w;
  const HEAD_H = LAYOUT_SETTINGS.diagram3CategoryNode.h;
  const CHILD_W = LAYOUT_SETTINGS.diagram3Child.w;
  const CHILD_H = LAYOUT_SETTINGS.diagram3Child.h;

  const CONTAINER_PADDING = 30;
  const ITEM_GAP = 15;

  const COL_GAP = 150; // 그룹 간 간격
  const HEAD_TO_BOX_GAP = 50;
  const ROOT_PADDING = 60;

  // 최대 높이 계산 (데이터가 있는 카테고리 기준)
  let maxChildrenContentHeight = 0;
  FIXED_CATEGORIES.forEach((catName) => {
    const children = groupMap.get(catName) || [];
    if (children.length > 0) {
      const currentHeight =
        children.length * CHILD_H + (children.length - 1) * ITEM_GAP;
      maxChildrenContentHeight = Math.max(
        maxChildrenContentHeight,
        currentHeight,
      );
    }
  });

  const uniformContainerHeight = Math.max(
    200,
    maxChildrenContentHeight + CONTAINER_PADDING * 2,
  );

  let currentX = ROOT_PADDING;
  const rootId = "group-STEP3-ROOT";

  // 카테고리별 배치
  FIXED_CATEGORIES.forEach((catName) => {
    const children = groupMap.get(catName) || [];

    // 컨테이너 너비
    const containerWidth = CHILD_W + CONTAINER_PADDING * 2;

    // 전체 열의 중심축 X
    const centerX = currentX + containerWidth / 2;

    // 헤더 노드
    const headId = `header-${catName}`;
    const headX = centerX - HEAD_W / 2;
    const headY = ROOT_PADDING;

    groupNodes.push({
      id: headId,
      type: "baseNode",
      parentId: rootId,
      extent: "parent",
      data: {
        label: catName,
        contents: `${children.length}`, // 개수 표시
        groups: "CATEGORY_HEADER",
        width: HEAD_W,
        height: HEAD_H,
        theme: LAYOUT_SETTINGS.diagram3CategoryNode.theme,
        diagramType: "STEP3",
      },
      position: { x: headX, y: headY },
      style: { zIndex: 10, fontWeight: "bold", fontSize: "1.2rem" },
    });

    const containerId = `container-${catName}`;
    const containerX = currentX;
    const containerY = headY + HEAD_H + HEAD_TO_BOX_GAP;

    groupNodes.push({
      id: containerId,
      type: "baseNode",
      parentId: rootId,
      extent: "parent",
      data: {
        label: "",
        contents: "",
        groups: "ITEM_CONTAINER",
        width: containerWidth,
        height: uniformContainerHeight,
        theme: LAYOUT_SETTINGS.diagram3Container.theme,
        diagramType: "STEP3",
      },
      position: { x: containerX, y: containerY },
      style: { zIndex: 5 },
    });

    // 자식 노드들
    children.forEach((child, idx) => {
      const childRelX = CONTAINER_PADDING;
      const childRelY = CONTAINER_PADDING + idx * (CHILD_H + ITEM_GAP);

      childNodes.push({
        id: child.id,
        type: "baseNode",
        parentId: containerId,
        extent: "parent",
        data: {
          label: child.label,
          contents: child.contents || "",
          groups: child.groups || "",
          width: CHILD_W,
          height: CHILD_H,
          theme: LAYOUT_SETTINGS.diagram3Child.theme,
          diagramType: "STEP3",
        },
        position: { x: childRelX, y: childRelY },
      });

      updatedApiNodes.push({
        ...child,
        x: Math.round(xOffset + containerX + childRelX),
        y: Math.round(yOffset + containerY + childRelY),
      });
    });

    currentX += containerWidth + COL_GAP;
  });

  // Root 노드 생성
  const totalRootWidth = currentX - COL_GAP + ROOT_PADDING;
  // 전체 높이 = 상단 여백 + 헤더 + 갭 + 통일된 박스 높이 + 하단 여백
  const totalRootHeight =
    ROOT_PADDING +
    HEAD_H +
    HEAD_TO_BOX_GAP +
    uniformContainerHeight +
    ROOT_PADDING;

  const rootNode: Node<BaseNodeData> = {
    id: rootId,
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
    style: { zIndex: -1 },
  };

  groupNodes.unshift(rootNode);

  return {
    groupNodes,
    childNodes,
    apiNodes: updatedApiNodes,
    generatedEdges,
    width: totalRootWidth,
  };
}
