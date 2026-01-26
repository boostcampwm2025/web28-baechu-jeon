import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Node, Edge } from '@prisma/client';
import {
  VisualizationResponseDto,
  NodeDto,
  EdgeDto,
  UpdateVisualizationDto,
  UpdateVisualizationResponseDto,
} from './dto/visualizations.dto';

@Injectable()
export class VisualizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVisualization(
    analysisId: string,
  ): Promise<VisualizationResponseDto> {
    const visualization = await this.prisma.visualization.findFirst({
      where: { analysisResultId: analysisId },
    });

    if (!visualization) {
      throw new NotFoundException(
        '시각화 데이터가 없습니다. 먼저 분석을 완료해주세요.',
      );
    }

    const [rawNodes, rawEdges] = await Promise.all([
      this.prisma.node.findMany({
        where: { visualizationId: visualization.id },
      }),
      this.prisma.edge.findMany({
        where: { visualizationId: visualization.id },
      }),
    ]);

    const isLayouted =
      rawNodes.length > 0 &&
      rawNodes.some((n) => Number(n.x) !== 0 || Number(n.y) !== 0);
    const layoutState = isLayouted ? 'LAYOUTED' : 'INITIAL';

    return this.buildGraphResponse(
      visualization.id,
      layoutState,
      rawNodes,
      rawEdges,
    );
  }

  async updateVisualization(
    visualizationId: string,
    updateDto: UpdateVisualizationDto,
  ): Promise<UpdateVisualizationResponseDto> {
    const { nodes } = updateDto;

    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        nodes.map((node) =>
          tx.node.update({
            where: { id: BigInt(node.id) },
            data: {
              x: node.x ?? 0,
              y: node.y ?? 0,
            },
          }),
        ),
      );
    });

    return { visualizationId, success: true };
  }

  async resetVisualization(
    visualizationId: string,
  ): Promise<VisualizationResponseDto> {
    const visualization = await this.prisma.visualization.findUnique({
      where: { id: visualizationId },
      include: { nodes: true, edges: true },
    });

    if (!visualization)
      throw new NotFoundException('데이터를 찾을 수 없습니다.');

    return this.buildGraphResponse(
      visualizationId,
      'INITIAL',
      visualization.nodes,
      visualization.edges,
    );
  }

  private buildGraphResponse(
    visualizationId: string,
    state: 'INITIAL' | 'LAYOUTED',
    nodes: Node[],
    edges: Edge[],
  ): VisualizationResponseDto {
    // Node 전용 직렬화 함수 (매개변수 타입 명시)
    const serializeNode = (node: Node): NodeDto => ({
      id: node.id.toString(),
      label: node.label,
      contents: node.contents,
      group: node.groups ?? undefined,
      diagramType: node.diagramType,
      x: Number(node.x),
      y: Number(node.y),
    });

    // Edge 전용 직렬화 함수 (매개변수 타입 명시)
    const serializeEdge = (edge: Edge): EdgeDto => ({
      id: edge.id.toString(),
      source: edge.sourceNodeId.toString(),
      target: edge.targetNodeId.toString(),
      label: edge.label ?? undefined,
      type: edge.type,
      diagramType: edge.diagramType,
    });

    /**
     * 그룹화 로직 (any 제거)
     * U: 소스 데이터 타입 (Node 또는 Edge)
     * T: 결과 DTO 타입 (NodeDto 또는 EdgeDto, diagramType 속성 필수)
     */
    const groupByDiagram = <
      U extends { diagramType: string },
      T extends { diagramType: string },
    >(
      items: U[],
      serializer: (item: U) => T,
    ): Record<string, T[]> => {
      return items.reduce(
        (acc, item) => {
          const type = item.diagramType;
          if (!acc[type]) acc[type] = [];
          acc[type].push(serializer(item));
          return acc;
        },
        {} as Record<string, T[]>,
      );
    };

    return {
      visualizationId,
      layoutState: state,
      nodes: groupByDiagram(nodes, serializeNode),
      edges: groupByDiagram(edges, serializeEdge),
    };
  }
}
