import { Injectable, NotFoundException } from '@nestjs/common';
import { Node, Edge, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  VisualizationResponseDto,
  NodeDto,
  InitialNodesDto,
  EdgeDto,
  UpdateVisualizationDto,
  UpdateVisualizationResponseDto,
} from './dto/visualizations.dto';

interface SnapshotData {
  nodes: NodeDto[];
  edges: EdgeDto[];
}

@Injectable()
export class VisualizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVisualization(
    analysisId: string,
  ): Promise<VisualizationResponseDto> {
    const visualization = await this.prisma.visualization.findFirst({
      where: { analysisResultId: analysisId },
    });
    if (!visualization)
      throw new NotFoundException('시각화 데이터가 없습니다.');

    const [rawNodes, rawEdges] = await Promise.all([
      this.prisma.node.findMany({
        where: { visualizationId: visualization.id },
      }),
      this.prisma.edge.findMany({
        where: { visualizationId: visualization.id },
      }),
    ]);

    // 좌표가 0이 아니면 LAYOUTED, 모두 0이면 INITIAL
    const isLayouted =
      rawNodes.length > 0 &&
      rawNodes.some((n) => Number(n.x) !== 0 || Number(n.y) !== 0);
    const layoutState = isLayouted ? 'LAYOUTED' : 'INITIAL';

    return this.mapToResponseDto(
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
    const { nodes, edges } = updateDto;

    await this.prisma.$transaction(async (tx) => {
      // DB의 개별 Node 좌표 업데이트
      await Promise.all(
        nodes.map((node) =>
          tx.node.update({
            where: { id: node.id },
            data: { x: node.x ?? 0, y: node.y ?? 0 },
          }),
        ),
      );

      // 최초 1회만 스냅샷(formattedData) 저장
      const current = await tx.visualization.findUnique({
        where: { id: visualizationId },
        select: { formattedData: true },
      });

      const currentData =
        current?.formattedData as unknown as SnapshotData | null;

      if (
        !currentData ||
        !currentData.nodes ||
        currentData.nodes.length === 0
      ) {
        const snapshot = {
          nodes,
          edges,
        } as unknown as Prisma.InputJsonValue;

        await tx.visualization.update({
          where: { id: visualizationId },
          data: { formattedData: snapshot },
        });
      }
    });

    return { visualizationId, success: true };
  }

  async resetVisualization(
    visualizationId: string,
  ): Promise<VisualizationResponseDto> {
    const visualization = await this.prisma.visualization.findUnique({
      where: { id: visualizationId },
    });

    if (!visualization || !visualization.formattedData) {
      throw new NotFoundException('저장된 초기 레이아웃이 없습니다.');
    }

    const snapshot = visualization.formattedData as unknown as SnapshotData;

    return {
      visualizationId,
      layoutState: 'LAYOUTED',
      nodes: snapshot.nodes,
      edges: snapshot.edges,
    };
  }

  private mapToResponseDto(
    id: string,
    state: 'INITIAL' | 'LAYOUTED',
    nodes: Node[],
    edges: Edge[],
  ): VisualizationResponseDto {
    const mappedEdges: EdgeDto[] = edges.map((e) => ({
      id: e.id.toString(),
      source: e.sourceNodeId,
      target: e.targetNodeId,
      type: e.type ?? undefined,
      label: e.label ?? undefined,
    }));

    const mappedNodes: NodeDto[] = nodes.map((n) => ({
      id: n.id,
      label: n.label,
      contents: n.contents ?? undefined,
      group: n.groups ?? undefined,
      ...(state === 'LAYOUTED' && { x: n.x, y: n.y }),
    }));

    return {
      visualizationId: id,
      layoutState: state,
      nodes:
        state === 'INITIAL' ? this.distributeNodes(mappedNodes) : mappedNodes,
      edges: mappedEdges,
    };
  }

  private distributeNodes(nodes: NodeDto[]): InitialNodesDto {
    const res: InitialNodesDto = { diagram1: [], diagram2: [], diagram3: [] };
    nodes.forEach((n) => {
      const g = n.group || '';
      if (g.includes('1')) res.diagram1.push(n);
      else if (g.includes('2')) res.diagram2.push(n);
      else res.diagram3.push(n);
    });
    return res;
  }
}
