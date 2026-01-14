import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AnalysisResult, Prisma } from '@prisma/client';

@Injectable()
export class AnalysisResultRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdate(
    projectId: string,
    aiAnalysis: unknown,
  ): Promise<AnalysisResult> {
    return this.prisma.analysisResult.upsert({
      where: { projectId: projectId },
      update: { aiAnalysis: aiAnalysis as Prisma.InputJsonValue },
      create: {
        projectId: projectId,
        aiAnalysis: aiAnalysis as Prisma.InputJsonValue,
        // Mock data for now, as we don't have the real original/current json
        originalJson: {},
        currentJson: {},
      },
    });
  }

  async findByProjectId(projectId: string): Promise<AnalysisResult | null> {
    return this.prisma.analysisResult.findFirst({
      where: { projectId },
    });
  }
}
