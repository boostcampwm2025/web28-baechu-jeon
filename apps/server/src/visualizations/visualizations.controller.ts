import { Controller, Get, Param } from '@nestjs/common';
import { VisualizationsService } from './visualizations.service';

@Controller('visualizations')
export class VisualizationsController {
  constructor(private readonly visualizationsService: VisualizationsService) {}

  @Get(':analysisId')
  async getVisualization(@Param('analysisId') analysisId: string) {
    return await this.visualizationsService.getGraph(analysisId);
  }
}
