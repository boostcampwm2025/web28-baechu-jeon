import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CodeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 분석 ID와 파일 경로로 해당 파일의 코드 설명(마크다운) 조회
   */
  async getFileSummary(
    analysisId: string,
    filePath: string,
  ): Promise<{ filePath: string; markdownContent: string }> {
    const summary = await this.prisma.fileSummary.findUnique({
      where: {
        analysisResultId_filePath: {
          analysisResultId: analysisId,
          filePath,
        },
      },
    });

    if (!summary) {
      throw new NotFoundException(
        `코드 설명을 찾을 수 없습니다. (analysisId: ${analysisId}, filePath: ${filePath})`,
      );
    }

    return {
      filePath: summary.filePath,
      markdownContent: summary.markdownContent,
    };
  }
}
