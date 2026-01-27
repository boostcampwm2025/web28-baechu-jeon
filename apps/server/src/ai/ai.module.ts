import { Module } from '@nestjs/common';
import { GeminiClient } from './gemini/gemini.client';
import { GeminiService } from './gemini/gemini.service';
import { ProjectRepository } from 'src/projects/repository/project.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [GeminiClient, GeminiService, ProjectRepository],
  exports: [GeminiClient, GeminiService],
})
export class AiModule {}
