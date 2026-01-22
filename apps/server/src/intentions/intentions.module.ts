import { Module } from '@nestjs/common';
import { IntentionsService } from './intentions.service';
import { IntentionsController } from './intentions.controller';

@Module({
  providers: [IntentionsService],
  controllers: [IntentionsController]
})
export class IntentionsModule {}
