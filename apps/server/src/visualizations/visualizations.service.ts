import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AnalysisResult } from '@prisma/client';

@Injectable()
export class VisualizationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getGraph(analysisId: string) {
    // 그래프가 이미 있는지 중복 조회를 해야하나? ㅇㅇ 새로고침할 때 필요
    // analysisId(= analysisResultId)를 가진 Visualization이 이미 DB에 존재하는지 확인하고 싶다
    const exist = await this.prismaService.visualization.findFirst({
      where: { analysisResultId: analysisId },
      select: { id: true },
    });

    if (exist) {
      return await this.prismaService.visualization.findUnique({
        where: { id: exist.id },
        include: {
          nodes: true,
          edges: true,
        },
      });
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
    // build 호출하고
    // node, edge row 만들고
    // graph 반환하기.
  }
}
