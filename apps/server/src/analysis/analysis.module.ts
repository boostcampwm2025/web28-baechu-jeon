import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisResultRepository } from './repositories/analysis-result.repository';
import { GeminiModule } from '../aiModel/providers/gemini/gemini.module';

@Module({
  imports: [GeminiModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisResultRepository],
  exports: [AnalysisService, AnalysisResultRepository],
})
export class AnalysisModule {}
