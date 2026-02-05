import { Node, Edge } from "@xyflow/react";
import { VisualizationResponse, ApiNode, ApiEdge } from "@/api/visualization";
import { BaseNodeData, LAYOUT_SETTINGS } from "./layouts/layoutSettings";
import { calculateTextDimensions } from "./layouts/layoutUtils";

type LayoutedApiNode = ApiNode & { width: number; height: number };

export function transformApiToReactFlow(apiResponse: VisualizationResponse) {
  const { nodes, edges } = apiResponse;

  const reactFlowNodes: Node<BaseNodeData>[] = [];
  const reactFlowEdges = getReactFlowEdges(edges);

  if (nodes.STEP1 && nodes.STEP1.length > 0) {
    reactFlowNodes.push(...transformStep1(nodes.STEP1));
  }

  if (nodes.STEP2 && nodes.STEP2.length > 0) {
    reactFlowNodes.push(...transformStep2(nodes.STEP2));
  }

  if (nodes.STEP3 && nodes.STEP3.length > 0) {
    reactFlowNodes.push(...transformStep3(nodes.STEP3));
  }

  return {
    reactFlowNodes,
    reactFlowEdges,
  };
}

function transformStep1(apiNodes: ApiNode[]): Node<BaseNodeData>[] {
  const rfNodes: Node<BaseNodeData>[] = [];
  const groupId = "group-STEP1";
  const PADDING = 60;
  const SETTING = LAYOUT_SETTINGS.diagram1;

  const nodesWithSize = apiNodes.map((node) => ({
    ...node,
    width: (node as LayoutedApiNode).width || SETTING.w,
    height: (node as LayoutedApiNode).height || SETTING.minH,
  }));

  const bounds = getBoundingBox(nodesWithSize, SETTING.w, SETTING.minH);

  const groupX = bounds.minX - PADDING;
  const groupY = bounds.minY - PADDING;
  const groupW = bounds.width + PADDING * 2;
  const groupH = bounds.height + PADDING * 2;

  rfNodes.push({
    id: groupId,
    type: "baseNode",
    position: { x: groupX, y: groupY },
    style: { width: groupW, height: groupH, zIndex: -1 },
    data: {
      label: "",
      width: groupW,
      height: groupH,
      theme: SETTING.theme,
      diagramType: "STEP1",
      groups: "CONTAINER",
    },
  });

  rfNodes.push({
    id: `${groupId}-label`,
    type: "baseNode",
    parentId: groupId,
    position: { x: 0, y: -150 },
    style: { zIndex: 10 },
    data: {
      label: "User Stories & Features",
      width: groupW,
      height: 50,
      theme: {
        ...SETTING.theme,
        borderColor: "transparent",
        bgColor: "transparent",
      },
      diagramType: "STEP1",
      groups: "GROUP_HEADER",
    },
  });

  nodesWithSize.forEach((node) => {
    rfNodes.push({
      id: node.id,
      type: "baseNode",
      parentId: groupId,
      extent: "parent",
      position: { x: node.x - groupX, y: node.y - groupY },
      data: {
        ...node,
        width: node.width,
        height: node.height,
        paddingX: SETTING.font.xPadding,
        paddingY: SETTING.font.yPadding,
        theme: SETTING.theme,
      },
    });
  });

  return rfNodes;
}

function transformStep2(apiNodes: ApiNode[]): Node<BaseNodeData>[] {
  const SETTING = LAYOUT_SETTINGS.diagram2;
  const rfNodes: Node<BaseNodeData>[] = [];

  const nodesWithSize = apiNodes.map((node) => {
    let width = (node as LayoutedApiNode).width;
    if (!width) {
      const calculated = calculateTextDimensions(node.label || "", {
        fontSize: SETTING.font.size,
        lineHeight: SETTING.font.lineHeight,
        maxWidth: Infinity,
        paddingX: SETTING.font.xPadding * 2,
        minWidth: SETTING.minW,
      });
      width = calculated.width;
    }

    return {
      ...node,
      width,
      height: (node as LayoutedApiNode).height || SETTING.h,
    };
  });

  const bounds = getBoundingBox(nodesWithSize, SETTING.minW, SETTING.h);

  const LABEL_W = 600;
  rfNodes.push({
    id: "group-STEP2-label",
    type: "baseNode",
    position: {
      x: bounds.minX + bounds.width / 2 - LABEL_W / 2,
      y: bounds.minY - 180,
    },
    data: {
      label: "Project File Tree",
      width: LABEL_W,
      height: 80,
      theme: {
        ...SETTING.theme,
        borderColor: "transparent",
        bgColor: "transparent",
      },
      diagramType: "STEP2",
      groups: "GROUP_HEADER",
    },
  });

  nodesWithSize.forEach((node) => {
    const typeTheme = node.type === "FILE" ? SETTING.fileTheme : SETTING.theme;

    rfNodes.push({
      id: node.id,
      type: "baseNode",
      position: { x: node.x, y: node.y },
      data: {
        ...node,
        label: node.label,
        width: node.width,
        height: node.height,
        paddingX: SETTING.font.xPadding,
        paddingY: SETTING.font.yPadding,
        theme: typeTheme,
        diagramType: "STEP2",
      },
    });
  });
  return rfNodes;
}

function transformStep3(apiNodes: ApiNode[]): Node<BaseNodeData>[] {
  const rfNodes: Node<BaseNodeData>[] = [];
  const SETTING = LAYOUT_SETTINGS.diagram3;
  const categories = ["FE", "BE", "DB", "INFRA"];

  const nodesWithSize = apiNodes.map((node) => ({
    ...node,
    width: (node as LayoutedApiNode).width || SETTING.minW,
    height: (node as LayoutedApiNode).height || SETTING.h,
  }));

  const bounds = getBoundingBox(nodesWithSize, SETTING.minW, SETTING.h);

  const rootX = bounds.minX - SETTING.categoryPadding - SETTING.paddingSide;
  const rootY =
    bounds.minY -
    SETTING.categoryPadding -
    SETTING.headerHeight -
    SETTING.headerGap -
    SETTING.paddingTop;
  const rootW =
    bounds.width + (SETTING.categoryPadding + SETTING.paddingSide) * 2;
  const rootH =
    bounds.height +
    (SETTING.categoryPadding + SETTING.paddingTop) * 2 +
    SETTING.headerHeight +
    SETTING.headerGap;

  rfNodes.push({
    id: "group-STEP3-ROOT",
    type: "baseNode",
    position: { x: rootX, y: rootY },
    style: { width: rootW, height: rootH, zIndex: -2 },
    data: {
      label: "",
      width: rootW,
      height: rootH,
      theme: SETTING.rootTheme,
      diagramType: "STEP3",
      groups: "ROOT_CONTAINER",
    },
  });

  rfNodes.push({
    id: "group-STEP3-label",
    type: "baseNode",
    parentId: "group-STEP3-ROOT",
    position: { x: 0, y: -100 },
    data: {
      label: "TECH STACK",
      width: rootW,
      height: 60,
      theme: {
        ...SETTING.rootTheme,
        borderColor: "transparent",
        bgColor: "transparent",
      },
      diagramType: "STEP3",
      groups: "GROUP_HEADER",
    },
  });

  categories.forEach((cat) => {
    const children = nodesWithSize.filter(
      (n) => (n.groups?.toUpperCase() || "INFRA") === cat,
    );
    if (children.length === 0) return;

    const catBounds = getBoundingBox(children, SETTING.minW, SETTING.h);
    const colW = catBounds.width + SETTING.categoryPadding * 2;
    const colH = bounds.height + SETTING.categoryPadding * 2;

    const colAbsX = catBounds.minX - SETTING.categoryPadding;
    const colAbsY = catBounds.minY - SETTING.categoryPadding;

    const catGroupId = `group-STEP3-${cat}`;

    rfNodes.push({
      id: `${catGroupId}-label`,
      type: "baseNode",
      parentId: "group-STEP3-ROOT",
      position: {
        x: colAbsX - rootX + (colW / 2 - 100 / 2),
        y: colAbsY - rootY - SETTING.headerHeight - SETTING.headerGap,
      },
      data: {
        label: cat,
        width: 100,
        height: SETTING.headerHeight,
        theme: SETTING.headerTheme,
        diagramType: "STEP3",
        groups: "CATEGORY_HEADER",
      },
    });

    rfNodes.push({
      id: catGroupId,
      type: "baseNode",
      parentId: "group-STEP3-ROOT",
      position: { x: colAbsX - rootX, y: colAbsY - rootY },
      style: { width: colW, height: colH },
      data: {
        label: "",
        width: colW,
        height: colH,
        theme: SETTING.categoryTheme,
        diagramType: "STEP3",
        groups: "ITEM_CONTAINER",
      },
    });

    children.forEach((node) => {
      rfNodes.push({
        id: node.id,
        type: "baseNode",
        parentId: catGroupId,
        extent: "parent",
        position: {
          x: node.x - colAbsX,
          y: node.y - colAbsY,
        },
        data: {
          ...node,
          width: node.width,
          height: node.height,
          theme: SETTING.itemTheme,
          paddingX: SETTING.font.xPadding,
          paddingY: SETTING.font.yPadding,
        },
      });
    });
  });

  return rfNodes;
}

export function getBoundingBox(
  nodes: ApiNode[],
  defaultNodeW: number,
  defaultNodeH: number,
) {
  if (!nodes || nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  nodes.forEach((n) => {
    const w = (n as LayoutedApiNode).width || defaultNodeW;
    const h = (n as LayoutedApiNode).height || defaultNodeH;

    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + w > maxX) maxX = n.x + w;
    if (n.y + h > maxY) maxY = n.y + h;
  });

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function getReactFlowEdges(apiEdges: ApiEdge[]): Edge[] {
  if (!apiEdges) return [];

  return apiEdges
    .filter((edge) => edge.sourceNodeId && edge.targetNodeId)
    .map((edge) => {
      let dashArray: string | undefined;

      if (edge.type === "DASHED") {
        dashArray = "12, 6";
      } else if (edge.type === "DOTTED") {
        dashArray = "2, 4";
      }

      return {
        id: String(edge.id),
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        style: {
          stroke: "#475569",
          strokeWidth: 5,
          strokeDasharray: dashArray,
        },
      };
    });
}
