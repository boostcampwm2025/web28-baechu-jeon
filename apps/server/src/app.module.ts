import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { SseModule } from './sse/sse.module';
import { AnalysesModule } from './analyses/analyses.module';
import { VisualizationsModule } from './visualizations/visualizations.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ProjectsModule,
    SseModule,
    AnalysesModule,
    VisualizationsModule,
  ],
})
export class AppModule {}
