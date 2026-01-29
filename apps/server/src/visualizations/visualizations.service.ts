import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AnalysisResult, Prisma } from '@prisma/client';
import { GraphBuilderService } from './graph-builder/graph-builder.service';
import { GraphBuildResult } from './graph-builder/types/graph-builder.type';

@Injectable()
export class VisualizationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly graphBuilderService: GraphBuilderService,
  ) {}

  async getGraph(analysisId: string) {
    // 그래프가 이미 있는지 확인
    const exist = await this.prismaService.visualization.findFirst({
      where: { analysisResultId: analysisId },
    });

    if (exist) return exist.formattedData;

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
        formattedData: {},
      },
    });

    // node랑 edge 저장해야 하니까 build 호출하고
    // TODO: 언제 await 쓸지 헷갈림
    const result: GraphBuildResult =
      this.graphBuilderService.build(analysisResult);

    const { step1, step2, step3 } = result;

    // node, edge row 만들고
    const step2NodeIdMap = new Map<string | number, bigint>();

    // step2- 폴더 가설
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
        sourceNodeId,
        targetNodeId,
      };
    });

    await this.prismaService.edge.createMany({
      data: step2EdgesData,
    });

    // step1- 유저 시나리오
    console.log('🔍 Step1 노드들의 관련 경로 (폴더·파일):');
    for (const node of step1.nodes) {
      // relatedPaths의 경로를 노드 ID로 변환 (존재하는 경로만 필터링)
      const relatedNodeIds =
        node.relatedPaths
          ?.map((folderPath) => {
            const nodeId = step2NodeIdMap.get(folderPath);
            if (!nodeId) {
              console.warn(
                `⚠️ 매핑 건너뛰기: "${folderPath}" not found in step2NodeIdMap`,
              );
              return null;
            }
            return nodeId.toString();
          })
          .filter((id): id is string => id !== null) ?? [];

      await this.prismaService.node.create({
        data: {
          visualizationId: visualization.id,
          diagramType: 'STEP1',
          x: 0,
          y: 0,
          label: node.label,
          relatedFolders: relatedNodeIds,
        },
      });
    }

    // step3- 기술 스택
    for (const node of step3.nodes) {
      await this.prismaService.node.create({
        data: {
          visualizationId: visualization.id,
          diagramType: 'STEP3',
          x: 0,
          y: 0,
          label: node.label,
          groups: node.groups,
        },
      });
    }

    // graph 반환하기.
    const saved = await this.prismaService.visualization.findUnique({
      where: { id: visualization.id },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!saved) throw new Error('시각화 생성에 실패했습니다.');

    const formattedGraph = this.buildGraphResponse(saved);

    // formattedData 필드에 저장
    await this.prismaService.visualization.update({
      where: { id: visualization.id },
      data: { formattedData: formattedGraph },
    });

    return formattedGraph;
  }

  async updateGraph(visualizationId: string, formattedData: Prisma.JsonObject) {
    // visualizationId 존재 확인
    const exist = await this.prismaService.visualization.findUnique({
      where: { id: visualizationId },
    });

    if (!exist) throw new Error('시각화를 찾을 수 없습니다.');

    // formattedData 업데이트
    await this.prismaService.visualization.update({
      where: { id: visualizationId },
      data: { formattedData },
    });

    return { visualizationId };
  }

  async resetGraph(visualizationId: string) {
    // visualizationId 존재 확인 및 formattedData 가져오기
    const saved = await this.prismaService.visualization.findUnique({
      where: { id: visualizationId },
    });

    if (!saved) throw new Error('시각화를 찾을 수 없습니다.');

    return {
      visualizationId,
      formattedData: saved.formattedData,
    };
  }

  /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
  private buildGraphResponse(graph: any): Prisma.JsonObject {
    // BigInt를 string으로 변환
    const serializeNode = (node: any) => ({
      ...node,
      id: node.id.toString(),
    });

    const serializeEdge = (edge: any) => ({
      ...edge,
      id: edge.id.toString(),
      visualizationId: edge.visualizationId.toString(),
      sourceNodeId: edge.sourceNodeId.toString(),
      targetNodeId: edge.targetNodeId.toString(),
    });

    const groupByDiagram = <T extends { diagramType: string }>(
      items: T[],
      serializer: (item: T) => Prisma.JsonValue,
    ) => {
      return items.reduce<Record<string, Prisma.JsonValue[]>>((acc, item) => {
        acc[item.diagramType] ??= [];
        acc[item.diagramType].push(serializer(item));
        return acc;
      }, {});
    };

    // TODO: layoutState 관리해야 함. 지금은 무조건 INITIAL로 줌
    return {
      layoutState: 'INITIAL',
      visualizationId: graph.id.toString(),
      nodes: groupByDiagram(graph.nodes, serializeNode),
      edges: graph.edges?.map(serializeEdge) ?? [],
    } as Prisma.JsonObject;
  }
  /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
}
