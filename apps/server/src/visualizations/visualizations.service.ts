import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AnalysisResult, Prisma, EdgeType, NodeType } from '@prisma/client';
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
    const step2NodeMap = new Map<
      string | number,
      { id: bigint; type: NodeType | null }
    >();

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
          type: node.type || null,
        },
      });
      step2NodeMap.set(node.path, {
        id: created.id,
        type: node.type || null,
      });
      console.log(`✅ Step2 Node 생성: ${node.path} -> ${created.id}`);
    }

    const step2EdgesData = step2.edges.map((edge) => {
      const sourceNode = step2NodeMap.get(edge.sourcePath);
      const targetNode = step2NodeMap.get(edge.targetPath);

      if (!sourceNode || !targetNode)
        throw new Error(
          `Edge 생성 실패: 노드를 찾을 수 없습니다. (${edge.sourcePath} -> ${edge.targetPath})`,
        );

      // FOLDER -> FILE 관계면 DASHED, 아니면 SOLID
      const edgeType =
        sourceNode.type === NodeType.FOLDER && targetNode.type === NodeType.FILE
          ? EdgeType.DASHED
          : EdgeType.SOLID;

      return {
        visualizationId: visualization.id,
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        type: edgeType,
      };
    });

    await this.prismaService.edge.createMany({
      data: step2EdgesData,
    });

    // step1- 유저 시나리오
    for (const node of step1.nodes) {
      // relatedFolders의 경로를 노드 ID로 변환 (없으면 segment로 node 생성 후 매핑 보장)
      const relatedNodeIds =
        (
          await Promise.all(
            node.relatedPaths?.map(async (folderPath) => {
              const existingNode = step2NodeMap.get(folderPath);
              if (existingNode) return existingNode.id;

              const segmentLabel = folderPath.split('/').filter(Boolean).pop();
              if (!segmentLabel) {
                console.warn(
                  `⚠️ 매핑 실패: folderPath가 비어있습니다. (${folderPath})`,
                );
                return null;
              }

              const created = await this.prismaService.node.create({
                data: {
                  visualizationId: visualization.id,
                  diagramType: 'STEP2',
                  x: 0,
                  y: 0,
                  label: segmentLabel,
                  contents: folderPath,
                  type: NodeType.FOLDER,
                },
              });

              step2NodeMap.set(folderPath, {
                id: created.id,
                type: NodeType.FOLDER,
              });
              console.log(
                `✅ Step2 Node 추가 생성: ${folderPath} -> ${created.id}`,
              );

              return created.id;
            }) ?? [],
          )
        ).filter((id): id is bigint => id !== null) ?? [];

      await this.prismaService.node.create({
        data: {
          visualizationId: visualization.id,
          diagramType: 'STEP1',
          x: 0,
          y: 0,
          label: node.label,
          relatedNodeIds: relatedNodeIds,
          relatedPaths: node.relatedPaths,
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

    return saved.formattedData;
  }

  /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
  private buildGraphResponse(graph: any): Prisma.JsonObject {
    // BigInt를 string으로 변환
    const serializeBigIntArray = (values?: any[]) =>
      values?.map((value) =>
        typeof value === 'bigint' ? value.toString() : value,
      );

    const serializeNode = (node: any) => ({
      ...node,
      id: node.id.toString(),
      visualizationId: node.visualizationId?.toString(),
      relatedNodeIds: serializeBigIntArray(node.relatedNodeIds),
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
