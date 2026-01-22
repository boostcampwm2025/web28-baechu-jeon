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
