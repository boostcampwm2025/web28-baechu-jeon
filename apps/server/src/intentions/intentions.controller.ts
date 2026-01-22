import { Controller, Get, Param } from '@nestjs/common';
import { IntentionsService } from './intentions.service';

@Controller('intentions')
export class IntentionsController {
  constructor(private readonly intentionsService: IntentionsService) {}

  @Get(':projectId')
  async getIntentions(@Param('projectId') projectId: string) {
    return await this.intentionsService.getProjectIntentions(projectId);
  }

  @Get(':projectId/reset')
  async resetIntentions(@Param('projectId') projectId: string) {
    return await this.intentionsService.resetProjectIntentions(projectId);
  }
}
