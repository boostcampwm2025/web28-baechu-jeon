import { Module } from '@nestjs/common';
import { VisualizationsController } from './visualizations.controller';
import { VisualizationsService } from './visualizations.service';
import { VisualizationsBuilder } from './visualizations.builder';

@Module({
  controllers: [VisualizationsController],
  providers: [VisualizationsService, VisualizationsBuilder],
  exports: [VisualizationsService],
})
export class VisualizationsModule {}
