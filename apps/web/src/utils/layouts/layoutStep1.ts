import { ApiNode } from "@/api/visualization";
import { calculateTextDimensions } from "./layoutUtils";
import { LAYOUT_SETTINGS } from "./layoutSettings";

export const layoutStep1 = (
  nodes: ApiNode[],
  xOffset: number = 0,
  yOffset: number = 0,
) => {
  const SETTING = LAYOUT_SETTINGS.diagram1;

  // 텍스트가 줄바꿈되어야 할 기준 너비 계산
  const textLimitWidth = SETTING.w - SETTING.font.xPadding * 2;

  // 가장 큰 높이 찾기
  let maxNodeHeight: number = SETTING.minH;

  nodes.forEach((node) => {
    const { height } = calculateTextDimensions(node.label || "", {
      fontSize: SETTING.font.size,
      lineHeight: SETTING.font.lineHeight,

      maxWidth: textLimitWidth, // 이 너비를 넘으면 줄바꿈
      paddingX: SETTING.font.xPadding * 2, // 좌우 패딩 합
      paddingY: SETTING.font.yPadding * 2, // 상하 패딩 합

      minHeight: SETTING.minH,
    });

    if (height > maxNodeHeight) {
      maxNodeHeight = height;
    }
  });

  // 좌표 계산
  const contentStartX = xOffset + SETTING.paddingSide;
  const contentStartY = yOffset + SETTING.paddingTop;

  // 노드 데이터에 좌표와 크기 주입
  const calculatedNodes = nodes.map((node, index) => {
    const currentY = contentStartY + index * (maxNodeHeight + SETTING.nSep);

    return {
      ...node,
      x: Math.round(contentStartX),
      y: Math.round(currentY),
      width: SETTING.w,
      height: maxNodeHeight, // 계산된 최대 높이
    };
  });

  // 전체 영역 크기 반환
  const totalHeight =
    calculatedNodes.length > 0
      ? calculatedNodes[calculatedNodes.length - 1].y +
        maxNodeHeight +
        SETTING.paddingTop
      : 200;

  return {
    nodes: calculatedNodes,
    width: SETTING.w + SETTING.paddingSide * 2,
    height: totalHeight,
  };
};
