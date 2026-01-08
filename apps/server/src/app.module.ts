import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalysisModule } from './analysis/analysis.module';
import { AiModule } from './ai/ai.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    UploadModule,
    AnalysisModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
