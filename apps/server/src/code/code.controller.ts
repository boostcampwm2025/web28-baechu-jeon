import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { CodeService } from './code.service';

@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  /**
   * 분석 ID와 파일 경로로 해당 파일의 코드 설명(마크다운) 조회
   * GET /code/:analysisId?filePath=src/app/page.tsx
   */
  @Get(':analysisId')
  async getFileSummary(
    @Param('analysisId') analysisId: string,
    @Query('filePath') filePath: string | undefined,
  ) {
    if (!filePath || filePath.trim() === '') {
      throw new NotFoundException('filePath 쿼리 파라미터가 필요합니다.');
    }
    return this.codeService.getFileSummary(analysisId, filePath.trim());
  }
}
