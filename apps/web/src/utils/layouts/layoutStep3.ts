import { ApiNode } from "@/api/visualization";
import { LAYOUT_SETTINGS } from "@/utils/layouts/layoutSettings";
import { calculateTextDimensions } from "./layoutUtils";
type LayoutedApiNode = ApiNode & { width: number; height: number };

export const layoutStep3 = (
  nodes: ApiNode[],
  xOffset: number,
  yOffset: number,
) => {
  if (nodes.length === 0) return { nodes: [], width: 0, height: 0 };

  const SETTING = LAYOUT_SETTINGS.diagram3;
  const categories = ["FE", "BE", "DB", "INFRA"];

  const groupedNodes: Record<string, ApiNode[]> = {
    FE: [],
    BE: [],
    DB: [],
    INFRA: [],
  };

  nodes.forEach((n) => {
    const group = n.groups?.toUpperCase() || "INFRA";
    if (groupedNodes[group]) groupedNodes[group].push(n);
    else groupedNodes["INFRA"].push(n);
  });

  const calculatedNodes: LayoutedApiNode[] = [];
  let currentX = xOffset + SETTING.paddingSide;

  // 헤더와 간격을 고려한 아이템 시작 Y축
  const itemStartY =
    yOffset +
    SETTING.paddingTop +
    SETTING.headerHeight +
    SETTING.headerGap +
    SETTING.categoryPadding;

  categories.forEach((cat) => {
    const children = groupedNodes[cat];
    if (children.length === 0) return;

    const columnWidth = SETTING.minW + SETTING.categoryPadding * 2;
    let currentY = itemStartY;

    children.forEach((node) => {
      const { height } = calculateTextDimensions(node.label || "", {
        fontSize: SETTING.font.size,
        lineHeight: SETTING.font.lineHeight,
        paddingX: SETTING.font.xPadding * 2,
        paddingY: SETTING.font.yPadding * 2,
        maxWidth: SETTING.minW,
        minWidth: SETTING.minW,
        minHeight: SETTING.h,
      });

      calculatedNodes.push({
        ...node,
        x: Math.round(currentX + SETTING.categoryPadding),
        y: Math.round(currentY),
        width: SETTING.minW!,
        height: height,
      });

      currentY += height + SETTING.itemGap;
    });

    currentX += columnWidth + SETTING.columnGap;
  });

  const totalWidth = currentX - xOffset + SETTING.paddingSide;
  const totalHeight = 1500;

  return {
    nodes: calculatedNodes,
    width: totalWidth,
    height: totalHeight,
  };
};
