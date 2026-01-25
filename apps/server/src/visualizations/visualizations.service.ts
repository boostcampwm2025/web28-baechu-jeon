import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AnalysisResult } from '@prisma/client';
import { GraphBuilderService } from './graph-builder/graph-builder.service';
import { GraphBuildResult } from './graph-builder/types/graph-builder.type';

@Injectable()
export class VisualizationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly graphBuilderService: GraphBuilderService,
  ) {}

  async getGraph(analysisId: string) {
    // 그래프가 이미 있는지 중복 조회를 해야하나? ㅇㅇ 새로고침할 때 필요
    // analysisId(= analysisResultId)를 가진 Visualization이 이미 DB에 존재하는지 확인하고 싶다
    const exist = await this.prismaService.visualization.findFirst({
      where: { analysisResultId: analysisId },
      select: { id: true },
    });

    if (exist) {
      const saved = await this.prismaService.visualization.findUnique({
        where: { id: exist.id },
        include: {
          nodes: true,
          edges: true,
        },
      });

      if (!saved) throw new Error('시각화 조회에 실패했습니다.');

      return this.buildGraphResponse(saved);
    }

    // 그래프 없으면 새로 만들자.
    // 일단 분석 결과가 존재하는지 확인하기
    const analysisResult = await this.prismaService.analysisResult.findUnique({
      where: { id: analysisId },
    });

    if (!analysisResult)
      throw new Error(`${analysisId}의 분석 결과를 찾을 수 없습니다.`);

    return this.createGraphFromAnalysis(analysisResult);
  }

  private async createGraphFromAnalysis(analysisResult: AnalysisResult) {
    // visualization row 만들고
    const visualization = await this.prismaService.visualization.create({
      data: {
        analysisResultId: analysisResult.id,
        formattedData: {}, // 나중에 채우기
      },
    });

    // node랑 edge 저장해야 하니까 build 호출하고
    // TODO: 언제 await 쓸지 헷갈림
    const result: GraphBuildResult =
      this.graphBuilderService.build(analysisResult);

    const { step1, step2 } = result;

    const step1NodeIdMap = new Map<string | number, bigint>();

    // node, edge row 만들고

    // step1
    for (const node of step1.nodes) {
      const created = await this.prismaService.node.create({
        data: {
          visualizationId: visualization.id,
          diagramType: 'STEP1',
          x: 0,
          y: 0,
          label: node.label,
          contents: node.contents,
        },
      });

      step1NodeIdMap.set(node.label, created.id);
    }

    const edgesData = step1.edges.map((edge) => {
      const sourceNodeId = step1NodeIdMap.get(edge.sourcePath);
      const targetNodeId = step1NodeIdMap.get(edge.targetPath);

      if (!sourceNodeId || !targetNodeId)
        throw new Error(
          `Edge 생성 실패: 노드를 찾을 수 없습니다. (${edge.sourcePath} -> ${edge.targetPath})`,
        );

      return {
        visualizationId: visualization.id,
        diagramType: 'STEP1',
        sourceNodeId,
        targetNodeId,
      };
    });

    await this.prismaService.edge.createMany({
      data: edgesData,
    });

    const step2NodeIdMap = new Map<string | number, bigint>();

    // step2
    for (const node of step2.nodes) {
      const created = await this.prismaService.node.create({
        data: {
          visualizationId: visualization.id,
          diagramType: 'STEP2',
          x: 0,
          y: 0,
          label: node.label,
          contents: node.contents,
        },
      });
      step2NodeIdMap.set(node.path, created.id);
    }

    const step2EdgesData = step2.edges.map((edge) => {
      const sourceNodeId = step2NodeIdMap.get(edge.sourcePath);
      const targetNodeId = step2NodeIdMap.get(edge.targetPath);

      if (!sourceNodeId || !targetNodeId)
        throw new Error(
          `Edge 생성 실패: 노드를 찾을 수 없습니다. (${edge.sourcePath} -> ${edge.targetPath})`,
        );

      return {
        visualizationId: visualization.id,
        diagramType: 'STEP2',
        sourceNodeId,
        targetNodeId,
      };
    });

    await this.prismaService.edge.createMany({
      data: step2EdgesData,
    });

    // graph 반환하기.
    const saved = await this.prismaService.visualization.findUnique({
      where: { id: visualization.id },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!saved) throw new Error('시각화 생성에 실패했습니다.');

    return this.buildGraphResponse(saved);
  }

  private buildGraphResponse(graph: {
    nodes: Array<{ diagramType: string } & any>;
    edges: Array<{ diagramType: string } & any>;
  }) {
    // BigInt를 string으로 변환
    const serializeItem = (item: any) => ({
      ...item,
      id: item.id?.toString(),
      visualizationId: item.visualizationId,
      sourceNodeId: item.sourceNodeId?.toString(),
      targetNodeId: item.targetNodeId?.toString(),
    });

    const groupByDiagram = <T extends { diagramType: string }>(items: T[]) => {
      return items.reduce<Record<string, any[]>>((acc, item) => {
        acc[item.diagramType] ??= [];
        acc[item.diagramType].push(serializeItem(item));
        return acc;
      }, {});
    };

    return {
      layoutState: 'INITIAL',
      nodes: groupByDiagram(graph.nodes),
      edges: groupByDiagram(graph.edges),
    };
  }
}

// {
//   "layoutState": "INITIAL", // or "FIXED"
//   "nodes": {
//     "diagram1": [...],
//     "diagram2": [...],
//   }
// }
