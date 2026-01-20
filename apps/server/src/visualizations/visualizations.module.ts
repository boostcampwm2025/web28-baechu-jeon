import { Module } from '@nestjs/common';
import { VisualizationsController } from './visualizations.controller';
import { VisualizationsService } from './visualizations.service';
import { VisualizationsBuilder } from './visualizations.builder';
import { VisualizationsMapper } from './mapper/visualizations.mapper';

@Module({
  controllers: [VisualizationsController],
  providers: [
    VisualizationsService,
    VisualizationsBuilder,
    VisualizationsMapper,
  ],
  exports: [VisualizationsService],
})
export class VisualizationsModule {}
