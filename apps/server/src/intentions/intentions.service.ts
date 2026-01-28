import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

// AI 응답은 snake_case로 오므로 그에 맞춤
interface Step3Response {
  project_intent: {
    overview: string;
    purpose: string;
    key_features: string[];
    technology_stack: Record<string, string[]>;
    architectural_tendencies?: string;
  };
  user_stories?: Array<{
    story: string;
    related_folders: string[];
    rationale: string;
  }>;
}

@Injectable()
export class IntentionsService {
  constructor(private prisma: PrismaService) {}

  // 의도 조회
  async getIntentions(analysisId: string) {
    const analysis = await this.prisma.analysisResult.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) throw new NotFoundException('Analysis not found');

    const step3 = analysis.step3 as unknown as Step3Response | null;
    return this.formatResponse(analysis.id, step3);
  }

  // 의도 초기화 - 최초 데이터로 복구 및 purposes 테이블 동기화
  async resetIntentions(analysisId: string) {
    // 현재 분석 결과에서 analysisId 조회
    const currentAnalysis = await this.prisma.analysisResult.findUnique({
      where: { id: analysisId },
      select: { projectId: true },
    });

    if (!currentAnalysis) throw new NotFoundException('Analysis not found');

    // 해당 프로젝트의 첫 번째 분석 결과 조회
    const firstAnalysis = await this.prisma.analysisResult.findFirst({
      where: { projectId: currentAnalysis.projectId },
      orderBy: { createdAt: 'asc' },
    });

    if (!firstAnalysis)
      throw new NotFoundException('Original analysis not found');

    const formattedData = this.formatResponse(
      firstAnalysis.id,
      firstAnalysis.step3 as unknown as Step3Response | null,
    );

    await this.prisma.$transaction([
      // 해당 분석 결과와 연결된 purposes 삭제
      this.prisma.purpose.deleteMany({
        where: { analysisResultId: analysisId },
      }),
      // 원본 데이터를 purposes 테이블에 생성
      this.prisma.purpose.create({
        data: {
          contents: formattedData.contents.purpose,
          analysisResultId: analysisId,
        },
      }),
    ]);

    return formattedData;
  }

  private formatResponse(id: string, step3: Step3Response | null) {
    const intent = step3?.project_intent;

    if (!intent) {
      throw new NotFoundException('Intent data not found');
    }

    return {
      analysisId: id,
      status: 'completed',
      contents: {
        overview: intent.overview ?? '',
        purpose: intent.purpose ?? '',
        keyFeatures: intent.key_features ?? [],
        technologyStack: intent.technology_stack ?? {},
        architecturalTendencies: intent.architectural_tendencies ?? '',
      },
    };
  }
}
