import { Controller, Get, Param } from '@nestjs/common';
import { IntentionsService } from './intentions.service';

@Controller('intentions')
export class IntentionsController {
  constructor(private readonly intentionsService: IntentionsService) {}

  @Get(':analysisId')
  async getIntentions(@Param('analysisId') analysisId: string) {
    return await this.intentionsService.getIntentions(analysisId);
  }

  @Get(':analysisId/reset')
  async resetIntentions(@Param('analysisId') analysisId: string) {
    return await this.intentionsService.resetIntentions(analysisId);
  }
}
