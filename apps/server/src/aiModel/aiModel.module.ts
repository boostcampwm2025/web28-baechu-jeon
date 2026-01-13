import { Module } from '@nestjs/common';
import { ClovaModule } from './providers/clova/clova.module';
import { GeminiModule } from './providers/gemini/gemini.module';
import { AiModelController } from './aiModel.controller';

@Module({
  imports: [ClovaModule, GeminiModule],
  controllers: [AiModelController],
  exports: [ClovaModule, GeminiModule],
})
export class AiModelModule {}
