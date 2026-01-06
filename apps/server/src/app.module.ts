import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [AnalysisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
