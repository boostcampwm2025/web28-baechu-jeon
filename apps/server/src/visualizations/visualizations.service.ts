import { Injectable } from '@nestjs/common';
import { VisualizationsBuilder } from './visualizations.builder';
import { VisualizationsMapper } from './mapper/visualizations.mapper';

@Injectable()
export class VisualizationsService {
  constructor(
    private readonly builder: VisualizationsBuilder,
    private readonly mapper: VisualizationsMapper,
  ) {}
}
