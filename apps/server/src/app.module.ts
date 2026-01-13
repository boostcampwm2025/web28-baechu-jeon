import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AnalysisModule } from './analysis/analysis.module';
import { AiModule } from './ai/ai.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [DatabaseModule, UploadModule, AnalysisModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
