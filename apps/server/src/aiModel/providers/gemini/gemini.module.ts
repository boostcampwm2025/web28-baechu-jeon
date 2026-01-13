import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiProvider } from './gemini.provider';
import { ProjectRepository } from '../../../upload/repositories/project.repository';

@Module({
  providers: [GeminiService, GeminiProvider, ProjectRepository],
  exports: [GeminiProvider],
})
export class GeminiModule {}
