import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ClovaModule } from './providers/clova/clova.module';

@Module({
  imports: [ClovaModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [ClovaModule],
})
export class AiModule {}

