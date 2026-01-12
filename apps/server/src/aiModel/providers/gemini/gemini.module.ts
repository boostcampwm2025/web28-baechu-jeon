import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiProvider } from './gemini.provider';

@Module({
  providers: [GeminiService, GeminiProvider],
  exports: [GeminiProvider],
})
export class GeminiModule {}
