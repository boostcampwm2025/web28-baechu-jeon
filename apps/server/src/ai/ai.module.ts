import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ClovaModule } from './providers/clova/clova.module';
import { GeminiModule } from './providers/gemini/gemini.module';

@Module({
  imports: [ClovaModule, GeminiModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [ClovaModule, GeminiModule],
})
export class AiModule {}

