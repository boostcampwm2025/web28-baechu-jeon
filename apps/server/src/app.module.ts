import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalysisController } from './analysis/analysis.controller';
import { AnalysisService } from './analysis/analysis.service';

@Module({
  imports: [],
  controllers: [AppController, AnalysisController],
  providers: [AppService, AnalysisService],
})
export class AppModule {}
