import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { VisualizationsService } from './visualizations.service';
import { Prisma } from '@prisma/client';

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
    @Body() formattedData: Prisma.JsonObject,
  ) {
    return await this.visualizationsService.updateGraph(
      visualizationId,
      formattedData,
    );
  }

  @Get(':visualizationId/reset')
  async resetVisualization(@Param('visualizationId') visualizationId: string) {
    return await this.visualizationsService.resetGraph(visualizationId);
  }
}
