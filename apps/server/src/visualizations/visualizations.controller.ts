import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { VisualizationsService } from './visualizations.service';

@Controller('visualizations')
export class VisualizationsController {
  constructor(private readonly visualizationsService: VisualizationsService) {}

  @Get(':analysisId')
  async getVisualization(@Param('analysisId') analysisId: string) {
    return await this.visualizationsService.getGraph(analysisId);
  }

  @Put(':visualizationId')
  async updateVisualization(
    @Param('visualizationId') visualizationId: string,
    @Body() body: { formattedData: any },
  ) {
    return await this.visualizationsService.updateGraph(
      visualizationId,
      body.formattedData,
    );
  }

  @Get(':visualizationId/reset')
  async resetVisualization(@Param('visualizationId') visualizationId: string) {
    return await this.visualizationsService.resetGraph(visualizationId);
  }
}
