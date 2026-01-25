import { Module } from '@nestjs/common';
import { VisualizationsController } from './visualizations.controller';
import { VisualizationsService } from './visualizations.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VisualizationsController],
  providers: [VisualizationsService],
})
export class VisualizationsModule {}
