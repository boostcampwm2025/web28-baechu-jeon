import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface PurposeContents {
  project_intent: {
    overview: string;
    purpose: string;
    key_features: string[];
    technology_stack: Record<string, string[]>;
    architectural_tendencies: string;
  };
}

@Injectable()
export class IntentionsService {
  constructor(private prisma: PrismaService) {}

  // 의도 조회
  async getProjectIntentions(projectId: string) {
    const analysis = await this.prisma.analysisResult.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) throw new NotFoundException('Analysis not found');

    const step3 = analysis.step3 as unknown as PurposeContents; //TODO: 추후 step4 데이터 사용
    return this.formatResponse(analysis.id, step3);
  }

  // 의도 초기화 - 최초 데이터로 복구 및 purposes 테이블 동기화
  async resetProjectIntentions(projectId: string) {
    const firstAnalysis = await this.prisma.analysisResult.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    if (!firstAnalysis)
      throw new NotFoundException('Original analysis not found');

    const formattedData = this.formatResponse(
      firstAnalysis.id,
      firstAnalysis.step3 as unknown as PurposeContents,
    );

    await this.prisma.$transaction([
      // 해당 프로젝트에 속한 모든 analysisResult와 연결된 purposes를 삭제
      this.prisma.purpose.deleteMany({
        where: {
          analysis_result: {
            projectId: projectId, // 프로젝트 ID로 필터링하여 일괄 삭제
          },
        },
      }),
      // 원본 데이터를 purposes 테이블에 생성
      this.prisma.purpose.create({
        data: {
          contents: formattedData.contents.purpose, //TODO: step4에서 가공할 데이터에 따라 달라짐(개요, 목적 등)
          analysis_result_id: firstAnalysis.id,
        },
      }),
    ]);

    return formattedData;
  }

  private formatResponse(id: string, step3: PurposeContents) {
    const intent = step3.project_intent; //TODO: 추후 step4 데이터 사용
    return {
      analysisId: id,
      status: 'completed',
      contents: {
        overview: intent.overview,
        purpose: intent.purpose,
        key_features: intent.key_features,
        technology_stack: intent.technology_stack,
        architectural_tendencies: intent.architectural_tendencies,
      },
    };
  }
}
