import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
